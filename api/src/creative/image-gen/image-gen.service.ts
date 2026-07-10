import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { KieaiService } from './kieai.service';
import type { GenerateImageDto } from './dto/image-gen.dto';

export const IMAGE_GEN_QUEUE = 'image-gen-reconcile';
export const IMAGE_GEN_RECONCILE_DELAY_MS = 90_000;

// CRE-06: orkestrasi generate gambar via kie.ai. kie.ai sudah handle async-nya
// sendiri (taskId + webhook) -- job BullMQ di sini cuma reconciliation fallback
// (lihat image-gen.processor.ts), bukan worker generate utama.
@Injectable()
export class ImageGenService {
  private readonly log = new Logger(ImageGenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly kieai: KieaiService,
    @InjectQueue(IMAGE_GEN_QUEUE) private readonly queue: Queue,
  ) {}

  async generate(dto: GenerateImageDto, userId: string) {
    const mode = dto.referenceImageUrls?.length ? 'image_edit' : 'text_to_image';
    const row = await this.prisma.imageGeneration.create({
      data: {
        mode,
        prompt: dto.prompt,
        negativePrompt: dto.negativePrompt,
        size: dto.size,
        referenceImageUrls: dto.referenceImageUrls ?? [],
        status: 'pending',
        brandProfileId: dto.brandProfileId,
        subjectId: dto.subjectId,
        generationId: dto.generationId,
        userId,
      },
    });

    const callbackSecret = this.config.get<string>('KIEAI_CALLBACK_SECRET');
    const publicBase = this.config.get<string>('PUBLIC_API_BASE_URL');
    const callBackUrl =
      publicBase && callbackSecret
        ? `${publicBase}/api/creative/images/callback?secret=${encodeURIComponent(callbackSecret)}`
        : undefined;

    try {
      const { taskId } = await this.kieai.createTask({
        prompt: dto.prompt,
        negativePrompt: dto.negativePrompt,
        size: dto.size,
        filesUrl: dto.referenceImageUrls,
        callBackUrl,
      });
      const updated = await this.prisma.imageGeneration.update({
        where: { id: row.id },
        data: { taskId },
      });
      // Reconciliation fallback -- kalau webhook telat/gagal, job ini re-poll.
      await this.queue.add(
        'reconcile',
        { imageGenId: row.id },
        {
          delay: IMAGE_GEN_RECONCILE_DELAY_MS,
          attempts: 3,
          backoff: { type: 'exponential', delay: 15000 },
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      return updated;
    } catch (e) {
      this.log.warn(`Generate image gagal: ${String(e)}`);
      return this.prisma.imageGeneration.update({
        where: { id: row.id },
        data: { status: 'error', errorMessage: (e as Error).message },
      });
    }
  }

  async get(id: string) {
    const row = await this.prisma.imageGeneration.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Image generation tidak ditemukan.');
    return row;
  }

  // Dipanggil webhook controller & processor reconciliation. Idempoten via
  // guard status:'pending' di WHERE -- aman kalau webhook & job reconcile
  // datang bersamaan (siapa duluan menang, yang telat jadi no-op).
  async applyResult(
    taskId: string,
    result: { status: 'pending' | 'done' | 'error'; resultUrls: string[]; errorMessage?: string },
  ) {
    const { count } = await this.prisma.imageGeneration.updateMany({
      where: { taskId, status: 'pending' },
      data: {
        status: result.status,
        resultImageUrls: result.resultUrls,
        errorMessage: result.errorMessage,
      },
    });
    if (count === 0) {
      this.log.debug(`applyResult no-op untuk taskId=${taskId} (sudah settled atau tak dikenal).`);
    }
    return count;
  }
}
