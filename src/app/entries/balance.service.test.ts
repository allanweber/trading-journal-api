import { Direction, Entry, EntryType } from '@prisma/client';
import { balanceEntry } from './balance.service';

describe('balanceEntry', () => {
  it('should calculate balance for Deposit entry', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.DEPOSIT,
      price: 1234.56,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.DEPOSIT);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(1234.56);
    expect(result.grossResult).toBe(1234.56);
    expect(result.accountChange).toBe(1.25);
    expect(result.accountBalance).toBe(2222.21);
  });

  it('should calculate balance for Withdrawal entry', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.WITHDRAWAL,
      price: 1234.56,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.WITHDRAWAL);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(-1234.56);
    expect(result.grossResult).toBe(1234.56);
    expect(result.accountChange).toBe(-1.25);
    expect(result.accountBalance).toBe(-246.91);
  });

  it('should calculate balance for Dividend entry', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.DIVIDEND,
      price: 45.67,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.DIVIDEND);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(45.67);
    expect(result.grossResult).toBe(45.67);
    expect(result.accountChange).toBe(0.0462);
    expect(result.accountBalance).toBe(1033.32);
  });

  it('should calculate balance for Taxes entry', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TAXES,
      price: 12.34,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.TAXES);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(-12.34);
    expect(result.grossResult).toBe(12.34);
    expect(result.accountChange).toBe(-0.0125);
    expect(result.accountBalance).toBe(975.31);
  });

  it('should not calculate balance for Trade because it is still open', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TRADE,
      price: 500,
      size: 2,
      direction: Direction.LONG,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.TRADE);
    expect(result.result).toBeUndefined();
    expect(result.grossResult).toBeUndefined();
    expect(result.accountChange).toBeUndefined();
    expect(result.accountBalance).toBeUndefined();
  });

  it('should calculate balance for winning Long Trade', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TRADE,
      price: 465.78,
      size: 2.34,
      direction: Direction.LONG,
      exitDate: new Date(),
      exitPrice: 654.32,
      costs: 9.55,
      loss: 450,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.TRADE);
    expect(result.result).toBe(431.63);
    expect(result.grossResult).toBe(441.18);
    expect(result.accountChange).toBe(0.437);
    expect(result.accountRisk).toBe(0.0374);
    expect(result.accountBalance).toBe(1419.28);
  });

  it('should calculate balance for losing Long Trade', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TRADE,
      price: 543.21,
      size: 1.56,
      direction: Direction.LONG,
      exitDate: new Date(),
      exitPrice: 432.19,
      costs: 9.55,
      loss: 501.66,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.TRADE);
    expect(result.result).toBe(-182.74);
    expect(result.grossResult).toBe(-173.19);
    expect(result.accountChange).toBe(-0.185);
    expect(result.accountRisk).toBe(0.0656);
    expect(result.accountBalance).toBe(804.91);
  });

  it('should calculate balance for winning Short Trade', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TRADE,
      price: 598.78,
      size: 3.12,
      direction: Direction.SHORT,
      exitDate: new Date(),
      exitPrice: 456.78,
      costs: 9.55,
      loss: 630,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.TRADE);
    expect(result.result).toBe(433.49);
    expect(result.grossResult).toBe(443.04);
    expect(result.accountChange).toBe(0.4389);
    expect(result.accountRisk).toBe(0.0986);
    expect(result.accountBalance).toBe(1421.14);
  });

  it('should calculate balance for loosing Short Trade', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TRADE,
      price: 879.54,
      size: 2.5,
      direction: Direction.SHORT,
      exitDate: new Date(),
      exitPrice: 999.99,
      costs: 9.55,
      loss: 900.12,
    };
    const balance = 987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.TRADE);
    expect(result.result).toBe(-310.68);
    expect(result.grossResult).toBe(-301.13);
    expect(result.accountChange).toBe(-0.3146);
    expect(result.accountRisk).toBe(0.0521);
    expect(result.accountBalance).toBe(676.97);
  });

  it('should calculate balance for winning Trade on a negative current balance', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TRADE,
      price: 598.78,
      size: 3.12,
      direction: Direction.SHORT,
      exitDate: new Date(),
      exitPrice: 456.78,
      costs: 9.55,
      loss: 630,
    };
    const balance = -987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.TRADE);
    expect(result.result).toBe(433.49);
    expect(result.grossResult).toBe(443.04);
    expect(result.accountChange).toBe(0.4389);
    expect(result.accountRisk).toBe(0.0986);
    expect(result.accountBalance).toBe(-554.16);
  });

  it('should calculate balance for loosing Trade on a negative current balance', async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TRADE,
      price: 879.54,
      size: 2.5,
      direction: Direction.SHORT,
      exitDate: new Date(),
      exitPrice: 999.99,
      costs: 9.55,
      loss: 900.12,
    };
    const balance = -987.65;

    const result = await balanceEntry(entry as Entry, balance);

    expect(result.entryType).toBe(EntryType.TRADE);
    expect(result.result).toBe(-310.68);
    expect(result.grossResult).toBe(-301.13);
    expect(result.accountChange).toBe(-0.3146);
    expect(result.accountRisk).toBe(0.0521);
    expect(result.accountBalance).toBe(-1298.33);
  });
});
