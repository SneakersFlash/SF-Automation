// Seed akun Owner awal (CommonJS — dijalankan `node prisma/seed.js` di container).
// Override via env: SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_OWNER_EMAIL || 'owner@sneakersflash.com';
  const password = process.env.SEED_OWNER_PASSWORD || 'ChangeMe123!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Owner ${email} sudah ada — skip.`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name: 'Owner', role: 'owner', passwordHash, isActive: true },
  });
  console.log(`Owner dibuat: ${email} / ${password}  (WAJIB ganti password setelah login).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
