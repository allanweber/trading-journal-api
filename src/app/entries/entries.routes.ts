import { Response, Router } from "express";
import protectRoute from "../../routes/protected";
import { Route } from "../../routes/route";

import { Entry } from "@prisma/client";
import logger from "../../logger";
import portfolioRequired, {
  AuthenticatedRequestWithPortfolio,
} from "../../routes/portfolioRequired";
import { deleteEntry, getEntry, queryEntries, saveEntry } from "./entries.service";

export class EntriesRoutes extends Route {
  constructor(app: Router) {
    super(app, "entries");
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.get("/:portfolioId", [protectRoute, portfolioRequired], this.getAll);
    this.route.get("/:portfolioId/:id", [protectRoute, portfolioRequired], this.get);
    this.route.delete("/:portfolioId/:id", [protectRoute, portfolioRequired], this.delete);
    this.route.post("/:portfolioId", [protectRoute, portfolioRequired], this.save);
  };

  private getAll = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { query, type, direction, pageSize, page } = req.query;

    const queryFilter = query ? query.toString() : undefined;
    const entryType = type ? (type as string).split(",") : undefined;
    const tradeDirection = direction ? (direction as string).split(",") : undefined;
    const size = pageSize ? parseInt(pageSize as string) : 10;
    const pageNumber = page ? parseInt(page as string) : 1;

    const response = await queryEntries(
      req.email,
      req.portfolioId,
      queryFilter,
      entryType,
      tradeDirection,
      size,
      pageNumber
    );

    return res.status(200).json(response);
  };

  private get = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { id } = req.params;

    const entry = await getEntry(req.email, req.portfolioId, id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.status(200).json(entry);
  };

  private delete = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { id } = req.params;

    await deleteEntry(req.email, req.portfolioId, id);

    return res.status(200).json(id);
  };

  private save = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    try {
      const entry = req.body as Entry;

      const response = await saveEntry(req.email, req.portfolioId, entry);

      return res.status(entry.id ? 200 : 201).json(response);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: error.message });
    }
  };
}
