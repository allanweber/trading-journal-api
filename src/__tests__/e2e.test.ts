import express from "express";
import request from "supertest";
import { getPortfolioBalance } from "../app/portfolio/portfolio.service";
import loaders from "../loaders";
import { prismaClient } from "../loaders/prisma";
import { setupTestContainer, teardownTestContainer } from "../test-setup";

const app = express();

jest.mock("../routes/protected", () => {
  return jest.fn((req, res, next) => {
    req.email = "mail@mail.com";
    next();
  });
});

describe("Manage Portfolios", () => {
  jest.setTimeout(60000);
  beforeAll(async () => {
    await setupTestContainer();
    await loaders(app);
  });

  afterAll(async () => {
    await teardownTestContainer();
  });

  afterEach(async () => {
    await prismaClient.portfolio.deleteMany();
  });

  it("should create, return and delete a Portfolios", async () => {
    const createResponse = await request(app)
      .post("/api/v1/portfolios")
      .send({
        name: "Portfolio Test",
        description: "Portfolio Test Description",
        startDate: new Date(2001, 1, 1),
        startBalance: 1000,
        currency: "USD",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.currentBalance).toBe(1000);

    const responseGet = await request(app).get(`/api/v1/portfolios/${createResponse.body.id}`);
    expect(responseGet.status).toBe(200);
    expect(responseGet.body.name).toBe("Portfolio Test");

    const responseAll = await request(app).get("/api/v1/portfolios");
    expect(responseAll.status).toBe(200);
    expect(responseAll.body.length).toBe(1);

    const balance = await getPortfolioBalance("mail@mail.com", createResponse.body.id);
    expect(balance).toBe(1000);

    const responseDelete = await request(app).delete(
      `/api/v1/portfolios/${createResponse.body.id}`
    );
    expect(responseDelete.status).toBe(200);

    const responseAllAfterDelete = await request(app).get("/api/v1/portfolios");
    expect(responseAllAfterDelete.status).toBe(200);
    expect(responseAllAfterDelete.body.length).toBe(0);
  });

  it("update a portfolio must keep the same balance and only one balances", async () => {
    const createResponse = await request(app)
      .post("/api/v1/portfolios")
      .send({
        name: "Portfolio Test",
        description: "Portfolio Test Description",
        startDate: new Date(2001, 1, 1),
        startBalance: 1000,
        currency: "USD",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.currentBalance).toBe(1000);

    const updateResponse = await request(app)
      .post("/api/v1/portfolios")
      .send({
        ...createResponse.body,
        name: "Portfolio Test 2",
        description: "Portfolio Test Description 2",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.id).toBe(createResponse.body.id);
    expect(updateResponse.body.name).toBe("Portfolio Test 2");
    expect(updateResponse.body.description).toBe("Portfolio Test Description 2");
    expect(updateResponse.body.currentBalance).toBe(1000);

    const balance = await getPortfolioBalance("mail@mail.com", createResponse.body.id);
    expect(balance).toBe(1000);

    const balances = await prismaClient.balance.findMany({
      where: {
        portfolioId: createResponse.body.id,
      },
    });
    expect(balances.length).toBe(1);
  });

  it("when adding multiple portfolios each portfolio must have one balance", async () => {
    const createResponse = await request(app)
      .post("/api/v1/portfolios")
      .send({
        name: "Portfolio Test",
        description: "Portfolio Test Description",
        startDate: new Date(2001, 1, 1),
        startBalance: 1000,
        currency: "USD",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.currentBalance).toBe(1000);

    const createResponse2 = await request(app)
      .post("/api/v1/portfolios")
      .send({
        name: "Portfolio Test 2",
        description: "Portfolio Test Description 2",
        startDate: new Date(2001, 1, 1),
        startBalance: 1000,
        currency: "USD",
      });

    expect(createResponse2.status).toBe(201);
    expect(createResponse2.body.currentBalance).toBe(1000);

    const balances = await prismaClient.balance.findMany({
      where: {
        portfolioId: createResponse.body.id,
      },
    });
    expect(balances.length).toBe(1);

    const balances2 = await prismaClient.balance.findMany({
      where: {
        portfolioId: createResponse2.body.id,
      },
    });
    expect(balances2.length).toBe(1);

    const allBalances = await prismaClient.balance.findMany();
    expect(allBalances.length).toBe(2);
  });

  it("should return 404 when portfolio not found getting a portfolio", async () => {
    const response = await request(app).get(`/api/v1/portfolios/123`);
    expect(response.status).toBe(404);
  });
});

describe("Manage Entries", () => {
  jest.setTimeout(60000);
  beforeAll(async () => {
    await setupTestContainer();
    await loaders(app);
  });

  afterAll(async () => {
    await teardownTestContainer();
  });

  afterEach(async () => {
    await prismaClient.portfolio.deleteMany();
  });

  it("should create, return and delete a entries", async () => {
    const portfolio = await prismaClient.portfolio.create({
      data: {
        user: "mail@mail.com",
        name: "Portfolio Test",
        description: "Portfolio Test Description",
        startDate: new Date(2001, 1, 1),
        startBalance: 1000,
        currency: "USD",
        currentBalance: 1000,
        balances: {
          create: {
            balance: 1000,
            date: new Date(2001, 1, 1),
          },
        },
      },
    });

    const getAllResponse = await request(app).get(`/api/v1/entries/${portfolio.id}`);

    console.log("getAllResponse", getAllResponse.body);

    expect(getAllResponse.status).toBe(200);
    expect(getAllResponse.body.data.length).toBe(0);
    expect(getAllResponse.body.pagination.page).toBe(1);
    expect(getAllResponse.body.pagination.pageSize).toBe(10);
    expect(getAllResponse.body.pagination.totalPages).toBe(0);
    expect(getAllResponse.body.pagination.total).toBe(0);
  });
});
