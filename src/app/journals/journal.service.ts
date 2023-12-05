import { ObjectId } from 'mongodb';
import mongoClient from '../../loaders/mongodb';
import { getDbName } from '../../utils/database';
import { Journal } from '../model/journal';
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

export const getJournal = async (userEmail: string, id: string) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const journal = await client
    .db(dbName)
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  return journal;
};

export const saveJournal = async (userEmail: string, journal: Journal) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const { _id, ...record } = journal;

  if (!_id) {
    record.balance = { current: record.startBalance };
  } else {
    const currentJournal = await getJournal(userEmail, _id);
    record.balance = currentJournal.balance;
  }

  const result = await client
    .db(dbName)
    .collection(COLLECTION)
    .updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...record } },
      { upsert: true }
    )
    .then(() => record);

  return result;
};

export const deleteJournal = async (userEmail: string, id: string) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const result = await client
    .db(dbName)
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  return result;
};
