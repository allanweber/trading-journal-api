import { Portfolio } from "@prisma/client";
import { prismaClient } from "../../loaders/prisma";

export const getPortfolios = async (userEmail: string) => {
  return await await prismaClient.portfolio.findMany({
    where: {
      user: userEmail,
    },
    orderBy: {
      startDate: "desc",
    },
  });
};

export const getPortfolio = async (userEmail: string, id: string) => {
  return await await prismaClient.portfolio.findUnique({
    where: {
      id,
      user: userEmail,
    },
  });
};

export const savePortfolio = async (userEmail: string, portfolio: Portfolio) => {
  if (typeof portfolio.startDate === "string") {
    portfolio.startDate = new Date(portfolio.startDate);
  }

  return await prismaClient.portfolio.upsert({
    where: {
      id: portfolio.id || "",
    },
    update: {
      name: portfolio.name,
      description: portfolio.description,
      currency: portfolio.currency,
    },
    create: {
      ...portfolio,
      currentBalance: portfolio.startBalance,
      user: userEmail,
    },
  });
};

export const deletePortfolio = async (userEmail: string, id: string) => {
  return await prismaClient.portfolio.deleteMany({
    where: {
      id,
      user: userEmail,
    },
  });
};

export const getPortfolioBalance = async (userEmail: string, id: string) => {
  const portfolio = await getPortfolio(userEmail, id);
  return parseFloat(portfolio?.currentBalance?.toFixed(2));
};

export const updatePortfolioBalance = async (portfolioId: string, valueChanged: number) => {
  return await prismaClient.portfolio.update({
    where: {
      id: portfolioId,
    },
    data: {
      currentBalance: {
        increment: valueChanged,
      },
    },
  });
};
