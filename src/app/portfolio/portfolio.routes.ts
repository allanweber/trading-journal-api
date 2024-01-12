import { Portfolio } from '@prisma/client';
import { Response, Router } from 'express';
import { AuthenticatedRequest } from '../../routes/authenticated';
import { protectRoute } from '../../routes/protected';
import { Route } from '../../routes/route';
import {
  deletePortfolio,
  getPortfolio,
  getPortfolios,
  savePortfolio,
} from './portfolio.service';

export class PortfolioRoutes extends Route {
  constructor(app: Router) {
    super(app, 'portfolios');
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.get('/', [protectRoute], this.getPortfolios);
    this.route.get('/:id', [protectRoute], this.getPortfolio);
    this.route.post('/', [protectRoute], this.savePortfolio);
    this.route.delete('/:id', [protectRoute], this.deletePortfolio);
  };

  private getPortfolios = async (req: AuthenticatedRequest, res: Response) => {
    const response = await getPortfolios(req.email);
    return res.status(200).json(response);
  };

  private getPortfolio = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const portfolio = await getPortfolio(req.email, id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    return res.status(200).json(portfolio);
  };

  private savePortfolio = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const portfolio = req.body as Portfolio;
      const response = await savePortfolio(req.email, portfolio);
      return res.status(portfolio.id ? 200 : 201).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  private deletePortfolio = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const { id } = req.params;

    await deletePortfolio(req.email, id);

    return res.status(200).json(id);
  };
}
