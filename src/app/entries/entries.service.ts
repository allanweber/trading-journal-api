import { Entry } from "@prisma/client";
import { prismaClient } from "../../loaders/prisma";
import { Paginated, Pagination } from "../model/pagination";
import { getPortfolioBalance } from "../portfolio/portfolio.service";
import { balanceEntry } from "./balance";

export const queryEntries = async (
  userEmail: string,
  query?: string,
  portfolios?: string[],
  entryType?: string[],
  direction?: string[],
  pageSize: number = 10,
  page: number = 1
) => {
  let queries = {};
  if (query) {
    queries = { symbol: { contains: query } };
  }
  if (portfolios) {
    queries = {
      ...queries,
      portfolioId: { in: portfolios },
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
      portfolio: true,
    },
    orderBy: {
      date: "desc",
    },
    skip: pageSize * (page - 1),
    take: pageSize,
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
      portfolio: true,
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
  const balance = await getPortfolioBalance(userEmail, entry.portfolioId);
  if (!balance) {
    throw new Error(`Portfolio id ${entry.portfolioId} does not exist.`);
  }

  const balanced = await balanceEntry(entry, balance);

  const result = await prismaClient.entry.upsert({
    where: {
      id: balanced.id || "",
      user: userEmail,
    },
    create: {
      ...balanced,
      user: userEmail,
    },
    update: {
      ...balanced,
    },
  });

  return result;
};
