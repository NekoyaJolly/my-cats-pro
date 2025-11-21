import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { CsrfHelper } from './utils/csrf-helper';
import { createTestApp } from './utils/create-test-app';

describe('Breeding NG Rules API (e2e)', () => {
  let app: INestApplication;
  let csrfHelper: CsrfHelper;
  let authToken: string;
  let createdRuleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);
    csrfHelper = new CsrfHelper(app);

    const email = `breeding_ng_rules_${Date.now()}@example.com`;
    const password = 'NgRulesTest123!';

    const res = await csrfHelper.post('/api/v1/auth/register', { email, password });
    expect(res.status).toBe(201);

    const loginRes = await csrfHelper.post('/api/v1/auth/login', { email, password });
    expect(loginRes.status).toBe(201);

    authToken = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new NG rule', async () => {
    const { token: csrfToken, cookie } = await csrfHelper.getCsrfToken();
    const res = await request(app.getHttpServer())
      .post('/api/v1/breeding/ng-rules')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .set('Cookie', cookie)
      .send({
        name: '同一タグ禁止',
        description: '同じタグ同士の交配を禁止',
        type: 'TAG_COMBINATION',
        maleConditions: ['Champion'],
        femaleConditions: ['Champion'],
      });
    expect(res.status).toBe(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: '同一タグ禁止',
      type: 'TAG_COMBINATION',
      active: true,
    });

    createdRuleId = res.body.data.id;
    expect(createdRuleId).toBeDefined();
  });

  it('should list NG rules including the created one', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/breeding/ng-rules')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const found = res.body.data.find((rule: { id: string }) => rule.id === createdRuleId);
    expect(found).toBeDefined();
  });

  it('should update an existing NG rule', async () => {
    const { token: csrfToken, cookie } = await csrfHelper.getCsrfToken();
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/breeding/ng-rules/${createdRuleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .set('Cookie', cookie)
      .send({
        description: '条件を更新',
        maleConditions: ['GrandChampion'],
        femaleConditions: ['Champion'],
        active: false,
      });
    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: createdRuleId,
      description: '条件を更新',
      maleConditions: ['GrandChampion'],
      femaleConditions: ['Champion'],
      active: false,
    });
  });

  it('should delete the NG rule', async () => {
    const { token: csrfToken, cookie } = await csrfHelper.getCsrfToken();
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/breeding/ng-rules/${createdRuleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-CSRF-Token', csrfToken)
      .set('Cookie', cookie);
    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/breeding/ng-rules')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const found = listRes.body.data.find((rule: { id: string }) => rule.id === createdRuleId);
    expect(found).toBeUndefined();
  });
});
