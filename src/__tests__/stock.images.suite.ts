import { Direction, EntryType, OrderStatus } from "@prisma/client";
import express from "express";
import request from "supertest";
import { prismaClient } from "../loaders/prisma";
import cloudinaryMock from "./cloudinaryMock";

const testImage = `${__dirname}/__mocks__/test-image.png`;

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
    const uploadSpy = jest.spyOn(cloudinaryMock.v2.uploader, "upload");

    // Upload Image 1
    cloudinaryMock.v2.uploader.upload.mockResolvedValueOnce({
      public_id: "imageId",
      secure_url: "https://res.cloudinary.com/image/test-image.png",
    });
    const image1 = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`)
      .attach("file", testImage)
      .expect(201);

    expect(image1.body.imageId).toBe("imageId");
    expect(image1.body.url).toBe("https://res.cloudinary.com/image/test-image.png");
    expect(image1.body.fileName).toBe("test-image.png");
    expect(image1.body.entryId).toBe(entry.id);

    expect(uploadSpy).toHaveBeenCalled();

    // Upload Image 2
    cloudinaryMock.v2.uploader.upload.mockResolvedValueOnce({
      public_id: "imageId2",
      secure_url: "https://res.cloudinary.com/image/test-image.png",
    });
    const image2 = await request(app)
      .post(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`)
      .attach("file", testImage)
      .expect(201);

    expect(image2.body.imageId).toBe("imageId2");
    expect(image2.body.url).toBe("https://res.cloudinary.com/image/test-image.png");
    expect(image2.body.fileName).toBe("test-image.png");
    expect(image2.body.entryId).toBe(entry.id);

    expect(uploadSpy).toHaveBeenCalled();

    // Get 2 Images
    let images = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`);
    expect(images.status).toBe(200);
    expect(images.body).toHaveLength(2);

    // Delete Image 2
    const deleteImage2 = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images/${image2.body.imageId}`
    );
    expect(deleteImage2.status).toBe(200);
    expect(deleteImage2.body).toBe("imageId2");

    // Check if destroy was called
    expect(destroySpy).toHaveBeenCalledWith("imageId2", expect.any(Function));

    // Get 1 Image
    images = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`);
    expect(images.status).toBe(200);
    expect(images.body).toHaveLength(1);

    // Delete Image 1
    const deleteImage1 = await request(app).delete(
      `/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images/${image1.body.imageId}`
    );
    expect(deleteImage1.status).toBe(200);
    expect(deleteImage1.body).toBe("imageId");

    // Check if destroy was called
    expect(destroySpy).toHaveBeenCalledWith("imageId2", expect.any(Function));

    // Get 0 Images
    images = await request(app).get(`/api/v1/portfolios/${portfolio.id}/entries/${entry.id}/images`);
    expect(images.status).toBe(200);
    expect(images.body).toHaveLength(0);
  });
};
