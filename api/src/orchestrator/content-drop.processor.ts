import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OpenclawService } from '../openclaw/openclaw.service';
import { buildBrandContext } from '../brand-profile/brand-context';
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

    // Brand context dari subject (fallback default) → output on-brand, konsisten
    // dengan flow interaktif CreativeService.
    const bp = subject.brandProfileId
      ? await this.prisma.brandProfile.findUnique({ where: { id: subject.brandProfileId } })
      : await this.prisma.brandProfile.findFirst({ where: { isDefault: true } });
    const brand = buildBrandContext(bp);

    const subjectPayload = {
      name: subject.name,
      goal: subject.goal,
      details: subject.details,
    };

    // Kontrak content-brief v2: satu item per call. Susun item dari subject.
    const baseItem = {
      productName: subject.name,
      description:
        subject.details != null ? JSON.stringify(subject.details) : '',
      goal: subject.goal ?? '',
      message: '',
      cta: '',
      visualStyle: '',
    };

    try {
      const [briefStory, briefCarousel] = await Promise.all([
        this.openclaw.run<Record<string, unknown>>('content-brief', {
          brand,
          item: { ...baseItem, contentType: 'story' },
        }),
        this.openclaw.run<Record<string, unknown>>('content-brief', {
          brand,
          item: { ...baseItem, contentType: 'carousel' },
        }),
      ]);
      const brief = { story: briefStory, carousel: briefCarousel };
      const copy = await this.openclaw.run<Record<string, unknown>>('copywriting', {
        brand,
        subject: subjectPayload,
      });
      const humanized = await this.openclaw.chat(
        `Jalankan skill "humanize" pada teks berikut, balas teks natural saja:\n${JSON.stringify(copy)}`,
        { agentId: 'sf-humanize' },
      );
      const ads = await this.openclaw.run<unknown[]>('ads-generate', {
        brand,
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
