import { Journal } from '@prisma/client';
import { prismaClient } from '../../loaders/prisma';
import { getOnlyDate } from '../../utils/dateTime';
import { Paginated, Pagination } from '../model/pagination';

export const queryJournals = async (
  userEmail: string,
  query?: string,
  currencies?: string[],
  pageSize: number = 10,
  page: number = 1
) => {
  let queries = {};
  if (query) {
    queries = { name: { contains: query } };
  }
  if (currencies) {
    queries = {
      ...queries,
      currency: { in: currencies },
    };
  }

  const result = await prismaClient.journal.findMany({
    where: {
      user: userEmail,
      ...queries,
    },
    skip: pageSize * (page - 1),
    take: pageSize,
    orderBy: {
      startDate: 'desc',
    },
  });

  const rows = await prismaClient.journal.count({
    where: {
      user: userEmail,
      ...queries,
    },
  });

  return new Paginated(result, new Pagination(pageSize, page, rows));
};

export const getJournal = async (userEmail: string, id: string) => {
  const journal = await prismaClient.journal.findUnique({
    where: {
      id,
      user: userEmail,
    },
  });

  return journal;
};

export const saveJournal = async (userEmail: string, journal: Journal) => {
  return await prismaClient.journal.upsert({
    where: {
      id: journal.id || '',
      user: userEmail,
    },
    update: {
      name: journal.name,
      description: journal.description,
      currency: journal.currency,
    },
    create: {
      name: journal.name,
      user: userEmail,
      description: journal.description,
      startDate: journal.startDate,
      startBalance: journal.startBalance,
      currency: journal.currency,
      currentBalance: journal.startBalance,
      balances: {
        create: {
          balance: journal.startBalance,
          date: getOnlyDate(journal.startDate),
        },
      },
    },
  });
};

export const deleteJournal = async (userEmail: string, id: string) => {
  await prismaClient.journal.delete({
    where: {
      id,
      user: userEmail,
    },
  });
};

export const getAllJournals = async (userEmail: string) => {
  return await prismaClient.journal.findMany({
    where: {
      user: userEmail,
    },
  });
};

export const getJournalBalance = async (userEmail: string, id: string) => {
  const journal = await prismaClient.journal.findUnique({
    where: {
      id,
      user: userEmail,
    },
  });

  return parseFloat(journal?.currentBalance?.toFixed(2));
};
