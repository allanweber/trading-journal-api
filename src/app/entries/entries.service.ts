import { Entry } from "@prisma/client";
import { getPortfolioBalance } from "../portfolio/portfolio.service";
import { balanceEntry } from "./balance";
import { create, deleteOne, get, getAll, update } from "./entries.repository";

export const queryEntries = async (
  userEmail: string,
  portfolioId: string,
  query?: string,
  entryType?: string[],
  direction?: string[],
  pageSize: number = 10,
  page: number = 1
) => {
  let queries = {};
  if (query) {
    queries = { symbol: { contains: query } };
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
  return await getAll(userEmail, portfolioId, queries, pageSize, page);
};

export const getEntry = async (userEmail: string, portfolioId: string, id: string) => {
  return await get(userEmail, portfolioId, id);
};

export const deleteEntry = async (userEmail: string, portfolioId: string, id: string) => {
  return await deleteOne(userEmail, portfolioId, id);
};

export const saveEntry = async (userEmail: string, portfolioId: string, entry: Entry) => {
  const balance = await getPortfolioBalance(userEmail, entry.portfolioId);
  if (!balance) {
    throw new Error(`Portfolio id ${entry.portfolioId} does not exist.`);
  }

  const balanced = await balanceEntry(entry, balance);

  let entryById = undefined;
  if (entry.id) entryById = await getEntry(userEmail, portfolioId, entry.id);

  if (entryById) {
    return await update(userEmail, portfolioId, balanced);
  } else {
    return await create(userEmail, portfolioId, balanced);
  }
};
