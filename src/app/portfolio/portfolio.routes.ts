import { Portfolio } from "@prisma/client";
import { Response, Router } from "express";
import logger from "../../logger";
import { AuthenticatedRequest } from "../../routes/authenticated";
import protectRoute from "../../routes/protected";
import { Route } from "../../routes/route";
import { deletePortfolio, getPortfolio, getPortfolios, savePortfolio } from "./portfolio.service";

export class PortfolioRoutes extends Route {
  constructor(app: Router) {
    super(app, "portfolios");
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.get("/", [protectRoute], this.getAll);
    this.route.get("/:id", [protectRoute], this.get);
    this.route.post("/", [protectRoute], this.save);
    this.route.delete("/:id", [protectRoute], this.deleteOne);
  };

  private getAll = async (req: AuthenticatedRequest, res: Response) => {
    const response = await getPortfolios(req.email);
    return res.status(200).json(response);
  };

  private get = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const portfolio = await getPortfolio(req.email, id);

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    return res.status(200).json(portfolio);
  };

  private save = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = req.body as Portfolio;
      const response = await savePortfolio(req.email, portfolio);
      return res.status(portfolio.id ? 200 : 201).json(response);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

  private deleteOne = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    await deletePortfolio(req.email, id);

    return res.status(200).json(id);
  };
}
