import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from 'supertest';
import { Test } from "@nestjs/testing";
import { Server } from "http";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Care & Tags flows (e2e)", () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix("api/v1");
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("care schedule: create -> complete (happy path with seed cat)", async () => {
    const email = `e2e_${Date.now()}@example.com`;
  const password = "Secret123!";

    // register & login
    const registerRes = await request(app.getHttpServer()).post('/api/v1/auth/register').send({ email, password });
    expect(registerRes.status).toBe(201);
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password });
    expect(login.status).toBe(201);
    const token = login.body.data.access_token as string;

    // create a cat owned by the registered user (avoid seed dependency)
    const catRes = await request(server)
      .post("/api/v1/cats")
      .set("Authorization", `Bearer ${token}`)
      .send({
        registrationNumber: `REG-${Date.now()}`,
        name: "E2E Kitty",
        gender: "FEMALE",
        birthDate: "2024-01-01T00:00:00.000Z",
      });
    expect(catRes.status).toBe(201);
    const catId =
      catRes.body.id ??
      catRes.body.data?.id ??
      catRes.body?.data?.cat?.id ??
      catRes.body?.cat?.id ??
      catRes.body?.data?.catId;
    expect(catId).toBeDefined();

    // create schedule
    const createRes = await request(server)
      .post("/api/v1/care/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        catIds: [catId],
        name: "年次健康診断",
        careType: "HEALTH_CHECK",
        scheduledDate: "2025-09-01",
        description: "年次健診",
      });
    expect(createRes.status).toBe(201);
    const scheduleId = createRes.body.data.id as string;
    expect(scheduleId).toBeDefined();

    // complete schedule
    const completeRes = await request(server)
      .patch(`/api/v1/care/schedules/${scheduleId}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completedDate: "2025-09-02", notes: "良好" });
    expect(completeRes.status).toBe(200);
  });

  it("tags: create -> assign -> unassign", async () => {
    const email = `e2e_${Date.now()}@example.com`;
    const password = "Secret123!";

    // register & login
    const registerRes = await request(app.getHttpServer()).post('/api/v1/auth/register').send({ email, password });
    expect(registerRes.status).toBe(201);
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password });
    expect(login.status).toBe(201);
    const token = login.body.data.access_token as string;

    // Get CSRF token for authenticated requests

    // create tag category
    const categoryRes = await request(server)
      .post("/api/v1/tags/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Category", key: `test_category_${Date.now()}` });
    expect(categoryRes.status).toBe(201);
    const categoryId = categoryRes.body.data.id as string;
    expect(categoryId).toBeDefined();

    // create tag group
    const groupRes = await request(server)
      .post("/api/v1/tags/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId, name: "Test Group" });
    expect(groupRes.status).toBe(201);
    const groupId = groupRes.body.data.id as string;
    expect(groupId).toBeDefined();

    // create tag
    const tagName = `tag_${Date.now()}`;
    const tagRes = await request(server)
      .post("/api/v1/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: tagName, groupId, color: "#3B82F6" });
    expect(tagRes.status).toBe(201);
    const tagId = tagRes.body.data.id as string;
    expect(tagId).toBeDefined();

    // create a cat (avoid dependency on existing data)
    const catRes = await request(server)
      .post("/api/v1/cats")
      .set("Authorization", `Bearer ${token}`)
      .send({
        registrationNumber: `REG-${Date.now()}`,
        name: "E2E Tag Cat",
        gender: "FEMALE",
        birthDate: "2024-01-01T00:00:00.000Z",
      });
    expect(catRes.status).toBe(201);
    const catId =
      catRes.body.id ??
      catRes.body.data?.id ??
      catRes.body?.data?.cat?.id ??
      catRes.body?.cat?.id ??
      catRes.body?.data?.catId;
    expect(catId).toBeDefined();

    // assign
    const assignRes = await request(server)
      .post(`/api/v1/tags/cats/${catId}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tagId });
    expect(assignRes.status).toBe(200);

    // unassign
    const unassignRes = await request(server)
      .delete(`/api/v1/tags/cats/${catId}/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`)
    expect(unassignRes.status).toBe(200);
  });
});
