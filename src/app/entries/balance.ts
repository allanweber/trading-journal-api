import { Direction, Entry, EntryType, OrderStatus } from "@prisma/client";

export const balanceEntry = async (entry: Entry, balance: number) => {
  if (entry.entryType === EntryType.STOCK) {
    entry = balanceTrade(entry, balance);
  } else if (
    entry.entryType === EntryType.OPTION ||
    entry.entryType === EntryType.CRYPTO ||
    entry.entryType === EntryType.FUTURES ||
    entry.entryType === EntryType.FOREX ||
    entry.entryType === EntryType.INDEX
  ) {
    throw new Error(`Entry type ${entry.entryType} not supported`);
  } else {
    entry.grossResult = entry.price;
    entry.orderStatus = OrderStatus.CLOSED;
    if (entry.entryType === EntryType.DEPOSIT || entry.entryType === EntryType.DIVIDEND) {
      entry.result = entry.price;
      entry.exitDate = entry.date;
    }
    if (
      entry.entryType === EntryType.WITHDRAWAL ||
      entry.entryType === EntryType.FEES ||
      entry.entryType === EntryType.TAXES
    ) {
      entry.result = entry.price * -1;
      entry.exitDate = entry.date;
    }
  }

  if (entry.result) {
    let accountChange = parseFloat((entry.result / balance).toFixed(4));
    if (accountChange < 0 && entry.result > 0) {
      accountChange = accountChange * -1;
    }
    if (accountChange > 0 && entry.result < 0) {
      accountChange = accountChange * -1;
    }
    entry.accountChange = accountChange;
  }

  if (entry.result) {
    entry.accountBalance = parseFloat((balance + entry.result).toFixed(2));
  }

  return entry;
};

const balanceTrade = (entry: Entry, balance: number): Entry => {
  if (isTradeClosing(entry)) {
    entry.orderStatus = OrderStatus.CLOSED;
    if (entry.direction === Direction.LONG) {
      const result = parseFloat(((entry.exitPrice - entry.price) * entry.size).toFixed(2));
      entry.result = result - (entry.costs ? entry.costs : 0);
      entry.grossResult = result;
    } else {
      const result = parseFloat(((entry.price - entry.exitPrice) * entry.size).toFixed(2));
      entry.result = result - (entry.costs ? entry.costs : 0);
      entry.grossResult = result;
    }
  }

  entry.accountRisk = calculateAccountRisk(entry, balance);
  entry.plannedRR = calculatePlannedRR(entry);

  return entry;
};

const isTradeClosing = (entry: Entry) => {
  return entry.exitDate && entry.exitPrice;
};

export const calculateAccountRisk = (entry: Entry, balance: number) => {
  let accountRisk = undefined;
  if (entry.loss) {
    if (entry.direction === Direction.LONG) {
      accountRisk = parseFloat((((entry.price - entry.loss) * entry.size) / balance).toFixed(4));
    } else {
      accountRisk = parseFloat((((entry.loss - entry.price) * entry.size) / balance).toFixed(4));
    }
    if (accountRisk < 0) {
      accountRisk = accountRisk * -1;
    }
  }
  return accountRisk;
};

export const calculatePlannedRR = (entry: Entry) => {
  let plannedRR = undefined;
  if (entry.profit && entry.loss) {
    const profit = entry.profit || 0;
    const loss = entry.loss || 0;
    let reward;
    let risk;

    if (entry.direction === Direction.LONG) {
      reward = profit - entry.price;
      risk = entry.price - loss;
    } else {
      reward = entry.price - profit;
      risk = loss - entry.price;
    }
    reward = reward * entry.size;
    risk = risk * entry.size;
    plannedRR = parseFloat((reward / risk).toFixed(2));
  }
  return plannedRR;
};
