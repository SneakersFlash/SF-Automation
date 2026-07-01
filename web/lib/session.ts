import type { Role } from './nav';

// Fase 2 placeholder — auth asli (login + sesi, UF-01) diwire di Fase 3.
// Sementara default Owner supaya seluruh menu terlihat saat skeleton.
export const currentUser: { name: string; role: Role } = {
  name: 'Owner',
  role: 'owner',
};
