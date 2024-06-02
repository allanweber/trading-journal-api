import { Direction, Entry, EntryType, OrderStatus } from '@prisma/client';

export const balanceEntry = async (entry: Entry) => {
  if (entry.entryType === EntryType.STOCK) {
    entry = balanceTrade(entry);
    if (entry.result) {
      const investedAmount = entry.price * entry.size;
      entry.returnPercentage = parseFloat((entry.result / investedAmount).toFixed(4));
    }
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

  return entry;
};

const balanceTrade = (entry: Entry): Entry => {
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

  entry.plannedRR = calculatePlannedRR(entry);

  return entry;
};

const isTradeClosing = (entry: Entry) => {
  return entry.exitDate && entry.exitPrice;
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
