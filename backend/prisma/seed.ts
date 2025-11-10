import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const passwordHash = await argon2.hash('Passw0rd!');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      id: '00000000-0000-0000-4000-800000000001', // UUIDv4形式
      clerkId: 'local_admin_001',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Cats
  const cats = [
    // Males
    { id: 'a1111111-1111-4111-8111-111111111111', name: 'Alpha', gender: 'MALE', birthDate: new Date('2023-03-15') },
    { id: 'b1111111-1111-4111-8111-111111111111', name: 'Bruno', gender: 'MALE', birthDate: new Date('2023-04-22') },
    { id: 'c1111111-1111-4111-8111-111111111111', name: 'Charlie', gender: 'MALE', birthDate: new Date('2023-05-08') },
    { id: 'd1111111-1111-4111-8111-111111111111', name: 'David', gender: 'MALE', birthDate: new Date('2023-06-14') },
    { id: 'e1111111-1111-4111-8111-111111111111', name: 'Ethan', gender: 'MALE', birthDate: new Date('2023-09-03') },
    { id: 'f1111111-1111-4111-8111-111111111111', name: 'Felix', gender: 'MALE', birthDate: new Date('2023-11-28') },
    { id: 'a1111111-1111-4111-9111-111111111111', name: 'Gabriel', gender: 'MALE', birthDate: new Date('2024-01-05') },
    // Females
    { id: 'a2222222-2222-4222-8222-222222222222', name: 'Anna', gender: 'FEMALE', birthDate: new Date('2023-02-18') },
    { id: 'b2222222-2222-4222-8222-222222222222', name: 'Bella', gender: 'FEMALE', birthDate: new Date('2023-03-27') },
    { id: 'c2222222-2222-4222-8222-222222222222', name: 'Clara', gender: 'FEMALE', birthDate: new Date('2023-05-11') },
    { id: 'd2222222-2222-4222-8222-222222222222', name: 'Diana', gender: 'FEMALE', birthDate: new Date('2023-07-19') },
    { id: 'e2222222-2222-4222-8222-222222222222', name: 'Emma', gender: 'FEMALE', birthDate: new Date('2023-08-25') },
    { id: 'f2222222-2222-4222-8222-222222222222', name: 'Fiona', gender: 'FEMALE', birthDate: new Date('2023-10-12') },
    { id: 'a2222222-2222-4222-9222-222222222222', name: 'Grace', gender: 'FEMALE', birthDate: new Date('2024-01-30') },
  ];

  for (const cat of cats) {
    await prisma.cat.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        ...cat,
        isInHouse: true,
      },
    });
  }

  console.log(`✅ ${cats.length} cats created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
