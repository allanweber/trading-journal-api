import { Response, Router } from 'express';
import { AuthenticatedRequest } from '../../routes/authenticated';
import { protectRoute } from '../../routes/protected';
import { Route } from '../../routes/route';
import { Paginated, Pagination } from '../model/pagination';

export class JournalRoutes extends Route {
  constructor(app: Router) {
    super(app, 'journals');
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.get('/', [protectRoute], this.getJournals);
  };

  private getJournals = async (req: AuthenticatedRequest, res: Response) => {
    const journals = [
      {
        id: '1',
        name: 'SP500',
        description: 'INDEXSP: .INX',
        currency: 'USD',
        startDate: new Date('2023-01-19T00:00:00.000Z'),
        startBalance: 10000,
        balance: {
          current: 12678.89,
        },
      },
      {
        id: '2',
        name: 'AMEX1',
        description: 'Amsterdam journal',
        currency: 'EUR',
        startDate: new Date('2023-03-01T00:00:00.000Z'),
        startBalance: 9568.23,
        balance: {
          current: -1234.56,
        },
      },
      {
        id: '3',
        name: 'WINW21',
        description: 'Bovespa journal',
        currency: 'BRL',
        startDate: new Date('2023-02-28T00:00:00.000Z'),
        startBalance: 9568.23,
        balance: {
          current: 7891.45,
        },
      },
    ];
    const response = new Paginated(journals, new Pagination(10, 1, 3));
    return res.status(200).json(response);
  };
}
