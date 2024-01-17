import express from "express";
import loaders from "../loaders";
import { prismaClient } from "../loaders/prisma";
import { setupTestContainer, teardownTestContainer } from "../test-setup";
import { depositEntriesSuite } from "./deposit.entries.suite";
import { dividendEntriesSuite } from "./dividend.entries.suite";
import { feesEntriesSuite } from "./fees.entries.suite";
import { multipleStockEntriesSuite } from "./multiple-stocks.entries.suite";
import { portfoliosSuite } from "./portfolios.suite";
import { stockEntriesSuite } from "./stock.entries.suite";
import { taxesEntriesSuite } from "./taxes.entries.suite";
import { withdrawalEntriesSuite } from "./withdrawal.entries.suite";

const app = express();

jest.mock("../routes/protected", () => {
  return jest.fn((req, res, next) => {
    req.email = "mail@mail.com";
    next();
  });
});

describe("Manage Trades", () => {
  jest.setTimeout(60000);
  beforeAll(async () => {
    await setupTestContainer();
    await loaders(app);
  });

  afterAll(async () => {
    await teardownTestContainer();
  });

  afterEach(async () => {
    await prismaClient.portfolio.deleteMany();
  });

  portfoliosSuite(app);
  depositEntriesSuite(app);
  withdrawalEntriesSuite(app);
  taxesEntriesSuite(app);
  feesEntriesSuite(app);
  dividendEntriesSuite(app);
  stockEntriesSuite(app);
  multipleStockEntriesSuite(app);
});
