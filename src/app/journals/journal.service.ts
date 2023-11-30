import mongoClient from '../../loaders/mongodb';
import { getDbName } from '../../utils/database';
import { Paginated, Pagination } from '../model/pagination';

const COLLECTION = 'journals';

export const queryJournals = async (
  userEmail: string,
  query?: string,
  currencies?: string[],
  pageSize: number = 10,
  page: number = 1
) => {
  let queries = {};
  if (query) {
    queries = { name: { $regex: query, $options: 'i' } };
  }
  if (currencies) {
    queries = {
      ...queries,
      currency: { $in: currencies },
    };
  }

  const client = await mongoClient;
  const dbName = getDbName(userEmail);

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
            { $skip: pageSize * (page - 1) },
            { $limit: pageSize },
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

  return new Paginated(journals, new Pagination(pageSize, page, total));
};
