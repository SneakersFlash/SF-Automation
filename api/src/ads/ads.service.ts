import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OpenclawService } from '../openclaw/openclaw.service';
import type { CreateAdActionDto, GenerateAdsDto } from './dto/ads.dto';

interface AdConcept {
  angle: string;
  hook: string;
  primary_text: string;
  headline: string;
  cta: string;
  visual?: string;
}

@Injectable()
export class AdsService {
  private readonly log = new Logger(AdsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openclaw: OpenclawService,
  ) {}

  // ADS-01: 4 concept via skill ads-generate → simpan Generation + AdVariant.
  async generate(dto: GenerateAdsDto, userId: string) {
    const concepts = await this.openclaw.run<AdConcept[]>('ads-generate', {
      subject: dto.subject,
    });

    const variantCreate = concepts.map((c) => ({
      angle: c.angle,
      hook: c.hook,
      primaryText: c.primary_text,
      headline: c.headline,
      cta: c.cta,
      visual: c.visual,
    }));
    const data = (brandProfileId?: string) => ({
      skill: 'ads-generate',
      brandProfileId,
      userId,
      input: dto as unknown as Prisma.InputJsonValue,
      output: concepts as unknown as Prisma.InputJsonValue,
      status: 'done',
      adVariants: { create: variantCreate },
    });

    try {
      return await this.prisma.generation.create({
        data: data(dto.brandProfileId),
        include: { adVariants: true },
      });
    } catch (e) {
      // brandProfileId basi/terhapus → FK violation. Jangan gagalkan generate;
      // simpan tanpa link brand (sejalan dgn CreativeService.logGeneration).
      this.log.warn(`Ads generate: simpan tanpa brandProfileId (${String(e)}).`);
      return this.prisma.generation.create({
        data: data(undefined),
        include: { adVariants: true },
      });
    }
  }

  // ADS-02: Performance Review (read-only). Butuh Meta/TikTok Ads creds.
  // Tanpa creds → daftar aksi & variant lokal saja (belum ada metrik live).
  async performance(_from?: string, _to?: string) {
    const variants = await this.prisma.adVariant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return {
      note: 'Metrik live Meta/TikTok Ads belum terhubung (butuh kredensial Owner).',
      variants,
    };
  }

  // ADS-03: ajukan aksi berbayar → pending_approval (default read-only).
  createAction(dto: CreateAdActionDto) {
    if (!['publish', 'scale'].includes(dto.type)) {
      throw new BadRequestException('Tipe aksi harus publish atau scale.');
    }
    return this.prisma.adAction.create({
      data: {
        type: dto.type,
        payload: dto.payload as Prisma.InputJsonValue,
        status: 'pending_approval',
      },
    });
  }

  listActions() {
    return this.prisma.adAction.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // ADS-04: approve & eksekusi (Owner only — enforce di controller).
  // Golden Rule #3: budget naik >30% wajib konfirmasi ulang (confirm=true).
  async approve(id: string, ownerId: string, confirm: boolean) {
    const action = await this.prisma.adAction.findUnique({ where: { id } });
    if (!action) throw new NotFoundException('Aksi tidak ditemukan.');
    if (action.status !== 'pending_approval') {
      throw new BadRequestException('Aksi sudah diproses.');
    }

    const payload = action.payload as { budget?: number; prevBudget?: number };
    if (
      typeof payload.budget === 'number' &&
      typeof payload.prevBudget === 'number' &&
      payload.prevBudget > 0
    ) {
      const increasePct = ((payload.budget - payload.prevBudget) / payload.prevBudget) * 100;
      if (increasePct > 30 && !confirm) {
        throw new ForbiddenException(
          `Budget naik ${increasePct.toFixed(0)}% (>30%). Konfirmasi ulang untuk lanjut.`,
        );
      }
    }

    // NOTE: eksekusi ke Meta/TikTok Ads API dilakukan di sini saat creds tersedia.
    return this.prisma.adAction.update({
      where: { id },
      data: { status: 'executed', approvedBy: ownerId, executedAt: new Date() },
    });
  }

  async reject(id: string, ownerId: string) {
    const action = await this.prisma.adAction.findUnique({ where: { id } });
    if (!action) throw new NotFoundException('Aksi tidak ditemukan.');
    if (action.status !== 'pending_approval') {
      throw new BadRequestException('Aksi sudah diproses.');
    }
    return this.prisma.adAction.update({
      where: { id },
      data: { status: 'rejected', approvedBy: ownerId },
    });
  }
}
