import { SetMetadata } from '@nestjs/common';

export type Role = 'owner' | 'member';

export const ROLES_KEY = 'roles';

// Tandai handler/controller dengan peran yang diizinkan (SRS §10, IA §7).
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
