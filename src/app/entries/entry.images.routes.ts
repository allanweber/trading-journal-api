import { Response, Router } from "express";
import protectRoute from "../../routes/protected";
import { Route } from "../../routes/route";

import cloudinary from "cloudinary";
import { prismaClient } from "../../loaders/prisma";
import portfolioRequired, { AuthenticatedRequestWithPortfolio } from "../../routes/portfolioRequired";
import { imageUploadedSchema } from "../model/fileUploaded";
import { getEntry } from "./entries.service";

export class EntryImagesRoutes extends Route {
  constructor(app: Router) {
    super(app, "portfolios");
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.post("/:portfolioId/entries/:id/images", [protectRoute, portfolioRequired], this.upload);
    this.route.get("/:portfolioId/entries/:id/images", [protectRoute, portfolioRequired], this.images);
    this.route.delete("/:portfolioId/entries/:id/images/:imageId", [protectRoute, portfolioRequired], this.delete);
  };

  private upload = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { id } = req.params;

    const entry = await getEntry(req.email, req.portfolioId, id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const uploadedImage = imageUploadedSchema.safeParse(req.body);
    if (uploadedImage.success === false) {
      return res.status(400).json(uploadedImage.error);
    }

    const imageResponse = await prismaClient.entryImages.create({
      data: {
        imageId: uploadedImage.data.imageId,
        entryId: id,
        url: uploadedImage.data.url,
        fileName: uploadedImage.data.fileName,
      },
    });

    return res.status(201).json(imageResponse);
  };

  private images = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { id } = req.params;

    const entry = await getEntry(req.email, req.portfolioId, id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const images = await prismaClient.entryImages.findMany({
      where: {
        entryId: id,
      },
    });

    return res.status(200).json(images);
  };

  private delete = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { id, imageId } = req.params;

    const entry = await getEntry(req.email, req.portfolioId, id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const image = await prismaClient.entryImages.findFirst({
      where: {
        entryId: id,
        imageId,
      },
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    await cloudinary.v2.uploader.destroy(imageId, function (error) {
      if (error) {
        return res.status(500).json({ message: "Error deleting image" });
      }
    });

    await prismaClient.entryImages.delete({
      where: {
        imageId: image.imageId,
      },
    });

    return res.status(200).json(imageId);
  };
}
