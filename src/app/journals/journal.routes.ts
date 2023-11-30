import { Response, Router } from 'express';
import { AuthenticatedRequest } from '../../routes/authenticated';
import { protectRoute } from '../../routes/protected';
import { Route } from '../../routes/route';
import { getJournal, queryJournals } from './journal.service';

export class JournalRoutes extends Route {
  constructor(app: Router) {
    super(app, 'journals');
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.get('/', [protectRoute], this.getJournals);
    this.route.get('/:id', [protectRoute], this.getJournal);
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
}
