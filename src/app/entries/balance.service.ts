import { Entry } from '../model/entry';
import { EntryType } from '../model/entryType';

export const balance = async (entry: Entry) => {
  if (entry.entryType === EntryType.Deposit) {
    entry.result = entry.price;
  }
  if (entry.entryType === EntryType.Withdrawal) {
    entry.result = entry.price * -1;
  }
  if (entry.entryType === EntryType.Dividend) {
    entry.result = entry.price;
  }
  if (entry.entryType === EntryType.Taxes) {
    entry.result = entry.price * -1;
  }
  if (entry.entryType === EntryType.Trade) {
    // entry.result = entry.profit ? entry.profit : entry.loss * -1;
  }
  return entry;
};
