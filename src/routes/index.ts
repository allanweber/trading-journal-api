import { Router } from 'express';
import { EntriesRoutes } from '../app/entries/entries.routes';
import { JournalsRoutes } from '../app/journals/journals.routes';

export default () => {
  const app = Router();
  new JournalsRoutes(app);
  new EntriesRoutes(app);
  return app;
};
