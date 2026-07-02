import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GineeService, type GineeOrder } from './ginee.service';

// Golden Rule #4: revenue via Ginee, EXCLUDE order Cancelled/Returned.
const EXCLUDED = new Set(['CANCELLED', 'RETURNED', 'CANCEL', 'RETURN']);

@Injectable()
export class RevenueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ginee: GineeService,
  ) {}

  // REV-01: lihat revenue untuk tanggal (default hari ini). Pakai cache jika ada.
  async get(dateStr?: string) {
    const date = this.normalizeDate(dateStr);
    const cached = await this.prisma.revenueSnapshot.findUnique({ where: { date } });
    if (cached) return cached.data;
    return this.refresh(dateStr);
  }

  // REV-02: tarik ulang dari Ginee + simpan snapshot.
  async refresh(dateStr?: string) {
    const date = this.normalizeDate(dateStr);
    const orders = await this.ginee.listOrders();
    const summary = this.aggregate(orders, date);

    await this.prisma.revenueSnapshot.upsert({
      where: { date },
      create: { date, data: summary as Prisma.InputJsonValue },
      update: { data: summary as Prisma.InputJsonValue },
    });
    return summary;
  }

  // Webhook cache (POST /revenue/cache) — payload sudah teragregasi dari luar.
  async cache(payload: { date: string; data: Record<string, unknown> }) {
    const date = this.normalizeDate(payload.date);
    await this.prisma.revenueSnapshot.upsert({
      where: { date },
      create: { date, data: payload.data as Prisma.InputJsonValue },
      update: { data: payload.data as Prisma.InputJsonValue },
    });
    return { ok: true };
  }

  private aggregate(orders: GineeOrder[], date: Date) {
    const valid = orders.filter(
      (o) => !EXCLUDED.has((o.status ?? '').toUpperCase()),
    );

    const revenue = valid.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
    const orderCount = valid.length;
    const aov = orderCount > 0 ? revenue / orderCount : 0;

    const perChannel: Record<string, number> = {};
    const perSku: Record<string, { nama: string; revenue: number }> = {};
    for (const o of valid) {
      const ch = (o.channel ?? 'web').toLowerCase();
      perChannel[ch] = (perChannel[ch] ?? 0) + (o.totalAmount ?? 0);
      const sku = o.sku ?? o.productName ?? 'unknown';
      perSku[sku] = {
        nama: o.productName ?? sku,
        revenue: (perSku[sku]?.revenue ?? 0) + (o.totalAmount ?? 0),
      };
    }
    const topSku = Object.values(perSku)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // REV-03: anomali sederhana (turun >30% vs snapshot kemarin).
    const anomali: { tipe: string; catatan: string }[] = [];

    return {
      tanggal: date.toISOString().slice(0, 10),
      revenue: { value: revenue },
      order: { value: orderCount },
      aov: { value: Math.round(aov) },
      top_sku: topSku,
      per_channel: perChannel,
      anomali,
    };
  }

  private normalizeDate(dateStr?: string): Date {
    const d = dateStr ? new Date(dateStr) : new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
}
