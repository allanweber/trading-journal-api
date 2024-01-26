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
      },
    });
  };

  it("Create and finish multiple wining and losing stocks, balance became positive, negative and than positive again, delete all afterwards to reset the balance", async () => {
    const portfolio = await createPortfolio();

    const AAPL_response = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
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
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
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
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
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
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 3,
        entryType: EntryType.STOCK,
        symbol: "MGLU",
        direction: Direction.SHORT,
      });
    expect(MGLU_response.status).toBe(201);

    //Close AAPL winig trade
    const close_AAPL_response = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${AAPL_response.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 200, //Entry LONG 100 * 1
      });
    expect(close_AAPL_response.status).toBe(200);
    expect(close_AAPL_response.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(close_AAPL_response.body.exitPrice).toBe(200);
    expect(close_AAPL_response.body.result).toBe(100);
    expect(close_AAPL_response.body.grossResult).toBe(100);
    expect(close_AAPL_response.body.returnPercentage).toBe(1);

    //Check Balance after closing AAPL
    const updatedPortfolioAfterAPPL = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(updatedPortfolioAfterAPPL.currentBalance).toBe(1100);

    //Close MSFT wining trade
    const close_MSFT_response = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${MSFT_response.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 100, //Entry SHORT 200 * 2
      });
    expect(close_MSFT_response.status).toBe(200);
    expect(close_MSFT_response.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(close_MSFT_response.body.exitPrice).toBe(100);
    expect(close_MSFT_response.body.result).toBe(200);
    expect(close_MSFT_response.body.grossResult).toBe(200);
    expect(close_MSFT_response.body.returnPercentage).toBe(1);

    //Check Balance after closing MSFT
    const updatedPortfolioAfterMSFT = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(updatedPortfolioAfterMSFT.currentBalance).toBe(1300);

    //Close IBOV losing trade
    const close_IBOV_response = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${IBOV_response.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 3),
        exitPrice: 100, //Entry LONG 500 * 2
      });
    expect(close_IBOV_response.status).toBe(200);
    expect(close_IBOV_response.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(close_IBOV_response.body.exitPrice).toBe(100);
    expect(close_IBOV_response.body.result).toBe(-800);
    expect(close_IBOV_response.body.grossResult).toBe(-800);
    expect(close_IBOV_response.body.returnPercentage).toBe(-1.6);

    //Check Balance after closing MSFT
    const updatedPortfolioAfterIBOV = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(updatedPortfolioAfterIBOV.currentBalance).toBe(500);

    //Close MGLU losing trade
    const close_MGLU_response = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${MGLU_response.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 4),
        exitPrice: 300, //Entry SHOT 100 * 3
      });
    expect(close_MGLU_response.status).toBe(200);
    expect(close_MGLU_response.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(close_MGLU_response.body.exitPrice).toBe(300);
    expect(close_MGLU_response.body.result).toBe(-600);
    expect(close_MGLU_response.body.grossResult).toBe(-600);
    expect(close_MGLU_response.body.returnPercentage).toBe(-6);

    //Check Balance after closing MSFT
    const updatedPortfolioAfterMGLU = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(updatedPortfolioAfterMGLU.currentBalance).toBe(-100);

    //Delete AAPL
    const delete_AAPL_response = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${AAPL_response.body.id}`
    );
    expect(delete_AAPL_response.status).toBe(200);

    //Check Balance after delete AAPL
    const balanceAfterDeleteAPPL = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(balanceAfterDeleteAPPL.currentBalance).toBe(-200);

    //Delete MSFT
    const delete_MSFT_response = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${MSFT_response.body.id}`
    );
    expect(delete_MSFT_response.status).toBe(200);

    //Check Balance after delete MSFT
    const balanceAfterDeleteMSFT = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(balanceAfterDeleteMSFT.currentBalance).toBe(-400);

    //Delete MGUL
    const delete_MGLU_response = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${MGLU_response.body.id}`
    );
    expect(delete_MGLU_response.status).toBe(200);

    //Check Balance after delete MGLU
    const balanceAfterDeleteMGLU = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(balanceAfterDeleteMGLU.currentBalance).toBe(200);

    //Delete IBOV
    const delete_IBOV_response = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${IBOV_response.body.id}`
    );
    expect(delete_IBOV_response.status).toBe(200);

    //Check Balance after delete IBOV
    const balanceAfterDeleteIBOV = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(balanceAfterDeleteIBOV.currentBalance).toBe(1000);
  });
};
