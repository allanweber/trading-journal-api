import { Router } from 'express';
import { EntriesRoutes } from '../app/entries/entries.routes';
import { EntryImagesRoutes } from '../app/entries/entry.images.routes';
import { PortfolioRoutes } from '../app/portfolio/portfolio.routes';
import { UserRoutes } from '../app/user/user.routes';

export default () => {
  const app = Router();
  new PortfolioRoutes(app);
  new EntriesRoutes(app);
  new EntryImagesRoutes(app);
  new UserRoutes(app);
  return app;
};
