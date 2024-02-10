import { Response, Router } from "express";
import multer, { memoryStorage } from "multer";
import protectRoute from "../../routes/protected";
import { Route } from "../../routes/route";

import cloudinary from "cloudinary";
import { prismaClient } from "../../loaders/prisma";
import portfolioRequired, { AuthenticatedRequestWithPortfolio } from "../../routes/portfolioRequired";
import { getEntry } from "./entries.service";

const storage = memoryStorage();
const upload = multer({
  storage,
});

export class EntryImagesRoutes extends Route {
  constructor(app: Router) {
    super(app, "portfolios");
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.post(
      "/:portfolioId/entries/:id/images",
      [protectRoute, portfolioRequired, upload.single("file")],
      this.upload
    );
    this.route.get("/:portfolioId/entries/:id/images", [protectRoute, portfolioRequired], this.images);
    this.route.delete("/:portfolioId/entries/:id/images/:imageId", [protectRoute, portfolioRequired], this.delete);
  };

  private upload = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { id } = req.params;

    const entry = await getEntry(req.email, req.portfolioId, id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const upload = await cloudinary.v2.uploader.upload(dataURI, {
        resource_type: "image",
        folder: `${req.email}/${id}`,
        timestamp: Math.round(new Date().getTime() / 1000),
      });

      const imageResponse = await prismaClient.entryImages.create({
        data: {
          imageId: upload.public_id,
          entryId: id,
          url: upload.secure_url,
          fileName: req.file.originalname,
        },
      });

      return res.status(201).json(imageResponse);
    } catch (error) {
      return res.status(500).json(JSON.stringify(error));
    }
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
