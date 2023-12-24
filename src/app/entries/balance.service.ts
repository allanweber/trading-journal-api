import { Direction } from '../model/direction';
import { Entry } from '../model/entry';
import { EntryType } from '../model/entryType';

export const balanceEntry = async (entry: Entry, balance: number) => {
  if (entry.entryType === EntryType.Trade) {
    entry = balanceTrade(entry, balance);
  } else {
    entry.grossResult = entry.price;
    if (entry.entryType === EntryType.Deposit) {
      entry.result = entry.price;
      entry.exitDate = entry.date;
    }
    if (entry.entryType === EntryType.Withdrawal) {
      entry.result = entry.price * -1;
      entry.exitDate = entry.date;
    }
    if (entry.entryType === EntryType.Dividend) {
      entry.result = entry.price;
      entry.exitDate = entry.date;
    }
    if (entry.entryType === EntryType.Taxes) {
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
    if (entry.direction === Direction.Long) {
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

  //TODO:RR

  if (entry.loss) {
    let accountRisk = undefined;
    if (entry.direction === Direction.Long) {
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

  return entry;
};

const isTradeClosing = (entry: Entry) => {
  return entry.exitDate && entry.exitPrice;
};
