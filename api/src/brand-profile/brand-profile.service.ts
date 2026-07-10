import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateBrandProfileDto, UpdateBrandProfileDto } from './dto/brand-profile.dto';

type Tx = Prisma.TransactionClient;

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

  // BRAND-02/04: update (termasuk set default). isDefault:false eksplisit pada
  // profil yang sedang default TIDAK dibiarkan bikin nol default — invariant
  // dijaga via ensureOneDefault (jangan sampai "Default" senyap tanpa brand).
  async update(id: string, dto: UpdateBrandProfileDto) {
    await this.get(id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.brandProfile.updateMany({ data: { isDefault: false } });
      }
      const updated = await tx.brandProfile.update({ where: { id }, data: dto });
      if (dto.isDefault === false) await this.ensureOneDefault(tx);
      return updated;
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

  // BRAND-03: hapus (Owner only — enforce di controller). Kalau yang dihapus
  // adalah default, promote profil lain (tertua) jadi default baru — jangan
  // biarkan "Default" jadi tanpa brand context secara diam-diam.
  async remove(id: string) {
    await this.get(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.brandProfile.delete({ where: { id } });
      await this.ensureOneDefault(tx);
    });
    return { ok: true };
  }

  // Invariant: selalu ada tepat satu BrandProfile isDefault=true (kalau masih
  // ada profil sama sekali). Kalau nol default tersisa, promote yang tertua.
  private async ensureOneDefault(tx: Tx) {
    const stillDefault = await tx.brandProfile.findFirst({ where: { isDefault: true } });
    if (stillDefault) return;
    const next = await tx.brandProfile.findFirst({ orderBy: { createdAt: 'asc' } });
    if (next) await tx.brandProfile.update({ where: { id: next.id }, data: { isDefault: true } });
  }
}
