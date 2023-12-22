import { ObjectId } from 'mongodb';
import mongoClient from '../../loaders/mongodb';
import logger from '../../logger';
import { getDbName } from '../../utils/database';
import {
  getJournalBalance,
  getJournalData,
} from '../journals/journals.service';
import {
  Deposit,
  Dividend,
  Taxes,
  Trade,
  Withdrawal,
  entrySchema,
} from '../model/entry';
import { Paginated, Pagination } from '../model/pagination';
import { balanceEntry } from './balance.service';

const COLLECTION = 'entries';

export const queryEntries = async (
  userEmail: string,
  query?: string,
  journals?: string[],
  entryType?: string[],
  direction?: string[],
  pageSize: number = 10,
  page: number = 1
) => {
  let queries = {};
  if (query) {
    queries = { symbol: { $regex: query, $options: 'i' } };
  }
  if (journals) {
    queries = {
      ...queries,
      journalId: { $in: journals },
    };
  }
  if (entryType) {
    queries = {
      ...queries,
      entryType: { $in: entryType },
    };
  }
  if (direction) {
    queries = {
      ...queries,
      direction: { $in: direction },
    };
  }

  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const [
    {
      total: [total = 0],
      entries,
    },
  ] = await client
    .db(dbName)
    .collection(COLLECTION)
    .aggregate([
      { $match: queries },
      {
        $facet: {
          total: [{ $group: { _id: 1, count: { $sum: 1 } } }],
          entries: [
            { $sort: { startDate: -1 } },
            { $skip: pageSize * (page - 1) },
            { $limit: pageSize },
          ],
        },
      },
      {
        $project: {
          total: '$total.count',
          entries: '$entries',
        },
      },
    ])
    .toArray();

  const entriesWithJournal = await Promise.all(
    entries.map(async (entry) => {
      const journal = await getJournalData(userEmail, entry.journalId);
      return { ...entry, journal: journal };
    })
  );

  return new Paginated(
    entriesWithJournal,
    new Pagination(pageSize, page, total)
  );
};

export const getEntry = async (userEmail: string, id: string) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const entry = await client
    .db(dbName)
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  const journal = await getJournalData(userEmail, entry.journalId);
  entry.journal = journal;
  return entry;
};

export const deleteEntry = async (userEmail: string, id: string) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const entry = await client
    .db(dbName)
    .collection(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  return entry;
};

export const saveEntry = async (
  userEmail: string,
  entry: Trade | Deposit | Taxes | Dividend | Withdrawal
) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const balance = await getJournalBalance(userEmail, entry.journalId);

  if (!balance) {
    throw new Error(`Journal id ${entry.journalId} does not exist.`);
  }

  const parsedEntry = entrySchema.parse(entry);
  const balancedEntry = await balanceEntry(parsedEntry, balance);
  // if(balanceEntry.exitDate) {

  // }

  const { _id, ...record } = balancedEntry;

  const result = await client
    .db(dbName)
    .collection(COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $setOnInsert: { ...record } },
      { upsert: true, ignoreUndefined: false }
    );
  // .updateOne(
  //   { _id: new ObjectId(_id) },
  //   { $set: { ...record } },
  //   { upsert: true, ignoreUndefined: false }
  // );

  logger.info(`Saved entry ${JSON.stringify(result)}`);

  return result;
};
