import { Direction, EntryType, OrderStatus } from "@prisma/client";
import express from "express";
import request from "supertest";
import { prismaClient } from "../loaders/prisma";
import cloudinaryMock from "./cloudinaryMock";

export const stockImagesSuite = (app: express.Application) => {
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

  it("should create list and delete images", async () => {
    const portfolio = await createPortfolio();
    const entry = await prismaClient.entry.create({
      data: {
        user: "mail@mail.com",
        orderRef: "123",
        portfolioId: portfolio.id,
        entryType: EntryType.STOCK,
        date: new Date(2001, 1, 1),
        symbol: "AAPL",
        size: 10,
        price: 100,
        direction: Direction.LONG,
        orderStatus: OrderStatus.OPEN,
      },
    });
    cloudinaryMock.v2.uploader.destroy.mockResolvedValue({ result: "success" });
    const destroySpy = jest.spyOn(cloudinaryMock.v2.uploader, "destroy");

    const image1 = await request(app).post(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`).send({
      imageId: "imageId",
      url: "https://res.cloudinary.com/image/image1.png",
      fileName: "Untitled.png",
    });
    expect(image1.status).toBe(201);
    expect(image1.body.imageId).toBe("imageId");
    expect(image1.body.url).toBe("https://res.cloudinary.com/image/image1.png");
    expect(image1.body.fileName).toBe("Untitled.png");
    expect(image1.body.entryId).toBe(entry.id);

    const image2 = await request(app).post(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`).send({
      imageId: "imageId2",
      url: "https://res.cloudinary.com/image/image2.png",
      fileName: "Untitled2.png",
    });
    expect(image2.status).toBe(201);
    expect(image2.body.imageId).toBe("imageId2");
    expect(image2.body.url).toBe("https://res.cloudinary.com/image/image2.png");
    expect(image2.body.fileName).toBe("Untitled2.png");
    expect(image2.body.entryId).toBe(entry.id);

    let images = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`);
    expect(images.status).toBe(200);
    expect(images.body).toHaveLength(2);

    const deleteImage2 = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images/${image2.body.imageId}`
    );
    expect(deleteImage2.status).toBe(200);
    expect(deleteImage2.body).toBe("imageId2");

    expect(destroySpy).toHaveBeenCalledWith("imageId2", expect.any(Function));

    images = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`);
    expect(images.status).toBe(200);
    expect(images.body).toHaveLength(1);

    const deleteImage1 = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images/${image1.body.imageId}`
    );
    expect(deleteImage1.status).toBe(200);
    expect(deleteImage1.body).toBe("imageId");
    expect(destroySpy).toHaveBeenCalledWith("imageId2", expect.any(Function));

    images = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`);
    expect(images.status).toBe(200);
    expect(images.body).toHaveLength(0);
  });
};
