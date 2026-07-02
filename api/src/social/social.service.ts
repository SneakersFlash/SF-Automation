import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ConnectAccountDto } from './dto/social.dto';

const PLATFORMS = ['instagram', 'tiktok'] as const;

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  listAccounts(brandProfileId?: string) {
    return this.prisma.socialAccount.findMany({
      where: brandProfileId ? { brandProfileId } : undefined,
      select: {
        id: true,
        brandProfileId: true,
        platform: true,
        accountId: true,
        handle: true,
        connectedAt: true,
        // tokenRef sengaja TIDAK di-select — jangan bocor ke UI.
      },
    });
  }

  // SOC-01: simpan koneksi akun (tokenRef saja, bukan token plain).
  connect(platform: string, dto: ConnectAccountDto) {
    if (!PLATFORMS.includes(platform as (typeof PLATFORMS)[number])) {
      throw new NotFoundException('Platform harus instagram atau tiktok.');
    }
    return this.prisma.socialAccount.upsert({
      where: {
        brandProfileId_platform_accountId: {
          brandProfileId: dto.brandProfileId,
          platform,
          accountId: dto.accountId,
        },
      },
      create: {
        brandProfileId: dto.brandProfileId,
        platform,
        accountId: dto.accountId,
        handle: dto.handle,
        tokenRef: dto.tokenRef,
      },
      update: { handle: dto.handle, tokenRef: dto.tokenRef },
      select: { id: true, platform: true, accountId: true, handle: true },
    });
  }

  // SOC-02: disconnect.
  async disconnect(id: string) {
    const acc = await this.prisma.socialAccount.findUnique({ where: { id } });
    if (!acc) throw new NotFoundException('Akun tidak ditemukan.');
    await this.prisma.socialSnapshot.deleteMany({ where: { socialAccountId: id } });
    await this.prisma.socialAccount.delete({ where: { id } });
    return { ok: true };
  }

  // SOC-03: performa dari snapshot tersimpan. Fetch live IG/TikTok saat creds ada.
  async performance(brandProfileId?: string, from?: string, to?: string) {
    const accounts = await this.prisma.socialAccount.findMany({
      where: brandProfileId ? { brandProfileId } : undefined,
      include: {
        snapshots: {
          where: {
            date: {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });
    return {
      note:
        accounts.length === 0
          ? 'Belum ada akun terhubung. Hubungkan akun di Settings → Social Accounts.'
          : undefined,
      accounts: accounts.map((a) => ({
        id: a.id,
        platform: a.platform,
        handle: a.handle,
        latest: a.snapshots[0]?.metrics ?? null,
        topPosts: a.snapshots[0]?.topPosts ?? null,
        history: a.snapshots,
      })),
    };
  }
}
