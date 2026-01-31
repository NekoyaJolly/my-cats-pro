import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestApp } from './utils/create-test-app';

describe('Export API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);

    const email = `export_test_${Date.now()}@example.com`;
    const password = 'ExportTest123!';

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

  describe('POST /api/v1/export', () => {
    it('should export cats data as CSV', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dataType: 'cats',
          format: 'csv',
        })
        .expect(200);

      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('cats_export_');
    });

    it('should export pedigrees data as JSON', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dataType: 'pedigrees',
          format: 'json',
        })
        .expect(200);

      expect(res.headers['content-type']).toContain('application/json');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('pedigrees_export_');
      
      const data = JSON.parse(res.text);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should export care schedules data as CSV', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dataType: 'care_schedules',
          format: 'csv',
        })
        .expect(200);

      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should export tags data as JSON', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dataType: 'tags',
          format: 'json',
        })
        .expect(200);

      expect(res.headers['content-type']).toContain('application/json');
      const data = JSON.parse(res.text);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should reject export without authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/export')
        .send({
          dataType: 'cats',
          format: 'csv',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject invalid data type', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dataType: 'invalid_type',
          format: 'csv',
        })
        .expect(400);
    });

    it('should export with date filters', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();

      const res = await request(app.getHttpServer())
        .post('/api/v1/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dataType: 'cats',
          format: 'csv',
          startDate,
          endDate,
        })
        .expect(200);

      expect(res.headers['content-type']).toContain('text/csv');
    });
  });
});
