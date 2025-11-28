import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";

import { BREED_MASTER_DATA } from "../breeds/breed-master.data";
import { GENDER_MASTER } from "../cats/constants/gender";
import { COAT_COLOR_MASTER_DATA } from "../coat-colors/coat-color-master.data";

const prisma = new PrismaClient();

async function syncBreedMasterData() {
  console.log("➡️ Syncing breed master data...");
  for (const record of BREED_MASTER_DATA) {
    await prisma.breed.upsert({
      where: { code: record.code },
      update: {
        name: record.name ?? "",
        description: null,
        isActive: true,
      },
      create: {
        code: record.code,
        name: record.name ?? "",
        description: null,
        isActive: true,
      },
    });
  }
  console.log(`✅ Synced ${BREED_MASTER_DATA.length} breed records`);
}

async function syncCoatColorMasterData() {
  console.log("➡️ Syncing coat color master data...");
  for (const record of COAT_COLOR_MASTER_DATA) {
    await prisma.coatColor.upsert({
      where: { code: record.code },
      update: {
        name: record.name ?? "",
        description: null,
        isActive: true,
      },
      create: {
        code: record.code,
        name: record.name ?? "",
        description: null,
        isActive: true,
      },
    });
  }
  console.log(`✅ Synced ${COAT_COLOR_MASTER_DATA.length} coat color records`);
}

async function syncGenderMasterData() {
  console.log("➡️ Syncing gender master data...");
  for (const record of GENDER_MASTER) {
    const code = Number.parseInt(record.key, 10);
    if (Number.isNaN(code)) {
      continue;
    }

    await prisma.gender.upsert({
      where: { code },
      update: {
        name: record.name,
        description: record.canonical,
        isActive: true,
      },
      create: {
        code,
        name: record.name,
        description: record.canonical,
        isActive: true,
      },
    });
  }
  console.log(`✅ Synced ${GENDER_MASTER.length} gender records`);
}

async function syncMasterData() {
  await syncBreedMasterData();
  await syncCoatColorMasterData();
  await syncGenderMasterData();
}

async function main() {
  console.log("Seeding database...");

  // 1) Admin user (ENV override, 非破壊化ロジック)
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Passw0rd!";
  const forceUpdate = process.env.ADMIN_FORCE_UPDATE === "1"; // 既存管理者を強制更新するか

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  let adminAction: "created" | "kept" | "updated" = "kept";
  let admin: { id: string };

  if (!existingAdmin) {
    // 新規作成
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
      hashLength: 64,
    });
    admin = await prisma.user.create({
      data: {
        clerkId: "local_admin",
        email,
        firstName: "Admin",
        lastName: "User",
        role: UserRole.ADMIN,
        isActive: true,
        passwordHash: hash,
      },
    });
    adminAction = "created";
  } else {
    // 既存: 原則 passwordHash を変更しない / 役割や有効化のみ調整
    let needsUpdate = false;
    const updateData: Partial<typeof existingAdmin> = {};
    if (existingAdmin.role !== UserRole.ADMIN) {
      updateData.role = UserRole.ADMIN;
      needsUpdate = true;
    }
    if (!existingAdmin.isActive) {
      updateData.isActive = true;
      needsUpdate = true;
    }
    if (forceUpdate) {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        hashLength: 64,
      });
      updateData.passwordHash = hash;
      needsUpdate = true;
    }
    if (needsUpdate) {
      admin = await prisma.user.update({ where: { email }, data: updateData });
      adminAction = forceUpdate ? "updated" : "updated"; // updated (role/status or password)
    } else {
      admin = existingAdmin;
      adminAction = "kept";
    }
  }

  // 2) SuperAdmin user (ENV override, 非破壊化ロジック)
  // SUPERADMIN_EMAIL が設定されている場合のみ SUPERADMIN を作成
  const superadminEmail = process.env.SUPERADMIN_EMAIL?.toLowerCase();
  const superadminPassword = process.env.SUPERADMIN_PASSWORD;
  const superadminForceUpdate = process.env.SUPERADMIN_FORCE_UPDATE === "1";

  if (superadminEmail && superadminPassword) {
    const existingSuperadmin = await prisma.user.findUnique({
      where: { email: superadminEmail },
    });
    let superadminAction: "created" | "kept" | "updated" = "kept";
    let superadmin: { id: string };

    if (!existingSuperadmin) {
      // 新規作成
      const hash = await argon2.hash(superadminPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        hashLength: 64,
      });
      superadmin = await prisma.user.create({
        data: {
          clerkId: "local_superadmin",
          email: superadminEmail,
          firstName: "Super",
          lastName: "Admin",
          role: UserRole.SUPER_ADMIN,
          isActive: true,
          passwordHash: hash,
        },
      });
      superadminAction = "created";
    } else {
      // 既存: 原則 passwordHash を変更しない / 役割や有効化のみ調整
      let needsUpdate = false;
      const updateData: Partial<typeof existingSuperadmin> = {};
      if (existingSuperadmin.role !== UserRole.SUPER_ADMIN) {
        updateData.role = UserRole.SUPER_ADMIN;
        needsUpdate = true;
      }
      if (!existingSuperadmin.isActive) {
        updateData.isActive = true;
        needsUpdate = true;
      }
      if (superadminForceUpdate) {
        const hash = await argon2.hash(superadminPassword, {
          type: argon2.argon2id,
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 4,
          hashLength: 64,
        });
        updateData.passwordHash = hash;
        needsUpdate = true;
      }
      if (needsUpdate) {
        superadmin = await prisma.user.update({
          where: { email: superadminEmail },
          data: updateData,
        });
        superadminAction = "updated";
      } else {
        superadmin = existingSuperadmin;
        superadminAction = "kept";
      }
    }

    console.log("SuperAdmin:", {
      email: superadminEmail,
      password:
        superadminForceUpdate || superadminAction === "created"
          ? "(set from env)"
          : "(unchanged)",
      id: superadmin.id,
      action: superadminAction,
    });
  } else if (superadminEmail && !superadminPassword) {
    console.log(
      "⚠️ SUPERADMIN_EMAIL が設定されていますが、SUPERADMIN_PASSWORD が設定されていないためスキップします。",
    );
  } else {
    console.log(
      "ℹ️ SUPERADMIN_EMAIL が設定されていないため、SUPERADMINの作成をスキップします。",
    );
  }

  await syncMasterData();

  // 3) Sample tag category & tag
  const category = await prisma.tagCategory.upsert({
    where: { key: "cat_status" },
    update: {
      name: "猫ステータス",
      description: "猫の状態を判別するサンプルカテゴリ",
      color: "#6366F1",
      displayOrder: 1,
      scopes: ["cats"],
      isActive: true,
    },
    create: {
      key: "cat_status",
      name: "猫ステータス",
      description: "猫の状態を判別するサンプルカテゴリ",
      color: "#6366F1",
      displayOrder: 1,
      scopes: ["cats"],
      isActive: true,
    },
  });

  const group = await prisma.tagGroup.upsert({
    where: {
      categoryId_name: {
        categoryId: category.id,
        name: "default",
      },
    },
    update: {
      description: category.description,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    },
    create: {
      name: "default",
      description: category.description,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      category: { connect: { id: category.id } },
    },
  });

  const tag = await prisma.tag.upsert({
    where: {
      groupId_name: {
        groupId: group.id,
        name: "indoor",
      },
    },
    update: {
      color: "#10B981",
      allowsManual: true,
      allowsAutomation: true,
      metadata: { description: "室内飼い猫" },
      isActive: true,
    },
    create: {
      name: "indoor",
      color: "#10B981",
      allowsManual: true,
      allowsAutomation: true,
      metadata: { description: "室内飼い猫" },
      isActive: true,
      group: { connect: { id: group.id } },
    },
  });

  console.log("Seed complete ✅");
  console.log("Admin:", { email, password: forceUpdate || adminAction === "created" ? password : "(unchanged)", id: admin.id, action: adminAction });
  console.log("Tag Category:", { id: category.id, key: category.key, name: category.name });
  console.log("Tag Group:", { id: group.id, name: group.name, categoryId: group.categoryId });
  console.log("Tag:", { id: tag.id, name: tag.name, groupId: tag.groupId });

  // --- Additional test data: Breeding tag category/group/tags and NG rule ---
  const breedingCategory = await prisma.tagCategory.upsert({
    where: { key: 'breeding' },
    update: { name: 'Breeding', description: 'Breeding related tags', scopes: ['cats'] },
    create: { key: 'breeding', name: 'Breeding', description: 'Breeding related tags', scopes: ['cats'] },
  });

  const bodyGroup = await prisma.tagGroup.findFirst({ where: { categoryId: breedingCategory.id, name: 'Body-Type' } });
  const tagGroupBody = bodyGroup ?? await prisma.tagGroup.create({ data: { categoryId: breedingCategory.id, name: 'Body-Type', description: 'Body type tags' } });

  const shortTag = await prisma.tag.upsert({
    where: { groupId_name: { groupId: tagGroupBody.id, name: '短足' } },
    update: { isActive: true },
    create: { groupId: tagGroupBody.id, name: '短足', color: '#F97316', textColor: '#FFFFFF' },
  });

  const longTag = await prisma.tag.upsert({
    where: { groupId_name: { groupId: tagGroupBody.id, name: '長足' } },
    update: { isActive: true },
    create: { groupId: tagGroupBody.id, name: '長足', color: '#06B6D4', textColor: '#FFFFFF' },
  });

  // Assign tags to sample cats if they exist
  const alpha = await prisma.cat.findUnique({ where: { id: 'a1111111-1111-4111-8111-111111111111' } });
  const anna = await prisma.cat.findUnique({ where: { id: 'a2222222-2222-4222-8222-222222222222' } });
  if (alpha) {
    await prisma.catTag.upsert({ where: { catId_tagId: { catId: alpha.id, tagId: shortTag.id } }, update: {}, create: { catId: alpha.id, tagId: shortTag.id } });
  }
  if (anna) {
    await prisma.catTag.upsert({ where: { catId_tagId: { catId: anna.id, tagId: longTag.id } }, update: {}, create: { catId: anna.id, tagId: longTag.id } });
  }

  // Create breeding NG rule if not exists
  const ngRule = await prisma.breedingNgRule.findFirst({ where: { name: '短足×長足禁止' } });
  if (!ngRule) {
    await prisma.breedingNgRule.create({ data: { name: '短足×長足禁止', description: '短足(オス) と 長足(メス) の組合せを禁止 (テスト)', type: 'TAG_COMBINATION', maleConditions: [shortTag.name], femaleConditions: [longTag.name], active: true } });
  }

  console.log('✅ Added breeding tags and NG rule (短足/長足)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
