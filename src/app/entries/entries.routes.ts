import { Response, Router } from 'express';
import protectRoute from '../../routes/protected';
import { Route } from '../../routes/route';

import { Entry, OrderStatus } from '@prisma/client';
import logger from '../../logger';
import portfolioRequired, { AuthenticatedRequestWithPortfolio } from '../../routes/portfolioRequired';
import { exitEntrySchema } from '../model/exit-entry';
import {
  changeEntryNotes,
  closeEntry,
  createEntry,
  deleteEntry,
  getEntry,
  getPortfolioBalances,
  queryEntries,
  updateEntry,
} from './entries.service';

export class EntriesRoutes extends Route {
  constructor(app: Router) {
    super(app, 'portfolios');
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.get('/:portfolioId/entries', [protectRoute, portfolioRequired], this.getAll);
    this.route.get('/:portfolioId/entries/balances', [protectRoute, portfolioRequired], this.getAllPortfoliosBalances);
    this.route.get('/:portfolioId/entries/:id', [protectRoute, portfolioRequired], this.get);
    this.route.delete('/:portfolioId/entries/:id', [protectRoute, portfolioRequired], this.delete);
    this.route.post('/:portfolioId/entries', [protectRoute, portfolioRequired], this.post);
    this.route.patch('/:portfolioId/entries/:id', [protectRoute, portfolioRequired], this.patch);
    this.route.patch('/:portfolioId/entries/:id/close', [protectRoute, portfolioRequired], this.patchClose);
    this.route.patch('/:portfolioId/entries/:id/notes', [protectRoute, portfolioRequired], this.patchNotes);
  };

  private getAll = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { query, type, status, direction, pageSize, page } = req.query;

    const queryFilter = query ? query.toString() : undefined;
    const entryType = type ? (type as string).split(',') : undefined;
    const entryStatuses = status ? (status as string).split(',') : undefined;
    const tradeDirection = direction ? (direction as string).split(',') : undefined;
    const size = pageSize ? parseInt(pageSize as string) : 10;
    const pageNumber = page ? parseInt(page as string) : 1;

    const response = await queryEntries(
      req.email,
      req.portfolioId,
      queryFilter,
      entryType,
      entryStatuses,
      tradeDirection,
      size,
      pageNumber
    );

    return res.status(200).json(response);
  };

  private getAllPortfoliosBalances = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const response = await getPortfolioBalances(req.email, req.portfolioId);

    return res.status(200).json(response);
  };

  private get = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    const { id } = req.params;

    const entry = await getEntry(req.email, req.portfolioId, id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    return res.status(200).json(entry);
  };

  private delete = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    try {
      const { id } = req.params;

      await deleteEntry(req.email, req.portfolioId, id);

      return res.status(200).json(id);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

  private post = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    try {
      const response = await createEntry(req.email, req.portfolioId, req.body as Entry);

      return res.status(201).json(response);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

  private patch = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    try {
      const { id } = req.params;

      const entryById = await getEntry(req.email, req.portfolioId, id);
      if (!entryById) {
        return res.status(404).json({ message: 'Entry not found' });
      }

      const response = await updateEntry(req.email, req.portfolioId, id, req.body as Entry);

      return res.status(200).json(response);
    } catch (error) {
      logger.error(JSON);
      return res.status(500).json({ message: error.message });
    }
  };

  private patchClose = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    try {
      const { id } = req.params;

      const exitEntry = exitEntrySchema.safeParse(req.body);
      if (exitEntry.success === false) {
        return res.status(400).json(exitEntry.error);
      }

      if (exitEntry.data.exitDate && new Date(exitEntry.data.exitDate) > new Date()) {
        return res.status(400).json({ message: 'Exit date cannot be in the future' });
      }

      const entryById = await getEntry(req.email, req.portfolioId, id);
      if (!entryById) {
        return res.status(400).json({ message: 'Entry not found' });
      }

      if (entryById.orderStatus === OrderStatus.CLOSED) {
        return res.status(400).json({ message: 'Cannot close a closed trade' });
      }

      const response = await closeEntry(req.email, req.portfolioId, id, exitEntry.data);

      return res.status(200).json(response);
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

  private patchNotes = async (req: AuthenticatedRequestWithPortfolio, res: Response) => {
    try {
      const { id } = req.params;

      const entryById = await getEntry(req.email, req.portfolioId, id);
      if (!entryById) {
        return res.status(404).json({ message: 'Entry not found' });
      }

      await changeEntryNotes(req.email, req.portfolioId, id, req.body.notes);

      return res.status(200).json({ notes: req.body.notes });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ message: error.message });
    }
  };
}
