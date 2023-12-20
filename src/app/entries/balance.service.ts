import { Direction } from '../model/direction';
import { Entry } from '../model/entry';
import { EntryType } from '../model/entryType';
import { Balance } from '../model/journal';

export const balanceEntry = async (entry: Entry, balance: Balance) => {
  if (entry.entryType === EntryType.Trade) {
    entry = balanceTrade(entry);
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
    let accountChange = parseFloat((entry.result / balance.current).toFixed(4));
    if (accountChange < 0 && entry.result > 0) {
      accountChange = accountChange * -1;
    }
    if (accountChange > 0 && entry.result < 0) {
      accountChange = accountChange * -1;
    }
    entry.accountChange = accountChange;
  }

  //TODO:accountBalance

  return entry;
};

const balanceTrade = (entry: Entry): Entry => {
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

  //TODO:account Risked

  return entry;
};

const isTradeClosing = (entry: Entry) => {
  return entry.exitDate && entry.exitPrice;
};
