import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { createTestApp } from "./utils/create-test-app";
import { CsrfHelper } from "./utils/csrf-helper";

describe("Auth register (e2e)", () => {
  let app: INestApplication;
  let csrfHelper: CsrfHelper;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);
    csrfHelper = new CsrfHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers then rejects duplicate email with 409/400", async () => {
    const emailRaw = `register_dup_${Date.now()}_${Math.random().toString(36).substring(7)}@Example.com `;
    const email = emailRaw; // server should normalize
    const password = "Secret123!";

    // first register
    const res1 = await csrfHelper.post("/api/v1/auth/register", { email, password });
    if (![201, 200].includes(res1.status)) {
      throw new Error(`unexpected status: ${res1.status}`);
    }

    // duplicate register should fail (409 or 400 as BadRequest)
    const res2 = await csrfHelper.post("/api/v1/auth/register", { 
      email: emailRaw.toUpperCase(), 
      password 
    });
    if (![409, 400].includes(res2.status)) {
      throw new Error(`expected 409/400, got ${res2.status}`);
    }
  });
});
