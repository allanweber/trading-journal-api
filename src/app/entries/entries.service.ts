import { Entry, EntryType, OrderStatus } from "@prisma/client";
import { prismaClient } from "../../loaders/prisma";
import { ExitEntry } from "../model/exit-entry";
import { Paginated, Pagination } from "../model/pagination";
import { updatePortfolioBalance } from "../portfolio/portfolio.service";
import { getPortfolioBalance } from "./../portfolio/portfolio.service";
import { balanceEntry, calculatePlannedRR } from "./balance";

export const queryEntries = async (
  userEmail: string,
  portfolioId: string,
  query?: string,
  entryType?: string[],
  statuses?: string[],
  direction?: string[],
  pageSize: number = 10,
  page: number = 1
) => {
  let queries = {};
  if (query) {
    queries = { symbol: { contains: query, mode: "insensitive" } };
  }
  if (entryType) {
    queries = {
      ...queries,
      entryType: { in: entryType },
    };
  }

  if (statuses) {
    const resultQueries = [];
    if (statuses.includes("OPEN")) {
      resultQueries.push({ result: { equals: null } });
    }
    if (statuses.includes("LOSS")) {
      resultQueries.push({ result: { lt: 0 } });
    }
    if (statuses.includes("WIN")) {
      resultQueries.push({ result: { gt: 0 } });
    }
    queries = {
      ...queries,
      OR: [...resultQueries],
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
      portfolioId,
      entryType: {
        notIn: [EntryType.DEPOSIT, EntryType.WITHDRAWAL, EntryType.TAXES, EntryType.FEES],
      },
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
      portfolioId,
      entryType: {
        notIn: [EntryType.DEPOSIT, EntryType.WITHDRAWAL, EntryType.TAXES, EntryType.FEES],
      },
      ...queries,
    },
  });

  return new Paginated(result, new Pagination(pageSize, page, rows));
};

export const getPortfolioBalances = async (userEmail: string, portfolioId: string) => {
  return await prismaClient.entry.findMany({
    where: {
      user: userEmail,
      portfolioId,
      entryType: {
        in: [EntryType.DEPOSIT, EntryType.WITHDRAWAL, EntryType.TAXES, EntryType.FEES],
      },
    },
    include: {
      portfolio: true,
    },
    orderBy: {
      date: "asc",
    },
  });
};

export const getEntry = async (userEmail: string, portfolioId: string, id: string) => {
  return await await prismaClient.entry.findUnique({
    where: {
      id,
      portfolioId,
      user: userEmail,
    },
    include: {
      portfolio: true,
    },
  });
};

export const deleteEntry = async (userEmail: string, portfolioId: string, id: string) => {
  const entry = await prismaClient.entry.findUnique({
    where: {
      id,
      portfolioId,
      user: userEmail,
    },
  });

  if (entry.orderStatus === OrderStatus.CLOSED) {
    const balance = await getPortfolioBalance(userEmail, portfolioId);
    if (!balance) {
      throw new Error(`Portfolio id ${portfolioId} does not exist.`);
    }
    await updatePortfolioBalance(portfolioId, entry.result * -1);
  }

  return await prismaClient.entry.delete({
    where: {
      id,
      portfolioId,
      user: userEmail,
    },
  });
};

export const createEntry = async (userEmail: string, portfolioId: string, entry: Entry) => {
  //TODO: Generate ORDER reference properly
  if (!entry.orderRef) entry.orderRef = Math.random().toString(36).substring(7);

  const created = await prismaClient.entry.create({
    data: {
      ...entry,
      user: userEmail,
      portfolioId,
      orderStatus: OrderStatus.OPEN,
    },
  });

  if (
    created.entryType === EntryType.DEPOSIT ||
    created.entryType === EntryType.WITHDRAWAL ||
    created.entryType === EntryType.TAXES ||
    created.entryType === EntryType.DIVIDEND ||
    created.entryType === EntryType.FEES
  ) {
    return closeEntry(userEmail, portfolioId, created.id, {
      exitDate: created.date,
      exitPrice: created.price,
    });
  }
  return created;
};

export const updateEntry = async (userEmail: string, portfolioId: string, entryId: string, entry: Entry) => {
  const entryById = await prismaClient.entry.findUnique({
    where: {
      user: userEmail,
      portfolioId,
      id: entryId,
    },
    include: {
      portfolio: true,
    },
  });

  if (
    entryById.entryType === EntryType.DEPOSIT ||
    entryById.entryType === EntryType.WITHDRAWAL ||
    entryById.entryType === EntryType.TAXES ||
    entryById.entryType === EntryType.FEES
  ) {
    return prismaClient.entry.update({
      where: {
        user: userEmail,
        portfolioId,
        id: entryId,
      },
      data: {
        notes: entry.notes ?? null,
      },
    });
  }

  if (entryById.entryType === EntryType.DIVIDEND) {
    return prismaClient.entry.update({
      where: {
        user: userEmail,
        portfolioId,
        id: entryId,
      },
      data: {
        symbol: entry.symbol,
        notes: entry.notes,
      },
    });
  }

  if (entryById.orderStatus === OrderStatus.CLOSED) {
    return prismaClient.entry.update({
      where: {
        user: userEmail,
        portfolioId,
        id: entryId,
      },
      data: {
        notes: entry.notes,
      },
    });
  } else {
    entry.plannedRR = calculatePlannedRR(entry);
    return prismaClient.entry.update({
      where: {
        user: userEmail,
        portfolioId,
        id: entryId,
      },
      data: {
        date: entry.date,
        price: entry.price,
        notes: entry.notes ?? null,
        symbol: entry.symbol ?? null,
        direction: entry.direction ?? null,
        size: entry.size ?? null,
        profit: entry.profit ?? null,
        loss: entry.loss ?? null,
        costs: entry.costs ?? null,
        plannedRR: entry.plannedRR ?? null,
      },
    });
  }
};

export const closeEntry = async (userEmail: string, portfolioId: string, entryId: string, exitEntry: ExitEntry) => {
  const balance = await getPortfolioBalance(userEmail, portfolioId);
  if (!balance) {
    throw new Error(`Portfolio id ${portfolioId} does not exist.`);
  }
  const entry = await prismaClient.entry.findUnique({
    where: {
      user: userEmail,
      portfolioId: portfolioId,
      id: entryId,
    },
  });

  if (entry.orderStatus === OrderStatus.CLOSED) {
    return entry;
  }

  if (entry.date > exitEntry.exitDate) {
    throw new Error(`Exit date must be after entry date.`);
  }

  entry.exitDate = exitEntry.exitDate;
  entry.exitPrice = exitEntry.exitPrice;
  entry.costs = exitEntry.costs ?? entry.costs;

  const balanced = await balanceEntry(entry);
  await updatePortfolioBalance(portfolioId, balanced.result);

  return prismaClient.entry.update({
    where: {
      user: userEmail,
      portfolioId: portfolioId,
      id: entryId,
    },
    data: {
      ...balanced,
    },
  });
};
