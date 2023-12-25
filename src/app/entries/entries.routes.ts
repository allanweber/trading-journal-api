import { Response, Router } from 'express';
import { AuthenticatedRequest } from '../../routes/authenticated';
import { protectRoute } from '../../routes/protected';
import { Route } from '../../routes/route';

import { Entry } from '@prisma/client';
import logger from '../../logger';
import {
  deleteEntry,
  getEntry,
  queryEntries,
  saveEntry,
} from './entries.service';

export class EntriesRoutes extends Route {
  constructor(app: Router) {
    super(app, 'entries');
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.get('/', [protectRoute], this.getEntries);
    this.route.get('/:id', [protectRoute], this.getEntry);
    this.route.delete('/:id', [protectRoute], this.deleteEntry);
    this.route.post('/', [protectRoute], this.saveEntry);
  };

  private getEntries = async (req: AuthenticatedRequest, res: Response) => {
    const { query, journal, type, direction, pageSize, page } = req.query;

    const queryFilter = query ? query.toString() : undefined;
    const journals = journal ? (journal as string).split(',') : undefined;
    const entryType = type ? (type as string).split(',') : undefined;
    const tradeDirection = direction
      ? (direction as string).split(',')
      : undefined;
    const size = pageSize ? parseInt(pageSize as string) : 10;
    const pageNumber = page ? parseInt(page as string) : 1;

    const response = await queryEntries(
      req.email,
      queryFilter,
      journals,
      entryType,
      tradeDirection,
      size,
      pageNumber
    );

    return res.status(200).json(response);
  };

  private getEntry = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const entry = await getEntry(req.email, id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    return res.status(200).json(entry);
  };

  private deleteEntry = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    await deleteEntry(req.email, id);

    return res.status(200).json(id);
  };

  private saveEntry = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const entry = req.body as Entry;

      const response = await saveEntry(req.email, entry);

      return res.status(entry.id ? 200 : 201).json(response);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: error.message });
    }
  };
}
