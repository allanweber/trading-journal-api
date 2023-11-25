import { Router } from 'express';
import { JournalRoutes } from '../app/journals/journal.routes';

export default () => {
  const app = Router();
  new JournalRoutes(app);
  return app;
};
