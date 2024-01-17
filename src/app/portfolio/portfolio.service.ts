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
      balances: {
        create: {
          balance: portfolio.startBalance,
          date: new Date(portfolio.startDate.getFullYear(), portfolio.startDate.getMonth() + 1, portfolio.startDate.getDate()),
        },
      },
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

export const updatePortfolioBalance = async (userEmail: string, portfolioId: string, balanceDate: Date, balanceChange: number) => {
  const portfolio = await getPortfolio(userEmail, portfolioId);
  if (!portfolio) {
    throw new Error(`Portfolio id ${portfolioId} does not exist.`);
  }

  const newBalance = portfolio.currentBalance + balanceChange;

  await prismaClient.portfolio.update({
    where: {
      id: portfolio.id,
      user: userEmail,
    },
    data: {
      currentBalance: newBalance,
    },
  });

  const balanceAtDate = new Date(balanceDate.getFullYear(), balanceDate.getMonth(), balanceDate.getDate());

  const balanceRecord = await prismaClient.balance.findUnique({
    where: {
      portfolioId_date: {
        portfolioId: portfolioId,
        date: balanceAtDate,
      },
    },
  });

  if (balanceRecord && balanceRecord.date.toDateString() === portfolio.startDate.toDateString()) {
    await prismaClient.balance.update({
      where: {
        portfolioId_date: {
          portfolioId: portfolioId,
          date: balanceAtDate,
        },
      },
      data: {
        balance: newBalance,
      },
    });
  } else {
    if (balanceRecord) {
      const changedBalance = balanceRecord.balance - newBalance + balanceChange;
      if (changedBalance === 0) {
        console.log("Deleting balance record");
        await prismaClient.balance.delete({
          where: {
            portfolioId_date: {
              portfolioId: portfolioId,
              date: balanceAtDate,
            },
          },
        });
      } else {
        await prismaClient.balance.update({
          where: {
            portfolioId_date: {
              portfolioId: portfolioId,
              date: balanceAtDate,
            },
          },
          data: {
            balance: changedBalance,
          },
        });
      }
    } else {
      await prismaClient.balance.create({
        data: {
          portfolioId: portfolioId,
          date: balanceAtDate,
          balance: newBalance,
        },
      });
    }
  }
};
