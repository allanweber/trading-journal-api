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
import { EntryType } from '../model/entryType';
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
      const { body } = req;

      let parse = undefined;
      switch (body.entryType) {
        case EntryType.Deposit:
          parse = depositSchema.safeParse(body);
          break;
        case EntryType.Dividend:
          parse = dividendSchema.safeParse(body);
          break;
        case EntryType.Taxes:
          parse = taxesSchema.safeParse(body);
          break;
        case EntryType.Withdrawal:
          parse = withdrawalSchema.safeParse(body);
          break;
        case EntryType.Trade:
          parse = tradeSchema.safeParse(body);
          break;
        default:
          return res.status(400).json({ message: 'Invalid entry type' });
      }

      if (parse.success === false) {
        return res.status(400).json({ message: parse.error.message });
      }

      const response = await saveEntry(req.email, parse.data);

      return res.status(parse.data._id ? 200 : 201).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}
