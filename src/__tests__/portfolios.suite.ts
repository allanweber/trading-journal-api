import express from "express";
import request from "supertest";
import { getPortfolioBalance } from "../app/portfolio/portfolio.service";

export const portfoliosSuite = (app: express.Application) => {
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
  });
};
