import { Direction, EntryType, OrderStatus } from "@prisma/client";
import express from "express";
import request from "supertest";
import { prismaClient } from "../loaders/prisma";

export const multipleStockEntriesSuite = (app: express.Application) => {
  const createPortfolio = async () => {
    return await prismaClient.portfolio.create({
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
  };

  it("Create and finish multiple wining and losing stocks, balance became positive, negative and than positive again, delete all afterwards to reset the balance", async () => {
    const portfolio = await createPortfolio();

    const AAPL_response = await request(app)
      .post(`/api/v1/entries/${portfolio.id}`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: "AAPL",
        direction: Direction.LONG,
      });
    expect(AAPL_response.status).toBe(201);

    const MSFT_response = await request(app)
      .post(`/api/v1/entries/${portfolio.id}`)
      .send({
        date: new Date(2001, 1, 1),
        price: 200,
        size: 2,
        entryType: EntryType.STOCK,
        symbol: "MSFT",
        direction: Direction.SHORT,
      });
    expect(MSFT_response.status).toBe(201);

    const IBOV_response = await request(app)
      .post(`/api/v1/entries/${portfolio.id}`)
      .send({
        date: new Date(2001, 1, 1),
        price: 500,
        size: 2,
        entryType: EntryType.STOCK,
        symbol: "IBOV",
        direction: Direction.LONG,
      });
    expect(IBOV_response.status).toBe(201);

    const MGLU_response = await request(app)
      .post(`/api/v1/entries/${portfolio.id}`)
      .send({
        date: new Date(2001, 1, 1),
        price: 300,
        size: 3,
        entryType: EntryType.STOCK,
        symbol: "MGLU",
        direction: Direction.LONG,
      });
    expect(MGLU_response.status).toBe(201);

    const close_AAPL_response = await request(app)
      .patch(`/api/v1/entries/${portfolio.id}/${AAPL_response.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 200, //Entry LONG 100 * 1
      });
    expect(close_AAPL_response.status).toBe(200);
    expect(close_AAPL_response.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(close_AAPL_response.body.exitPrice).toBe(200);
    expect(close_AAPL_response.body.result).toBe(100);
    expect(close_AAPL_response.body.grossResult).toBe(100);
    expect(close_AAPL_response.body.accountChange).toBe(0.1);
    expect(close_AAPL_response.body.accountBalance).toBe(1100);

    //Check Balance after closing AAPL
    const updatedPortfolioAfterAPPL = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
      include: {
        balances: true,
      },
    });
    expect(updatedPortfolioAfterAPPL.currentBalance).toBe(1100);
    expect(updatedPortfolioAfterAPPL.balances.length).toBe(2);
    expect(updatedPortfolioAfterAPPL.balances[0].balance).toBe(1000);
    expect(updatedPortfolioAfterAPPL.balances[1].balance).toBe(1100);

    const close_MSFT_response = await request(app)
      .patch(`/api/v1/entries/${portfolio.id}/${MSFT_response.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 100, //Entry SHORT 200 * 2
      });
    expect(close_MSFT_response.status).toBe(200);
    expect(close_MSFT_response.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(close_MSFT_response.body.exitPrice).toBe(100);
    expect(close_MSFT_response.body.result).toBe(200);
    expect(close_MSFT_response.body.grossResult).toBe(200);
    expect(close_MSFT_response.body.accountChange).toBe(0.1818);
    expect(close_MSFT_response.body.accountBalance).toBe(1300);

    //Check Balance after closing MSFT
    const updatedPortfolioAfterMSFT = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
      include: {
        balances: true,
      },
    });
    expect(updatedPortfolioAfterMSFT.currentBalance).toBe(1300);
    expect(updatedPortfolioAfterMSFT.balances.length).toBe(2);
    expect(updatedPortfolioAfterMSFT.balances[0].balance).toBe(1000);
    expect(updatedPortfolioAfterMSFT.balances[1].balance).toBe(1300);
  });
};
