import { ObjectId } from 'mongodb';
import mongoClient from '../../loaders/mongodb';
import { getDbName } from '../../utils/database';
import { getJournal, getJournalData } from '../journals/journals.service';
import {
  Deposit,
  Dividend,
  Taxes,
  Trade,
  Withdrawal,
  entrySchema,
} from '../model/entry';
import { Paginated, Pagination } from '../model/pagination';
import { balance } from './balance.service';

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
    queries = { name: { $regex: query, $options: 'i' } };
  }
  if (journals) {
    queries = {
      ...queries,
      journal: { $in: journals },
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

export const saveDeposit = async (userEmail: string, deposit: Deposit) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const entry = await balance(entrySchema.parse(deposit));

  const { _id, ...record } = entry;

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

export const saveDividend = async (userEmail: string, dividend: Dividend) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const entry = await balance(entrySchema.parse(dividend));

  const { _id, ...record } = entry;

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

export const saveTax = async (userEmail: string, tax: Taxes) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const entry = await balance(entrySchema.parse(tax));

  const { _id, ...record } = entry;

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

export const saveWithdrawal = async (
  userEmail: string,
  withdrawal: Withdrawal
) => {
  const entry = await balance(entrySchema.parse(withdrawal));

  const result = saveEntry(userEmail, entry);

  return result;
};

export const saveTrade = async (userEmail: string, trade: Trade) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const entry = await balance(entrySchema.parse(trade));

  const { _id, ...record } = entry;

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

const saveEntry = async (
  userEmail: string,
  entry: Trade | Deposit | Taxes | Dividend | Withdrawal
) => {
  const client = await mongoClient;
  const dbName = getDbName(userEmail);

  const { _id, ...record } = entry;

  const journal = await getJournal(userEmail, entry.journalId);

  if (!journal) {
    throw new Error(`Journal id ${entry.journalId} does not exist.`);
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
