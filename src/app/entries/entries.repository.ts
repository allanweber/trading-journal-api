import { Entry } from "@prisma/client";
import { prismaClient } from "../../loaders/prisma";
import { Paginated, Pagination } from "../model/pagination";

export const getAll = async (
  userEmail: string,
  portfolioId: string,
  queries = {},
  pageSize: number = 10,
  page: number = 1
) => {
  const result = await prismaClient.entry.findMany({
    where: {
      user: userEmail,
      portfolioId,
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

export const get = async (userEmail: string, portfolioId: string, id: string) => {
  const entry = await prismaClient.entry.findUnique({
    where: {
      id,
      portfolioId,
      user: userEmail,
    },
    include: {
      portfolio: true,
    },
  });

  return entry;
};

export const deleteOne = async (userEmail: string, portfolioId: string, id: string) => {
  await prismaClient.entry.deleteMany({
    where: {
      id,
      portfolioId,
      user: userEmail,
    },
  });
};

export const create = async (userEmail: string, portfolioId: string, entry: Entry) => {
  return await prismaClient.entry.create({
    data: {
      user: userEmail,
      portfolioId,
      ...entry,
    },
  });
};

export const update = async (userEmail: string, portfolioId: string, entry: Entry) => {
  return await prismaClient.entry.update({
    where: {
      user: userEmail,
      portfolioId,
      id: entry.id,
    },
    data: {
      ...entry,
    },
  });
};
