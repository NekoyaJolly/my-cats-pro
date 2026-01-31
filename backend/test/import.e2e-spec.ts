import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';

import { AppModule } from '../src/app.module';
import { createTestApp } from './utils/create-test-app';

describe('Import API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);

    const email = `import_test_${Date.now()}@example.com`;
    const password = 'ImportTest123!';

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password });
    expect(res.status).toBe(201);

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password });
    expect(loginRes.status).toBe(201);

    authToken = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/import/preview', () => {
    it('プレビュー: CSVファイルを正常に解析', async () => {
      const csvContent = `name,gender,birthDate,breed,color
テスト猫1,MALE,2024-01-01,Siamese,White
テスト猫2,FEMALE,2024-01-02,Persian,Black`;

      const tempFilePath = path.join(__dirname, `temp-preview-${Date.now()}.csv`);
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', tempFilePath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('previewCount');
      expect(res.body.data).toHaveProperty('sampleData');
      expect(res.body.data).toHaveProperty('columns');
      expect(res.body.data).toHaveProperty('totalCount');
      expect(res.body.data.totalCount).toBe(2);
      expect(res.body.data.columns).toEqual(
        expect.arrayContaining(['name', 'gender', 'birthDate'])
      );

      fs.unlinkSync(tempFilePath);
    });

    it('プレビュー: ファイルなしでエラー', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/import/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('プレビュー: 認証なしでエラー', async () => {
      const csvContent = `name,gender,birthDate
テスト猫,MALE,2024-01-01`;

      const tempFilePath = path.join(__dirname, `temp-no-auth-${Date.now()}.csv`);
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/preview')
        .attach('file', tempFilePath)
        .expect(401);

      expect(res.body.success).toBe(false);

      fs.unlinkSync(tempFilePath);
    });
  });

  describe('POST /api/v1/import/cats', () => {
    it('猫インポート: CSVファイルから正常にインポート', async () => {
      const csvContent = `name,gender,birthDate,registrationNumber
インポート猫1,MALE,2024-01-01,REG-IMP-001
インポート猫2,FEMALE,2024-01-02,REG-IMP-002`;

      const tempFilePath = path.join(__dirname, `temp-cats-${Date.now()}.csv`);
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', tempFilePath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('successCount');
      expect(res.body.data).toHaveProperty('errorCount');
      expect(res.body.data).toHaveProperty('totalCount');
      expect(res.body.data.totalCount).toBe(2);
      expect(res.body.data.successCount).toBeGreaterThan(0);

      fs.unlinkSync(tempFilePath);
    });

    it('猫インポート: 必須フィールド不足でエラー', async () => {
      const csvContent = `name,gender,birthDate
有効な猫,MALE,2024-01-01
,FEMALE,2024-01-02
別の猫,MALE,2024-01-03`;

      const tempFilePath = path.join(
        __dirname,
        `temp-cats-partial-${Date.now()}.csv`
      );
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', tempFilePath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCount).toBe(3);
      expect(res.body.data.errorCount).toBeGreaterThan(0);
      expect(res.body.data.successCount).toBeGreaterThan(0);
      expect(res.body.data.errors).toBeDefined();

      fs.unlinkSync(tempFilePath);
    });

    it('猫インポート: ファイルなしでエラー', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/import/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/import/pedigrees', () => {
    it('血統書インポート: CSVファイルから正常にインポート', async () => {
      const csvContent = `pedigreeId,catName,title
PED-001,血統猫1,Champion
PED-002,血統猫2,Grand Champion`;

      const tempFilePath = path.join(
        __dirname,
        `temp-pedigrees-${Date.now()}.csv`
      );
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/pedigrees')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', tempFilePath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCount).toBe(2);
      expect(res.body.data.successCount).toBeGreaterThan(0);

      fs.unlinkSync(tempFilePath);
    });

    it('血統書インポート: 重複IDでスキップ', async () => {
      const pedigreeId = `PED-DUP-${Date.now()}`;
      const csvContent = `pedigreeId,catName,title
${pedigreeId},血統猫1,Champion
${pedigreeId},血統猫2,Grand Champion`;

      const tempFilePath = path.join(
        __dirname,
        `temp-pedigrees-dup-${Date.now()}.csv`
      );
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/pedigrees')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', tempFilePath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCount).toBe(2);
      expect(res.body.data.errorCount).toBeGreaterThanOrEqual(1);

      fs.unlinkSync(tempFilePath);
    });
  });

  describe('POST /api/v1/import/tags', () => {
    it('タグインポート: CSVファイルから正常にインポート', async () => {
      const csvContent = `name,category,group,color,isActive
タグ1,テストカテゴリ,テストグループ,#FF0000,true
タグ2,テストカテゴリ,テストグループ,#00FF00,true`;

      const tempFilePath = path.join(__dirname, `temp-tags-${Date.now()}.csv`);
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', tempFilePath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCount).toBe(2);
      expect(res.body.data.successCount).toBeGreaterThan(0);

      fs.unlinkSync(tempFilePath);
    });

    it('タグインポート: 重複タグはスキップ', async () => {
      const timestamp = Date.now();
      const csvContent = `name,category,group,color,isActive
タグ-${timestamp},テストカテゴリ,テストグループ,#FF0000,true
タグ-${timestamp},テストカテゴリ,テストグループ,#00FF00,true`;

      const tempFilePath = path.join(
        __dirname,
        `temp-tags-dup-${timestamp}.csv`
      );
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', tempFilePath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCount).toBe(2);
      expect(res.body.data.errorCount).toBeGreaterThanOrEqual(1);
      expect(res.body.data.successCount).toBeGreaterThan(0);

      fs.unlinkSync(tempFilePath);
    });

    it('タグインポート: ファイルなしでエラー', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/import/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('認証テスト', () => {
    it('認証なしでプレビューにアクセス不可', async () => {
      const csvContent = `name,gender,birthDate
テスト猫,MALE,2024-01-01`;

      const tempFilePath = path.join(
        __dirname,
        `temp-unauth-${Date.now()}.csv`
      );
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/preview')
        .attach('file', tempFilePath)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');

      fs.unlinkSync(tempFilePath);
    });

    it('不正なトークンでエラー', async () => {
      const csvContent = `name,gender,birthDate
テスト猫,MALE,2024-01-01`;

      const tempFilePath = path.join(
        __dirname,
        `temp-bad-token-${Date.now()}.csv`
      );
      fs.writeFileSync(tempFilePath, csvContent, 'utf-8');

      const res = await request(app.getHttpServer())
        .post('/api/v1/import/preview')
        .set('Authorization', `Bearer invalid-token`)
        .attach('file', tempFilePath)
        .expect(401);

      expect(res.body.success).toBe(false);

      fs.unlinkSync(tempFilePath);
    });
  });
});
