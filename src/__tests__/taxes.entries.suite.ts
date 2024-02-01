import { EntryType, OrderStatus } from "@prisma/client";
import express from "express";
import request from "supertest";
import { prismaClient } from "../loaders/prisma";

export const taxesEntriesSuite = (app: express.Application) => {
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

  it("should create, return, edit and delete a Taxes", async () => {
    const portfolio = await createPortfolio();

    const createResponse = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        entryType: EntryType.TAXES,
      });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(createResponse.body.entryType).toBe(EntryType.TAXES);
    expect(createResponse.body.result).toBe(-100);

    let updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });

    expect(updatedPortfolio.currentBalance).toBe(900);

    //Will only update notes
    const updateResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}`)
      .send({
        date: new Date(2002, 1, 1), //will not change
        price: 100, //will not change
        entryType: EntryType.WITHDRAWAL, //will not change
        notes: "Updated Notes",
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(updateResponse.body.entryType).toBe(EntryType.TAXES);
    expect(updateResponse.body.result).toBe(-100);
    expect(updateResponse.body.notes).toBe("Updated Notes");

    // Will not close again or update balance
    const closeResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date(2002, 1, 1),
        exitPrice: 200,
      });
    expect(closeResponse.status).toBe(400);
    expect(closeResponse.body.message).toBe("Cannot close a closed trade");

    updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });

    expect(updatedPortfolio.currentBalance).toBe(900);

    // Delete entry and check if balance is updated to original value
    const deleteResponse = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}`
    );
    expect(deleteResponse.status).toBe(200);

    updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });

    expect(updatedPortfolio.currentBalance).toBe(1000);
  });
};
