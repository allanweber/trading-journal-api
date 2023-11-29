import { Response, Router } from 'express';
import mongoClient from '../../loaders/mongodb';
import logger from '../../logger';
import { AuthenticatedRequest } from '../../routes/authenticated';
import { protectRoute } from '../../routes/protected';
import { Route } from '../../routes/route';
import { getDbName } from '../../utils/database';
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
    const { query, currency, pageSize, page } = req.query;

    const size = pageSize ? parseInt(pageSize as string) : 10;
    const pageNumber = page ? parseInt(page as string) : 1;

    let queries = {};
    if (query) {
      queries = { name: { $regex: query, $options: 'i' } };
    }
    if (currency) {
      queries = {
        ...queries,
        currency: { $in: currency.toString().split(',') },
      };
    }

    const client = await mongoClient;
    const dbName = getDbName(req.email);
    logger.info('req.email =>' + req.email);
    logger.info('dbName =>' + dbName);
    const COLLECTION = 'journals';

    const [
      {
        total: [total = 0],
        journals,
      },
    ] = await client
      .db(dbName)
      .collection(COLLECTION)
      .aggregate([
        { $match: queries },
        {
          $facet: {
            total: [{ $group: { _id: 1, count: { $sum: 1 } } }],
            journals: [
              { $sort: { startDate: -1 } },
              { $skip: size * (pageNumber - 1) },
              { $limit: size },
            ],
          },
        },
        {
          $project: {
            total: '$total.count',
            journals: '$journals',
          },
        },
      ])
      .toArray();

    const response = new Paginated(
      journals,
      new Pagination(size, pageNumber, total)
    );

    return res.status(200).json(response);
  };
}
