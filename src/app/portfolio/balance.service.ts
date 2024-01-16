import { prismaClient } from "../../loaders/prisma";

export const saveBalance = async (portfolioId: string, date: Date, balance: number) => {
  await prismaClient.balance.upsert({
    where: {
      portfolioId_date: {
        portfolioId,
        date,
      },
    },
    update: {
      balance,
    },
    create: {
      portfolioId,
      date,
      balance,
    },
  });
};
