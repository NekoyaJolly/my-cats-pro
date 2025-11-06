import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedStaffShifts() {
  console.log('🌱 Seeding Staff & Shift data...');

  // Create Staff
  const staff1 = await prisma.staff.upsert({
    where: { email: 'tanaka@example.com' },
    update: {},
    create: {
      name: '田中 太郎',
      email: 'tanaka@example.com',
      role: '主任',
      color: '#fd7e14',
    },
  });

  const staff2 = await prisma.staff.upsert({
    where: { email: 'suzuki@example.com' },
    update: {},
    create: {
      name: '鈴木 花子',
      email: 'suzuki@example.com',
      role: 'スタッフ',
      color: '#74c0fc',
    },
  });

  const staff3 = await prisma.staff.upsert({
    where: { email: 'yamada@example.com' },
    update: {},
    create: {
      name: '山田 次郎',
      email: 'yamada@example.com',
      role: 'スタッフ',
      color: '#51cf66',
    },
  });

  const staff4 = await prisma.staff.upsert({
    where: { email: 'sato@example.com' },
    update: {},
    create: {
      name: '佐藤 美咲',
      email: 'sato@example.com',
      role: 'スタッフ',
      color: '#ff6b6b',
    },
  });

  console.log('✅ Created 4 staff members');

  // Create Shift Templates
  const morningTemplate =
    (await prisma.shiftTemplate.findFirst({ where: { name: '午前' } })) ||
    (await prisma.shiftTemplate.create({
      data: {
        name: '午前',
        startTime: '09:00',
        endTime: '13:00',
        duration: 240,
        color: '#ffd43b',
        breakTime: 0,
        displayOrder: 1,
      },
    }));

  const afternoonTemplate =
    (await prisma.shiftTemplate.findFirst({ where: { name: '午後' } })) ||
    (await prisma.shiftTemplate.create({
      data: {
        name: '午後',
        startTime: '14:00',
        endTime: '18:00',
        duration: 240,
        color: '#74c0fc',
        breakTime: 0,
        displayOrder: 2,
      },
    }));

  const fulldayTemplate =
    (await prisma.shiftTemplate.findFirst({ where: { name: '終日' } })) ||
    (await prisma.shiftTemplate.create({
      data: {
        name: '終日',
        startTime: '09:00',
        endTime: '18:00',
        duration: 540,
        color: '#51cf66',
        breakTime: 60,
        displayOrder: 3,
      },
    }));

  const nightTemplate =
    (await prisma.shiftTemplate.findFirst({ where: { name: '夜間' } })) ||
    (await prisma.shiftTemplate.create({
      data: {
        name: '夜間',
        startTime: '18:00',
        endTime: '22:00',
        duration: 240,
        color: '#be4bdb',
        breakTime: 0,
        displayOrder: 4,
      },
    }));

  console.log('✅ Created 4 shift templates');

  // Create default ShiftSettings
  const settings = await prisma.shiftSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      defaultMode: 'SIMPLE',
      enabledModes: ['SIMPLE', 'DETAILED'],
      simpleRequireDisplayName: false,
      detailedRequireTime: true,
      detailedRequireTemplate: false,
      detailedEnableTasks: true,
      detailedEnableActual: true,
    },
  });

  console.log('✅ Created shift settings');

  // Create sample shifts for current month
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const shifts = [];
  for (let i = 0; i < 10; i++) {
    const randomDate = new Date(
      startOfMonth.getTime() +
        Math.random() * (endOfMonth.getTime() - startOfMonth.getTime()),
    );

    const staffList = [staff1, staff2, staff3, staff4];
    const randomStaff = staffList[Math.floor(Math.random() * staffList.length)];
    const templateList = [
      morningTemplate,
      afternoonTemplate,
      fulldayTemplate,
      nightTemplate,
    ];
    const randomTemplate =
      templateList[Math.floor(Math.random() * templateList.length)];

    shifts.push({
      staffId: randomStaff.id,
      shiftDate: randomDate,
      templateId: randomTemplate.id,
      mode: 'SIMPLE',
      status: 'SCHEDULED',
      displayName: randomTemplate.name,
    });
  }

  await prisma.shift.createMany({
    data: shifts,
    skipDuplicates: true,
  });

  console.log('✅ Created sample shifts');

  console.log('🎉 Staff & Shift seeding completed!');
}

seedStaffShifts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
