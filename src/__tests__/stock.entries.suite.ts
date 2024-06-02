import { Direction, EntryType, OrderStatus } from '@prisma/client';
import express from 'express';
import request from 'supertest';
import { prismaClient } from '../loaders/prisma';
import cloudinaryMock from './cloudinaryMock';

export const stockEntriesSuite = (app: express.Application) => {
  const createPortfolio = async () => {
    return await prismaClient.portfolio.create({
      data: {
        user: 'mail@mail.com',
        name: 'Portfolio Test',
        description: 'Portfolio Test Description',
        startDate: new Date(2001, 1, 1),
        startBalance: 1000,
        currency: 'USD',
        currentBalance: 1000,
      },
    });
  };

  it('should create, return, edit and delete a Stock', async () => {
    const portfolio = await createPortfolio();

    const createResponse = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: 'AAPL',
        direction: Direction.SHORT,
      });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.orderStatus).toBe(OrderStatus.OPEN);
    expect(createResponse.body.entryType).toBe(EntryType.STOCK);
    expect(new Date(createResponse.body.date).toDateString()).toBe(new Date(2001, 1, 1).toDateString());
    expect(createResponse.body.symbol).toBe('AAPL');
    expect(createResponse.body.size).toBe(1);
    expect(createResponse.body.price).toBe(100);
    expect(createResponse.body.direction).toBe(Direction.SHORT);
    expect(createResponse.body.profit).toBe(null);
    expect(createResponse.body.loss).toBe(null);
    expect(createResponse.body.costs).toBe(null);
    expect(createResponse.body.exitDate).toBe(null);
    expect(createResponse.body.exitPrice).toBe(null);
    expect(createResponse.body.result).toBe(null);
    expect(createResponse.body.grossResult).toBe(null);
    expect(createResponse.body.plannedRR).toBe(null);

    // Balance does not change
    let updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(updatedPortfolio.currentBalance).toBe(1000);

    //Update all but entryType
    let updateResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}`)
      .send({
        entryType: EntryType.WITHDRAWAL, //will not change
        notes: 'Updated Notes',
        price: 200,
        size: 2,
        symbol: 'MSFT',
        direction: Direction.LONG,
        costs: 10,
        profit: 300,
        loss: 150,
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.orderStatus).toBe(OrderStatus.OPEN);
    expect(updateResponse.body.entryType).toBe(EntryType.STOCK);
    expect(new Date(updateResponse.body.date).toDateString()).toBe(new Date(2001, 1, 1).toDateString());
    expect(updateResponse.body.symbol).toBe('MSFT');
    expect(updateResponse.body.size).toBe(2);
    expect(updateResponse.body.price).toBe(200);
    expect(updateResponse.body.direction).toBe(Direction.LONG);
    expect(updateResponse.body.notes).toBe('Updated Notes');
    expect(updateResponse.body.profit).toBe(300);
    expect(updateResponse.body.loss).toBe(150);
    expect(updateResponse.body.costs).toBe(10);
    expect(updateResponse.body.exitDate).toBe(null);
    expect(updateResponse.body.exitPrice).toBe(null);
    expect(updateResponse.body.result).toBe(null);
    expect(updateResponse.body.grossResult).toBe(null);
    expect(updateResponse.body.plannedRR).toBe(2);

    //Remove profit loss and costs
    const updateResponse2 = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}`)
      .send({
        entryType: EntryType.WITHDRAWAL, //will not change
        notes: 'Updated Notes',
        price: 200,
        size: 2,
        symbol: 'MSFT',
        direction: Direction.LONG,
      });
    expect(updateResponse2.status).toBe(200);
    expect(updateResponse2.body.orderStatus).toBe(OrderStatus.OPEN);
    expect(updateResponse2.body.entryType).toBe(EntryType.STOCK);
    expect(new Date(updateResponse2.body.date).toDateString()).toBe(new Date(2001, 1, 1).toDateString());
    expect(updateResponse2.body.symbol).toBe('MSFT');
    expect(updateResponse2.body.size).toBe(2);
    expect(updateResponse2.body.price).toBe(200);
    expect(updateResponse2.body.direction).toBe(Direction.LONG);
    expect(updateResponse2.body.notes).toBe('Updated Notes');
    expect(updateResponse2.body.profit).toBe(null);
    expect(updateResponse2.body.loss).toBe(null);
    expect(updateResponse2.body.costs).toBe(null);
    expect(updateResponse2.body.exitDate).toBe(null);
    expect(updateResponse2.body.exitPrice).toBe(null);
    expect(updateResponse2.body.result).toBe(null);
    expect(updateResponse2.body.grossResult).toBe(null);
    expect(updateResponse2.body.plannedRR).toBe(null);

    //Add profit loss and costs again
    updateResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}`)
      .send({
        entryType: EntryType.WITHDRAWAL, //will not change
        notes: 'Updated Notes',
        price: 200,
        size: 2,
        symbol: 'MSFT',
        direction: Direction.LONG,
        costs: 10,
        profit: 300,
        loss: 150,
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.orderStatus).toBe(OrderStatus.OPEN);
    expect(updateResponse.body.entryType).toBe(EntryType.STOCK);
    expect(new Date(updateResponse.body.date).toDateString()).toBe(new Date(2001, 1, 1).toDateString());
    expect(updateResponse.body.symbol).toBe('MSFT');
    expect(updateResponse.body.size).toBe(2);
    expect(updateResponse.body.price).toBe(200);
    expect(updateResponse.body.direction).toBe(Direction.LONG);
    expect(updateResponse.body.notes).toBe('Updated Notes');
    expect(updateResponse.body.profit).toBe(300);
    expect(updateResponse.body.loss).toBe(150);
    expect(updateResponse.body.costs).toBe(10);
    expect(updateResponse.body.exitDate).toBe(null);
    expect(updateResponse.body.exitPrice).toBe(null);
    expect(updateResponse.body.result).toBe(null);
    expect(updateResponse.body.plannedRR).toBe(2);

    // Still only one entry
    let allEntries = await prismaClient.entry.findMany({});
    expect(allEntries.length).toBe(1);

    //  Close trade with profit is invalid
    const invalidCloseResponse = await request(app).patch(
      `/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`
    );
    expect(invalidCloseResponse.status).toBe(400);

    // Close trade with exit date lower than entry date
    const invalidCloseResponse2 = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date(2000, 1, 2),
        exitPrice: 300,
      });
    expect(invalidCloseResponse2.status).toBe(500);
    expect(invalidCloseResponse2.body.message).toBe('Exit date must be after entry date.');

    // Close trade with profit
    let closeResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 300,
      });
    expect(closeResponse.status).toBe(200);
    expect(closeResponse.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(closeResponse.body.entryType).toBe(EntryType.STOCK);
    expect(closeResponse.body.symbol).toBe('MSFT');
    expect(closeResponse.body.size).toBe(2);
    expect(closeResponse.body.price).toBe(200);
    expect(closeResponse.body.direction).toBe(Direction.LONG);
    expect(closeResponse.body.notes).toBe('Updated Notes');
    expect(closeResponse.body.profit).toBe(300);
    expect(closeResponse.body.loss).toBe(150);
    expect(closeResponse.body.costs).toBe(10);
    expect(new Date(closeResponse.body.exitDate).toDateString()).toBe(new Date(2001, 1, 2).toDateString());
    expect(closeResponse.body.exitPrice).toBe(300);
    expect(closeResponse.body.result).toBe(190);
    expect(closeResponse.body.grossResult).toBe(200);
    expect(closeResponse.body.returnPercentage).toBe(0.475);
    expect(closeResponse.body.plannedRR).toBe(2);

    //Balance changed and there are two entries in balance table
    updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(updatedPortfolio.currentBalance).toBe(1190);

    //Clone same trade again does not change trade and balance
    closeResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date(2001, 1, 2),
        exitPrice: 300,
      });
    expect(closeResponse.status).toBe(400);
    expect(closeResponse.body.message).toBe('Cannot close a closed trade');

    updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });
    expect(updatedPortfolio.currentBalance).toBe(1190);

    // Delete entry and check if balance is updated to original value
    const deleteResponse = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}`
    );
    expect(deleteResponse.status).toBe(200);
    allEntries = await prismaClient.entry.findMany({});
    expect(allEntries.length).toBe(0);

    updatedPortfolio = await prismaClient.portfolio.findUnique({
      where: {
        id: portfolio.id,
      },
    });

    expect(updatedPortfolio.currentBalance).toBe(1000);
  });

  it('Cannot close trade in the future', async () => {
    const portfolio = await createPortfolio();

    const createResponse = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: 'AAPL',
        direction: Direction.SHORT,
      });
    expect(createResponse.status).toBe(201);

    // Close trade with exit date in the future
    const closeResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date().setMinutes(new Date().getMinutes() + 1),
        exitPrice: 300,
      });
    expect(closeResponse.status).toBe(400);
    expect(closeResponse.body.message).toBe('Exit date cannot be in the future');
  });

  it('Cannot close again a closed trade, when updating, only notes can change', async () => {
    const portfolio = await createPortfolio();

    const createResponse = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: 'AAPL',
        direction: Direction.SHORT,
        notes: 'Notes',
      });
    expect(createResponse.status).toBe(201);

    const closeResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date(),
        exitPrice: 300,
      });
    expect(closeResponse.status).toBe(200);
    expect(closeResponse.body.notes).toBe('Notes');

    // Update closed trade
    const updateResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}`)
      .send({
        entryType: EntryType.WITHDRAWAL, //will not change
        notes: 'Updated Notes',
        price: 200,
        size: 2,
        symbol: 'MSFT',
        direction: Direction.LONG,
        costs: 10,
        profit: 300,
        loss: 150,
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.orderStatus).toBe(OrderStatus.CLOSED);
    expect(updateResponse.body.entryType).toBe(EntryType.STOCK);
    expect(updateResponse.body.symbol).toBe('AAPL');
    expect(updateResponse.body.size).toBe(1);
    expect(updateResponse.body.price).toBe(100);
    expect(updateResponse.body.direction).toBe(Direction.SHORT);
    expect(updateResponse.body.notes).toBe('Updated Notes');

    // Close closed trade
    const closeResponse2 = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date(),
        exitPrice: 300,
      });
    expect(closeResponse2.status).toBe(400);
    expect(closeResponse2.body.message).toBe('Cannot close a closed trade');
  });

  it('Can change notes of open or closed trade', async () => {
    const portfolio = await createPortfolio();

    const createResponse = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: 'AAPL',
        direction: Direction.SHORT,
        notes: 'Notes',
      });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.notes).toBe('Notes');

    //Update notes of open trade
    const updateNotesOpen = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/notes`)
      .send({
        notes: 'Updated Notes',
      });
    expect(updateNotesOpen.status).toBe(200);
    expect(updateNotesOpen.body.notes).toBe('Updated Notes');

    const closeResponse = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/close`)
      .send({
        exitDate: new Date(),
        exitPrice: 300,
      });
    expect(closeResponse.status).toBe(200);
    expect(closeResponse.body.notes).toBe('Updated Notes');

    //Update notes of closed trade
    const updateNotesClosed = await request(app)
      .patch(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}/notes`)
      .send({
        notes: 'Updated Notes closed',
      });
    expect(updateNotesClosed.status).toBe(200);
    expect(updateNotesClosed.body.notes).toBe('Updated Notes closed');
  });

  it('Delete a entry with images must delete cloudinary images and folder', async () => {
    const portfolio = await createPortfolio();

    const createResponse = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries`)
      .send({
        date: new Date(2001, 1, 1),
        price: 100,
        size: 1,
        entryType: EntryType.STOCK,
        symbol: 'AAPL',
        direction: Direction.SHORT,
      });
    expect(createResponse.status).toBe(201);

    await prismaClient.entryImages.create({
      data: {
        entryId: createResponse.body.id,
        imageId: 'imageId',
        url: 'url',
        fileName: 'fileName',
      },
    });

    cloudinaryMock.v2.api.delete_resources_by_prefix.mockResolvedValue({ result: 'success' });
    cloudinaryMock.v2.api.delete_folder.mockResolvedValue({ result: 'success' });

    const spyDeleteResourcesByPrefix = jest.spyOn(cloudinaryMock.v2.api, 'delete_resources_by_prefix');
    const deleteFolderSpy = jest.spyOn(cloudinaryMock.v2.api, 'delete_folder');

    await request(app).delete(`/api/v1/portfolios/${portfolio.id}/entries/${createResponse.body.id}`).expect(200);

    expect(spyDeleteResourcesByPrefix).toHaveBeenCalledWith(
      `${createResponse.body.user}/${createResponse.body.id}`,
      expect.any(Function)
    );
    expect(deleteFolderSpy).toHaveBeenCalledWith(
      `${createResponse.body.user}/${createResponse.body.id}`,
      expect.any(Function)
    );
  });
};
