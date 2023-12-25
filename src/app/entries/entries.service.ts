import { Entry } from '@prisma/client';
import { prismaClient } from '../../loaders/prisma';
import { getJournalBalance } from '../journals/journals.service';
import { Paginated, Pagination } from '../model/pagination';
import { balanceEntry } from './balance.service';

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
    queries = { symbol: { contains: query } };
  }
  if (journals) {
    queries = {
      ...queries,
      journalId: { in: journals },
    };
  }
  if (entryType) {
    queries = {
      ...queries,
      entryType: { in: entryType },
    };
  }
  if (direction) {
    queries = {
      ...queries,
      direction: { in: direction },
    };
  }

  const result = await prismaClient.entry.findMany({
    where: {
      user: userEmail,
      ...queries,
    },
    include: {
      journal: true,
    },
    skip: pageSize * (page - 1),
    take: pageSize,
    orderBy: {
      date: 'desc',
    },
  });

  const rows = await prismaClient.entry.count({
    where: {
      user: userEmail,
      ...queries,
    },
  });

  return new Paginated(result, new Pagination(pageSize, page, rows));
};

export const getEntry = async (userEmail: string, id: string) => {
  const entry = await prismaClient.entry.findUnique({
    where: {
      id,
      user: userEmail,
    },
    include: {
      journal: true,
    },
  });

  return entry;
};

export const deleteEntry = async (userEmail: string, id: string) => {
  await prismaClient.entry.delete({
    where: {
      id,
      user: userEmail,
    },
  });
};

export const saveEntry = async (userEmail: string, entry: Entry) => {
  const balance = await getJournalBalance(userEmail, entry.journalId);
  if (!balance) {
    throw new Error(`Journal id ${entry.journalId} does not exist.`);
  }
  const balancedEntry = await balanceEntry(entry, balance);

  const result = await prismaClient.entry.upsert({
    where: {
      id: balancedEntry.id || '',
      user: userEmail,
    },
    update: {
      date: balancedEntry.date,
      price: balancedEntry.price,
      entryType: balancedEntry.entryType,
      notes: balancedEntry.notes ?? null,
      symbol: balancedEntry.symbol ?? null,
      direction: balancedEntry.direction ?? null,
      size: balancedEntry.size ?? null,
      profit: balancedEntry.profit ?? null,
      loss: balancedEntry.loss ?? null,
      costs: balancedEntry.costs ?? null,
      exitDate: balancedEntry.exitDate ?? null,
      exitPrice: balancedEntry.exitPrice ?? null,
      result: balancedEntry.result ?? null,
      grossResult: balancedEntry.grossResult ?? null,
      accountChange: balancedEntry.accountChange ?? null,
      accountBalance: balancedEntry.accountBalance ?? null,
      accountRisk: balancedEntry.accountRisk ?? null,
      plannedRR: balancedEntry.plannedRR ?? null,
    },
    create: {
      user: userEmail,
      journalId: balancedEntry.journalId,
      date: balancedEntry.date,
      price: balancedEntry.price,
      entryType: balancedEntry.entryType,
      notes: balancedEntry.notes ?? null,
      symbol: balancedEntry.symbol ?? null,
      direction: balancedEntry.direction ?? null,
      size: balancedEntry.size ?? null,
      profit: balancedEntry.profit ?? null,
      loss: balancedEntry.loss ?? null,
      costs: balancedEntry.costs ?? null,
      exitDate: balancedEntry.exitDate ?? null,
      exitPrice: balancedEntry.exitPrice ?? null,
      result: balancedEntry.result ?? null,
      grossResult: balancedEntry.grossResult ?? null,
      accountChange: balancedEntry.accountChange ?? null,
      accountBalance: balancedEntry.accountBalance ?? null,
      accountRisk: balancedEntry.accountRisk ?? null,
      plannedRR: balancedEntry.plannedRR ?? null,
    },
  });

  return result;
};
