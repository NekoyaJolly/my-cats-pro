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

  // --- Tag category / group / tags for testing ---
  // Create TagCategory 'Breeding' (key: 'breeding')
  const tagCategory = await prisma.tagCategory.upsert({
    where: { key: 'breeding' },
    update: { name: 'Breeding' },
    create: {
      key: 'breeding',
      name: 'Breeding',
      description: 'Breeding related tags',
      scopes: ['cats'],
    },
  });

  // Create TagGroup 'Body-Type' under the category
  let tagGroup = await prisma.tagGroup.findFirst({
    where: { categoryId: tagCategory.id, name: 'Body-Type' },
  });
  if (!tagGroup) {
    tagGroup = await prisma.tagGroup.create({
      data: {
        categoryId: tagCategory.id,
        name: 'Body-Type',
        description: 'Body type related tags (短足/長足)',
      },
    });
  }

  // Create Tags '短足' and '長足'
  let tagShort = await prisma.tag.findFirst({ where: { groupId: tagGroup.id, name: '短足' } });
  if (!tagShort) {
    tagShort = await prisma.tag.create({
      data: {
        groupId: tagGroup.id,
        name: '短足',
        color: '#F97316',
        textColor: '#FFFFFF',
      },
    });
  }

  let tagLong = await prisma.tag.findFirst({ where: { groupId: tagGroup.id, name: '長足' } });
  if (!tagLong) {
    tagLong = await prisma.tag.create({
      data: {
        groupId: tagGroup.id,
        name: '長足',
        color: '#06B6D4',
        textColor: '#FFFFFF',
      },
    });
  }

  console.log('✅ Tag category/group/tags created:', tagCategory.key, tagGroup.name, tagShort.name, tagLong.name);

  // --- Assign tags to sample cats ---
  // Use Alpha (male) and Anna (female) created above
  const maleCatId = 'a1111111-1111-4111-8111-111111111111'; // Alpha
  const femaleCatId = 'a2222222-2222-4222-8222-222222222222'; // Anna

  await prisma.catTag.upsert({
    where: { catId_tagId: { catId: maleCatId, tagId: tagShort.id } },
    update: {},
    create: { catId: maleCatId, tagId: tagShort.id },
  });

  await prisma.catTag.upsert({
    where: { catId_tagId: { catId: femaleCatId, tagId: tagLong.id } },
    update: {},
    create: { catId: femaleCatId, tagId: tagLong.id },
  });

  console.log('✅ Assigned tags to sample cats');

  // --- Create a Breeding NG rule (タグ組合せ禁止) ---
  const existingRule = await prisma.breedingNgRule.findFirst({ where: { name: '短足×長足禁止' } });
  if (!existingRule) {
    await prisma.breedingNgRule.create({
      data: {
        name: '短足×長足禁止',
        description: '短足（オス）と長足（メス）の組合せを禁止します（テスト）',
        type: 'TAG_COMBINATION',
        maleConditions: [tagShort.name],
        femaleConditions: [tagLong.name],
        active: true,
      },
    });
    console.log('✅ Created Breeding NG rule: 短足×長足禁止');
  } else {
    console.log('ℹ️ Breeding NG rule already exists:', existingRule.name);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
