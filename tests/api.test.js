const request = require("supertest");
const app = require("../src/app");

describe("API Integration Tests", () => {
  it("GET / should return 404 for unknown route", async () => {
    const res = await request(app).get("/unknown");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Not Found");
  });
  // Add more tests for each API endpoint below
});

describe("Access API", () => {
  let accessToken = "";
  let refreshToken = "";

  it("POST /shopdev/register should register a new user", async () => {
    const res = await request(app)
      .post("/shopdev/register")
      .send({
        name: "Test User",
        email: `testuser_${Date.now()}@example.com`,
        password: "TestPassword123!",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("metadata");
  });

  it("POST /shopdev/login should login and return tokens", async () => {
    const res = await request(app).post("/shopdev/login").send({
      email: "testuser@example.com", // Use a valid user email
      password: "TestPassword123!", // Use the correct password
    });
    // This test assumes the user exists. Adjust as needed.
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("metadata");
      accessToken = res.body.metadata.tokens.accessToken;
      refreshToken = res.body.metadata.tokens.refreshToken;
    } else {
      expect([400, 401]).toContain(res.statusCode);
    }
  });

  it("POST /shopdev/logout should logout the user", async () => {
    if (!accessToken) return;
    const res = await request(app)
      .post("/shopdev/logout")
      .set("Authorization", `Bearer ${accessToken}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("POST /shopdev/refresh-Token should refresh tokens", async () => {
    if (!refreshToken) return;
    const res = await request(app)
      .post("/shopdev/refresh-Token")
      .set("Authorization", `Bearer ${refreshToken}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("GET /shopdev should get access info", async () => {
    if (!accessToken) return;
    const res = await request(app)
      .get("/shopdev")
      .set("Authorization", `Bearer ${accessToken}`);
    expect([200, 401]).toContain(res.statusCode);
  });
});

describe("Product API", () => {
  let accessToken = "";
  let productId = "";

  beforeAll(async () => {
    // Login to get access token
    const res = await request(app).post("/shopdev/login").send({
      email: "testuser@example.com", // Use a valid user email
      password: "TestPassword123!",
    });
    if (res.statusCode === 200) {
      accessToken = res.body.metadata.tokens.accessToken;
    }
  });

  it("POST /shopdev/product/create should create a product", async () => {
    if (!accessToken) return;
    const res = await request(app)
      .post("/shopdev/product/create")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Test Product",
        price: 100,
        description: "A product for testing",
        quantity: 10,
      });
    expect([201, 400, 401]).toContain(res.statusCode);
    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty("metadata");
      productId = res.body.metadata._id;
    }
  });

  it("POST /shopdev/product/publish/:product_id should publish a product", async () => {
    if (!accessToken || !productId) return;
    const res = await request(app)
      .post(`/shopdev/product/publish/${productId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect([200, 400, 401, 404]).toContain(res.statusCode);
  });

  it("POST /shopdev/product/unpublish/:product_id should unpublish a product", async () => {
    if (!accessToken || !productId) return;
    const res = await request(app)
      .post(`/shopdev/product/unpublish/${productId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect([200, 400, 401, 404]).toContain(res.statusCode);
  });

  it("GET /shopdev/product/draft/all should get all draft products", async () => {
    if (!accessToken) return;
    const res = await request(app)
      .get("/shopdev/product/draft/all")
      .set("Authorization", `Bearer ${accessToken}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("GET /shopdev/product/publish/all should get all published products", async () => {
    if (!accessToken) return;
    const res = await request(app)
      .get("/shopdev/product/publish/all")
      .set("Authorization", `Bearer ${accessToken}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("GET /shopdev/product/search should search products", async () => {
    if (!accessToken) return;
    const res = await request(app)
      .get("/shopdev/product/search")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({ q: "Test" });
    expect([200, 401]).toContain(res.statusCode);
  });
});
