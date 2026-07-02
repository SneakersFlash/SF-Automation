import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// AUD-02: lihat riwayat Generation & aksi ads (AUD-01 dicatat inline oleh service lain).
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  generations(take = 100) {
    return this.prisma.generation.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        skill: true,
        status: true,
        userId: true,
        brandProfileId: true,
        createdAt: true,
      },
    });
  }

  actions(take = 100) {
    return this.prisma.adAction.findMany({ orderBy: { createdAt: 'desc' }, take });
  }
}
