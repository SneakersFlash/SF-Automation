import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  list(brandProfileId?: string) {
    return this.prisma.subject.findMany({
      where: brandProfileId ? { brandProfileId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const s = await this.prisma.subject.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Subject tidak ditemukan.');
    return s;
  }

  // SUBJ-01/02: simpan subject untuk dipakai lintas panel.
  create(dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        name: dto.name,
        brandProfileId: dto.brandProfileId,
        goal: dto.goal,
        details: (dto.details ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
