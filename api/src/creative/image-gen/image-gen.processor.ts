import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { KieaiService } from './kieai.service';
import { ImageGenService, IMAGE_GEN_QUEUE } from './image-gen.service';

interface ReconcileJob {
  imageGenId: string;
}

// Fallback kalau webhook kie.ai telat/gagal reach server. BullMQ attempts+backoff
// bawaan yang menangani retry -- job ini cuma sekali cek per attempt.
@Processor(IMAGE_GEN_QUEUE)
export class ImageGenProcessor extends WorkerHost {
  private readonly log = new Logger(ImageGenProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kieai: KieaiService,
    private readonly imageGen: ImageGenService,
  ) {
    super();
  }

  async process(job: Job<ReconcileJob>): Promise<void> {
    const { imageGenId } = job.data;
    const row = await this.prisma.imageGeneration.findUnique({ where: { id: imageGenId } });
    if (!row || row.status !== 'pending') return; // webhook sudah datang duluan
    if (!row.taskId) return; // createTask gagal total, tak ada taskId utk dicek

    const result = await this.kieai.getTaskStatus(row.taskId);
    if (result.status === 'pending') {
      // Masih diproses kie.ai -- lempar error supaya BullMQ retry attempt
      // berikutnya (backoff), sampai attempts habis lalu ditandai error final.
      if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
        await this.imageGen.applyResult(row.taskId, {
          status: 'error',
          resultUrls: [],
          errorMessage: 'Timeout menunggu kie.ai (reconciliation habis).',
        });
        return;
      }
      throw new Error('kie.ai masih memproses, retry reconciliation.');
    }

    await this.imageGen.applyResult(row.taskId, result);
    this.log.log(`Reconciliation selesai untuk ${imageGenId}: ${result.status}`);
  }
}
