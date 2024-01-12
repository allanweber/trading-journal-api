import { Portfolio } from '@prisma/client';
import { prismaClient } from '../../loaders/prisma';
import { getOnlyDate } from '../../utils/dateTime';

export const getPortfolios = async (userEmail: string) => {
  const portfolios = await prismaClient.portfolio.findMany({
    where: {
      user: userEmail,
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  return portfolios;
};

export const getPortfolio = async (userEmail: string, id: string) => {
  const portfolio = await prismaClient.portfolio.findUnique({
    where: {
      id,
      user: userEmail,
    },
  });

  return portfolio;
};

export const savePortfolio = async (
  userEmail: string,
  portfolio: Portfolio
) => {
  return await prismaClient.portfolio.upsert({
    where: {
      id: portfolio.id || '',
      user: userEmail,
    },
    update: {
      name: portfolio.name,
      description: portfolio.description,
      currency: portfolio.currency,
    },
    create: {
      name: portfolio.name,
      user: userEmail,
      description: portfolio.description,
      startDate: portfolio.startDate,
      startBalance: portfolio.startBalance,
      currency: portfolio.currency,
      currentBalance: portfolio.startBalance,
      balances: {
        create: {
          balance: portfolio.startBalance,
          date: getOnlyDate(portfolio.startDate),
        },
      },
    },
  });
};

export const deletePortfolio = async (userEmail: string, id: string) => {
  await prismaClient.portfolio.delete({
    where: {
      id,
      user: userEmail,
    },
  });
};

export const getPortfolioBalance = async (userEmail: string, id: string) => {
  const portfolio = await prismaClient.portfolio.findUnique({
    where: {
      id,
      user: userEmail,
    },
  });

  return parseFloat(portfolio?.currentBalance?.toFixed(2));
};
