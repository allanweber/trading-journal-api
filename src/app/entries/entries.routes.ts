import { Response, Router } from 'express';
import { AuthenticatedRequest } from '../../routes/authenticated';
import { protectRoute } from '../../routes/protected';
import { Route } from '../../routes/route';
import {
  depositSchema,
  dividendSchema,
  taxesSchema,
  tradeSchema,
  withdrawalSchema,
} from '../model/entry';
import {
  deleteEntry,
  getEntry,
  queryEntries,
  saveDeposit,
  saveDividend,
  saveTax,
  saveTrade,
  saveWithdrawal,
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
    this.route.post('/deposits', [protectRoute], this.saveDeposit);
    this.route.post('/dividends', [protectRoute], this.saveDividend);
    this.route.post('/taxes', [protectRoute], this.saveTax);
    this.route.post('/withdrawals', [protectRoute], this.saveWithdrawal);
    this.route.post('/trades', [protectRoute], this.saveTrade);
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

  private saveDeposit = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { body } = req;
      const parse = depositSchema.safeParse(body);
      if (parse.success === false) {
        return res.status(400).json({ message: parse.error.message });
      }

      const response = await saveDeposit(req.email, body);

      return res.status(parse.data._id ? 200 : 201).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  private saveDividend = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { body } = req;
      const parse = dividendSchema.safeParse(body);
      if (parse.success === false) {
        return res.status(400).json({ message: parse.error.message });
      }

      const response = await saveDividend(req.email, body);

      return res.status(parse.data._id ? 200 : 201).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  private saveTax = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { body } = req;
      const parse = taxesSchema.safeParse(body);
      if (parse.success === false) {
        return res.status(400).json({ message: parse.error.message });
      }

      const response = await saveTax(req.email, body);

      return res.status(parse.data._id ? 200 : 201).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  private saveWithdrawal = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { body } = req;
      const parse = withdrawalSchema.safeParse(body);
      if (parse.success === false) {
        return res.status(400).json({ message: parse.error.message });
      }

      const response = await saveWithdrawal(req.email, body);

      return res.status(parse.data._id ? 200 : 201).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  private saveTrade = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { body } = req;
      const parse = tradeSchema.safeParse(body);
      if (parse.success === false) {
        return res.status(400).json({ message: parse.error.message });
      }

      const response = await saveTrade(req.email, body);

      return res.status(parse.data._id ? 200 : 201).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}
