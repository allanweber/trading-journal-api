import { Journal } from '@prisma/client';
import { Response, Router } from 'express';
import { AuthenticatedRequest } from '../../routes/authenticated';
import { protectRoute } from '../../routes/protected';
import { Route } from '../../routes/route';
import {
  deleteJournal,
  getAllJournals,
  getJournal,
  queryJournals,
  saveJournal,
} from './journals.service';

export class JournalsRoutes extends Route {
  constructor(app: Router) {
    super(app, 'journals');
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.get('/', [protectRoute], this.getJournals);
    this.route.get('/all', [protectRoute], this.getAllJournals);
    this.route.get('/:id', [protectRoute], this.getJournal);
    this.route.post('/', [protectRoute], this.saveJournal);
    this.route.delete('/:id', [protectRoute], this.deleteJournal);
  };

  private getJournals = async (req: AuthenticatedRequest, res: Response) => {
    const { query, currency, pageSize, page } = req.query;

    const queryFilter = query ? query.toString() : undefined;
    const size = pageSize ? parseInt(pageSize as string) : 10;
    const pageNumber = page ? parseInt(page as string) : 1;
    const currencies = currency ? (currency as string).split(',') : undefined;

    const response = await queryJournals(
      req.email,
      queryFilter,
      currencies,
      size,
      pageNumber
    );

    return res.status(200).json(response);
  };

  private getJournal = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const journal = await getJournal(req.email, id);

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    return res.status(200).json(journal);
  };

  private saveJournal = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const journal = req.body as Journal;
      const response = await saveJournal(req.email, journal);
      return res.status(journal.id ? 200 : 201).json(response);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  private deleteJournal = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    await deleteJournal(req.email, id);

    return res.status(200).json(id);
  };

  private getAllJournals = async (req: AuthenticatedRequest, res: Response) => {
    const journals = await getAllJournals(req.email);

    return res.status(200).json(journals);
  };
}
