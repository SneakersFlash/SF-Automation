import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateBrandProfileDto, UpdateBrandProfileDto } from './dto/brand-profile.dto';

@Injectable()
export class BrandProfileService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.brandProfile.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async get(id: string) {
    const bp = await this.prisma.brandProfile.findUnique({ where: { id } });
    if (!bp) throw new NotFoundException('Brand profile tidak ditemukan.');
    return bp;
  }

  // BRAND-01: buat. Jika default → pastikan hanya satu default.
  async create(dto: CreateBrandProfileDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.brandProfile.updateMany({ data: { isDefault: false } });
      }
      return tx.brandProfile.create({ data: { ...dto, platforms: dto.platforms ?? [] } });
    });
  }

  // BRAND-02/04: update (termasuk set default).
  async update(id: string, dto: UpdateBrandProfileDto) {
    await this.get(id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.brandProfile.updateMany({ data: { isDefault: false } });
      }
      return tx.brandProfile.update({ where: { id }, data: dto });
    });
  }

  // BRAND-04: tetapkan default (unset lainnya).
  async setDefault(id: string) {
    await this.get(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.brandProfile.updateMany({ data: { isDefault: false } });
      return tx.brandProfile.update({ where: { id }, data: { isDefault: true } });
    });
  }

  // BRAND-03: hapus (Owner only — enforce di controller).
  async remove(id: string) {
    await this.get(id);
    await this.prisma.brandProfile.delete({ where: { id } });
    return { ok: true };
  }
}
