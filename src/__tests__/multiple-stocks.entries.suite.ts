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

    const balanceResponse = await request(app).get(`/api/v1/portfolios/${portfolio.id}/balance`);
    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body.balance).toBe(-200);
    expect(balanceResponse.body.startBalance).toBe(1000);

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

  it("When closing trades it is possible to inform the costs again, if not informed do not change the previous costs", async () => {
    const portfolio = await createPortfolio();
    const tradeWithCosts = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: "AAPL",
        direction: Direction.LONG,
        costs: 10,
      });
    expect(tradeWithCosts.status).toBe(201);
    expect(tradeWithCosts.body.costs).toBe(10);

    const closeTradeWithoutCosts = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${tradeWithCosts.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 200, //Entry LONG 100 * 1
      });
    expect(closeTradeWithoutCosts.status).toBe(200);
    expect(closeTradeWithoutCosts.body.costs).toBe(10);
    expect(closeTradeWithoutCosts.body.grossResult).toBe(100);
    expect(closeTradeWithoutCosts.body.result).toBe(90);

    const tradeWithoutCosts = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: "AAPL",
        direction: Direction.LONG,
      });
    expect(tradeWithoutCosts.status).toBe(201);
    expect(tradeWithoutCosts.body.costs).toBe(null);

    const closeTradeWithoutCosts2 = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${tradeWithoutCosts.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 200, //Entry LONG 100 * 1
      });
    expect(closeTradeWithoutCosts2.status).toBe(200);
    expect(closeTradeWithoutCosts2.body.costs).toBe(null);
    expect(closeTradeWithoutCosts2.body.grossResult).toBe(100);
    expect(closeTradeWithoutCosts2.body.result).toBe(100);

    const tradeWithoutCosts2 = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: "AAPL",
        direction: Direction.LONG,
      });
    expect(tradeWithoutCosts2.status).toBe(201);
    expect(tradeWithoutCosts2.body.costs).toBe(null);

    const closeTradeWithCosts = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${tradeWithoutCosts2.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 200, //Entry LONG 100 * 1
        costs: 10,
      });
    expect(closeTradeWithCosts.status).toBe(200);
    expect(closeTradeWithCosts.body.costs).toBe(10);
    expect(closeTradeWithCosts.body.grossResult).toBe(100);
    expect(closeTradeWithCosts.body.result).toBe(90);

    const balance = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(balance.currentBalance).toBe(1280);
  });

  it("Filter queries by Symbol, Entry Type, Status and Direction", async () => {
    const portfolio = await createPortfolio();
    const shortOpen = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 4),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: "SHORT_OPEN",
        direction: Direction.SHORT,
      });
    expect(shortOpen.status).toBe(201);
    const LongOpen = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 3),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: "LONG_OPEN",
        direction: Direction.LONG,
      });
    expect(LongOpen.status).toBe(201);

    const longWin = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 2),
        price: 1,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: "LONG_WIN",
        direction: Direction.LONG,
      });
    expect(longWin.status).toBe(201);
    const longWinClosed = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${longWin.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 2,
      });
    expect(longWinClosed.status).toBe(200);

    const shortLoss = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 1,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: "SHOT_LOSS",
        direction: Direction.SHORT,
      });
    expect(shortLoss.status).toBe(201);
    const shortLossClosed = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${shortLoss.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 2,
      });
    expect(shortLossClosed.status).toBe(200);

    const dividend = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 1,
        size: 1,
        entryType: EntryType.DIVIDEND,
        symbol: "DIVIDEND",
      });
    expect(dividend.status).toBe(201);

    const queryOpen = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries?status=OPEN`);
    expect(queryOpen.status).toBe(200);
    expect(queryOpen.body.data.length).toBe(2);
    expect(queryOpen.body.data[0].symbol).toBe("SHORT_OPEN");
    expect(queryOpen.body.data[1].symbol).toBe("LONG_OPEN");

    const queryWin = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries?query=WIN`);
    expect(queryWin.status).toBe(200);
    expect(queryWin.body.data.length).toBe(1);
    expect(queryWin.body.data[0].symbol).toBe("LONG_WIN");

    const queryLoss = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries?query=LOSS`);
    expect(queryLoss.status).toBe(200);
    expect(queryLoss.body.data.length).toBe(1);
    expect(queryLoss.body.data[0].symbol).toBe("SHOT_LOSS");

    const queryDividend = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries?type=DIVIDEND`);
    expect(queryDividend.status).toBe(200);
    expect(queryDividend.body.data.length).toBe(1);
    expect(queryDividend.body.data[0].symbol).toBe("DIVIDEND");

    const queryShort = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries?direction=SHORT`);
    expect(queryShort.status).toBe(200);
    expect(queryShort.body.data.length).toBe(2);
    expect(queryShort.body.data[0].symbol).toBe("SHORT_OPEN");
    expect(queryShort.body.data[1].symbol).toBe("SHOT_LOSS");

    const queryLong = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries?direction=LONG`);
    expect(queryLong.status).toBe(200);
    expect(queryLong.body.data.length).toBe(2);
    expect(queryLong.body.data[0].symbol).toBe("LONG_OPEN");
    expect(queryLong.body.data[1].symbol).toBe("LONG_WIN");
  });
};
