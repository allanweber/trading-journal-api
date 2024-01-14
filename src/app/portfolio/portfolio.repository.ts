import { Portfolio } from "@prisma/client";
import { prismaClient } from "../../loaders/prisma";

export const getAll = async (userEmail: string) => {
  const portfolios = await prismaClient.portfolio.findMany({
    where: {
      user: userEmail,
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return portfolios;
};

export const get = async (userEmail: string, id: string) => {
  const portfolio = await prismaClient.portfolio.findUnique({
    where: {
      id,
      user: userEmail,
    },
  });

  return portfolio;
};

export const deleteOne = async (userEmail: string, id: string) => {
  await prismaClient.portfolio.deleteMany({
    where: {
      id,
      user: userEmail,
    },
  });
};

export const create = async (userEmail: string, portfolio: Portfolio) => {
  return await prismaClient.portfolio.create({
    data: {
      ...portfolio,
      currentBalance: portfolio.startBalance,
      user: userEmail,
      balances: {
        create: {
          balance: portfolio.startBalance,
          date: portfolio.startDate,
        },
      },
    },
  });
};

export const update = async (userEmail: string, portfolio: Portfolio) => {
  return await prismaClient.portfolio.update({
    where: {
      id: portfolio.id,
      user: userEmail,
    },
    data: {
      name: portfolio.name,
      description: portfolio.description,
      currency: portfolio.currency,
    },
  });
};
