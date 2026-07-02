import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateUserDto } from './dto/create-user.dto';

const SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // USER-03: daftar semua user.
  list() {
    return this.prisma.user.findMany({ select: SELECT, orderBy: { createdAt: 'asc' } });
  }

  // USER-01: buat akun (default Member).
  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email sudah terdaftar.');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role ?? 'member',
        passwordHash,
      },
      select: SELECT,
    });
  }

  // USER-02: aktif/nonaktif. Cegah menonaktifkan Owner terakhir yang aktif.
  async setActive(id: string, isActive: boolean, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan.');
    if (!isActive && id === actorId) {
      throw new BadRequestException('Tidak bisa menonaktifkan akun sendiri.');
    }
    if (!isActive && user.role === 'owner') {
      const activeOwners = await this.prisma.user.count({
        where: { role: 'owner', isActive: true },
      });
      if (activeOwners <= 1) {
        throw new BadRequestException('Minimal harus ada satu Owner aktif.');
      }
    }
    return this.prisma.user.update({ where: { id }, data: { isActive }, select: SELECT });
  }
}
