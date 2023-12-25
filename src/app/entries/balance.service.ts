import { Direction, Entry, EntryType } from '@prisma/client';

export const balanceEntry = async (entry: Entry, balance: number) => {
  if (entry.entryType === EntryType.TRADE) {
    entry = balanceTrade(entry, balance);
  } else {
    entry.grossResult = entry.price;
    if (entry.entryType === EntryType.DEPOSIT) {
      entry.result = entry.price;
      entry.exitDate = entry.date;
    }
    if (entry.entryType === EntryType.WITHDRAWAL) {
      entry.result = entry.price * -1;
      entry.exitDate = entry.date;
    }
    if (entry.entryType === EntryType.DIVIDEND) {
      entry.result = entry.price;
      entry.exitDate = entry.date;
    }
    if (entry.entryType === EntryType.TAXES) {
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
    if (entry.direction === Direction.LONG) {
      const result = parseFloat(
        ((entry.exitPrice - entry.price) * entry.size).toFixed(2)
      );
      entry.result = result - (entry.costs ? entry.costs : 0);
      entry.grossResult = result;
    } else {
      const result = parseFloat(
        ((entry.price - entry.exitPrice) * entry.size).toFixed(2)
      );
      entry.result = result - (entry.costs ? entry.costs : 0);
      entry.grossResult = result;
    }
  }

  if (entry.loss) {
    let accountRisk = undefined;
    if (entry.direction === Direction.LONG) {
      accountRisk = parseFloat(
        (((entry.price - entry.loss) * entry.size) / balance).toFixed(4)
      );
    } else {
      accountRisk = parseFloat(
        (((entry.loss - entry.price) * entry.size) / balance).toFixed(4)
      );
    }
    if (accountRisk < 0) {
      accountRisk = accountRisk * -1;
    }
    entry.accountRisk = accountRisk;
  }

  // if (entry.profit || entry.loss) {
  //   const profit = entry.profit || 0;
  //   const loss = entry.loss || 0;
  //   let reward;
  //   let risk;

  //   if (entry.direction === Direction.Long) {
  //     reward = profit - entry.price;
  //     risk = entry.price - loss;
  //   } else {
  //     reward = entry.price - profit;
  //     risk = loss - entry.price;
  //   }
  //   reward = reward * entry.size;
  //   risk = risk * entry.size;
  //   entry.plannedRR = parseFloat((reward / risk).toFixed(2));
  // }

  return entry;
};

const isTradeClosing = (entry: Entry) => {
  return entry.exitDate && entry.exitPrice;
};
