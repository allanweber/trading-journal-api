import { Router } from 'express';
import { EntriesRoutes } from '../app/entries/entries.routes';
import { PortfolioRoutes } from '../app/portfolio/portfolio.routes';

export default () => {
  const app = Router();
  new PortfolioRoutes(app);
  new EntriesRoutes(app);
  return app;
};
