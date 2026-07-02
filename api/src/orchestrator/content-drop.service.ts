import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

export const CONTENT_DROP_QUEUE = 'content-drop';

// CRE-04: Content Drop (orchestrator async — brief+copy+humanize+ads).
@Injectable()
export class ContentDropService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(CONTENT_DROP_QUEUE) private readonly queue: Queue,
  ) {}

  // Buat pack (processing) + enqueue job. Kembalikan packId untuk polling.
  async start(subjectId: string, userId: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Subject tidak ditemukan.');

    const pack = await this.prisma.contentPack.create({
      data: { subjectId, status: 'processing', data: {} },
    });
    await this.queue.add(
      'run',
      { packId: pack.id, subjectId, userId },
      { attempts: 1, removeOnComplete: true, removeOnFail: true },
    );
    return { packId: pack.id, status: pack.status };
  }

  async get(packId: string) {
    const pack = await this.prisma.contentPack.findUnique({ where: { id: packId } });
    if (!pack) throw new NotFoundException('Content pack tidak ditemukan.');
    return pack;
  }
}
