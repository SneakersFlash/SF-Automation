import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OpenclawService } from '../openclaw/openclaw.service';
import { CONTENT_DROP_QUEUE } from './content-drop.service';

interface DropJob {
  packId: string;
  subjectId: string;
  userId: string;
}

// Worker: jalankan skill berurutan lalu simpan hasil ke ContentPack.
@Processor(CONTENT_DROP_QUEUE)
export class ContentDropProcessor extends WorkerHost {
  private readonly log = new Logger(ContentDropProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openclaw: OpenclawService,
  ) {
    super();
  }

  async process(job: Job<DropJob>): Promise<void> {
    const { packId, subjectId } = job.data;
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      await this.fail(packId, 'Subject hilang saat proses.');
      return;
    }

    const subjectPayload = {
      name: subject.name,
      goal: subject.goal,
      details: subject.details,
    };

    try {
      const brief = await this.openclaw.run<{ briefs: Record<string, string> }>(
        'content-brief',
        { subject: subjectPayload, formats: ['carousel', 'story', 'static_ad'] },
      );
      const copy = await this.openclaw.run<Record<string, unknown>>('copywriting', {
        subject: subjectPayload,
      });
      const humanized = await this.openclaw.chat(
        `Jalankan skill "humanize" pada teks berikut, balas teks natural saja:\n${JSON.stringify(copy)}`,
      );
      const ads = await this.openclaw.run<unknown[]>('ads-generate', {
        subject: subjectPayload,
      });

      await this.prisma.contentPack.update({
        where: { id: packId },
        data: {
          status: 'done',
          data: {
            brief,
            copy,
            humanized: humanized.trim(),
            ads,
          } as Prisma.InputJsonValue,
        },
      });
      this.log.log(`Content pack ${packId} selesai.`);
    } catch (e) {
      await this.fail(packId, (e as Error).message);
    }
  }

  private async fail(packId: string, message: string) {
    this.log.warn(`Content pack ${packId} gagal: ${message}`);
    await this.prisma.contentPack.update({
      where: { id: packId },
      data: { status: 'error', data: { error: message } as Prisma.InputJsonValue },
    });
  }
}
