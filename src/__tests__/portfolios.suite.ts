import { Direction, EntryType } from "@prisma/client";
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

    const balanceResponse = await request(app).get(
      `/api/v1/portfolios/${createResponse.body.id}/balance`
    );
    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body.balance).toBe(1000);
    expect(balanceResponse.body.startBalance).toBe(1000);

    const responseDelete = await request(app).delete(
      `/api/v1/portfolios/${createResponse.body.id}`
    );
    expect(responseDelete.status).toBe(200);

    const responseAllAfterDelete = await request(app).get("/api/v1/portfolios");
    expect(responseAllAfterDelete.status).toBe(200);
    expect(responseAllAfterDelete.body.length).toBe(0);
  });

  it("update a portfolio must keep the same balance", async () => {
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

  it("Get all portfolio balances entries only", async () => {
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

    //Add some stocks and dividends
    let entryResponse = await request(app)
      .post(`/api/v1/portfolios/${createResponse.body.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 200,
        size: 2,
        entryType: EntryType.STOCK,
        symbol: "MSFT",
        direction: Direction.SHORT,
      });
    expect(entryResponse.status).toBe(201);
    entryResponse = await request(app)
      .post(`/api/v1/portfolios/${createResponse.body.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 200,
        size: 2,
        entryType: EntryType.STOCK,
        symbol: "APPLE",
        direction: Direction.LONG,
      });
    expect(entryResponse.status).toBe(201);
    entryResponse = await request(app)
      .post(`/api/v1/portfolios/${createResponse.body.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        entryType: EntryType.DIVIDEND,
        symbol: "TEST",
      });
    expect(entryResponse.status).toBe(201);

    //Add Deposit, Withdrawal, Tax and Fee
    entryResponse = await request(app)
      .post(`/api/v1/portfolios/${createResponse.body.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        entryType: EntryType.DEPOSIT,
      });
    expect(entryResponse.status).toBe(201);
    entryResponse = await request(app)
      .post(`/api/v1/portfolios/${createResponse.body.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        entryType: EntryType.WITHDRAWAL,
      });
    expect(entryResponse.status).toBe(201);
    entryResponse = await request(app)
      .post(`/api/v1/portfolios/${createResponse.body.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        entryType: EntryType.TAXES,
      });
    expect(entryResponse.status).toBe(201);
    entryResponse = await request(app)
      .post(`/api/v1/portfolios/${createResponse.body.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        entryType: EntryType.FEES,
      });
    expect(entryResponse.status).toBe(201);

    const balanceResponse = await request(app).get(
      `/api/v1/portfolios/${createResponse.body.id}/entries/balances`
    );
    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body.length).toBe(4);
    expect(balanceResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entryType: EntryType.DEPOSIT }),
        expect.objectContaining({ entryType: EntryType.WITHDRAWAL }),
        expect.objectContaining({ entryType: EntryType.TAXES }),
        expect.objectContaining({ entryType: EntryType.FEES }),
      ])
    );
  });
};
