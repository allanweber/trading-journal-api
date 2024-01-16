import { EntryType, OrderStatus } from "@prisma/client";
import express from "express";
import request from "supertest";
import { prismaClient } from "../loaders/prisma";

export const withdrawalEntriesSuite = (app: express.Application) => {
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

  it("should create, return, edit and delete a Withdrawal", async () => {
    const portfolio = await createPortfolio();

    const createResponse = await request(app)
      .post(`/api/v1/entries/${portfolio.id}`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        entryType: EntryType.WITHDRAWAL,
      });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(createResponse.body.entryType).toBe(EntryType.WITHDRAWAL);
    expect(createResponse.body.accountBalance).toBe(900);
    expect(createResponse.body.result).toBe(-100);
    expect(createResponse.body.accountChange).toBe(-0.1);

    let updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
      include: {
        balances: true,
      },
    });

    expect(updatedPortfolio.currentBalance).toBe(900);
    expect(updatedPortfolio.balances.length).toBe(1);
    expect(updatedPortfolio.balances[0].balance).toBe(900);

    //Will only update notes
    const updateResponse = await request(app)
      .patch(`/api/v1/entries/${portfolio.id}/${createResponse.body.id}`)
      .send({
        date: new Date(2002, 1, 1), //will not change
        price: 100, //will not change
        entryType: EntryType.TAXES, //will not change
        notes: "Updated Notes",
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(updateResponse.body.entryType).toBe(EntryType.WITHDRAWAL);
    expect(updateResponse.body.accountBalance).toBe(900);
    expect(updateResponse.body.result).toBe(-100);
    expect(updateResponse.body.accountChange).toBe(-0.1);
    expect(updateResponse.body.notes).toBe("Updated Notes");

    // Will not close again or update balance
    const closeResponse = await request(app)
      .patch(`/api/v1/entries/${portfolio.id}/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date(2002, 1, 1),
        exitPrice: 200,
      });
    expect(closeResponse.status).toBe(200);
    expect(closeResponse.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(closeResponse.body.accountBalance).toBe(900);
    expect(closeResponse.body.result).toBe(-100);
    expect(closeResponse.body.accountChange).toBe(-0.1);
    expect(closeResponse.body.notes).toBe("Updated Notes");

    updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
      include: {
        balances: true,
      },
    });

    expect(updatedPortfolio.currentBalance).toBe(900);
    expect(updatedPortfolio.balances.length).toBe(1);
    expect(updatedPortfolio.balances[0].balance).toBe(900);

    // Delete entry and check if balance is updated to original value
    const deleteResponse = await request(app).delete(
      `/api/v1/entries/${portfolio.id}/${createResponse.body.id}`
    );
    expect(deleteResponse.status).toBe(200);

    updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
      include: {
        balances: true,
      },
    });

    expect(updatedPortfolio.currentBalance).toBe(1000);
    expect(updatedPortfolio.balances.length).toBe(1);
    expect(updatedPortfolio.balances[0].balance).toBe(1000);
  });
};
