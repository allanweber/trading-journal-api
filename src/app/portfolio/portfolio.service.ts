import { Portfolio } from "@prisma/client";
import { create, deleteOne, get, getAll, update } from "./portfolio.repository";

export const getPortfolios = async (userEmail: string) => {
  return await getAll(userEmail);
};

export const getPortfolio = async (userEmail: string, id: string) => {
  return await get(userEmail, id);
};

export const savePortfolio = async (userEmail: string, portfolio: Portfolio) => {
  let portfolioById = undefined;
  if (portfolio.id) portfolioById = await getPortfolio(userEmail, portfolio.id);

  if (portfolioById) {
    return await update(userEmail, portfolio);
  } else {
    return await create(userEmail, portfolio);
  }
};

export const deletePortfolio = async (userEmail: string, id: string) => {
  return await deleteOne(userEmail, id);
};

export const getPortfolioBalance = async (userEmail: string, id: string) => {
  const portfolio = await getPortfolio(userEmail, id);
  return parseFloat(portfolio?.currentBalance?.toFixed(2));
};
