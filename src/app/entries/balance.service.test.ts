import { Direction } from '../model/direction';
import { Deposit, Dividend, Taxes, Trade, Withdrawal } from '../model/entry';
import { EntryType } from '../model/entryType';
import { Balance } from '../model/journal';
import { balanceEntry } from './balance.service';

describe('balanceEntry', () => {
  it('should calculate balance for Deposit entry', async () => {
    const entry: Deposit = {
      entryType: EntryType.Deposit,
      price: 1234.56,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Deposit);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(1234.56);
    expect(result.grossResult).toBe(1234.56);
    expect(result.accountChange).toBe(1.25);
    expect(result.accountBalance).toBe(2222.21);
  });

  it('should calculate balance for Withdrawal entry', async () => {
    const entry: Withdrawal = {
      entryType: EntryType.Withdrawal,
      price: 1234.56,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Withdrawal);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(-1234.56);
    expect(result.grossResult).toBe(1234.56);
    expect(result.accountChange).toBe(-1.25);
    expect(result.accountBalance).toBe(-246.91);
  });

  it('should calculate balance for Dividend entry', async () => {
    const entry: Dividend = {
      entryType: EntryType.Dividend,
      price: 45.67,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Dividend);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(45.67);
    expect(result.grossResult).toBe(45.67);
    expect(result.accountChange).toBe(0.0462);
    expect(result.accountBalance).toBe(1033.32);
  });

  it('should calculate balance for Taxes entry', async () => {
    const entry: Taxes = {
      entryType: EntryType.Taxes,
      price: 12.34,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Taxes);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(-12.34);
    expect(result.grossResult).toBe(12.34);
    expect(result.accountChange).toBe(-0.0125);
    expect(result.accountBalance).toBe(975.31);
  });

  it('should not calculate balance for Trade because it is still open', async () => {
    const entry: Trade = {
      entryType: EntryType.Trade,
      price: 500,
      size: 2,
      direction: Direction.Long,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Trade);
    expect(result.result).toBeUndefined();
    expect(result.grossResult).toBeUndefined();
    expect(result.accountChange).toBeUndefined();
    expect(result.accountBalance).toBeUndefined();
  });

  it('should calculate balance for winning Long Trade', async () => {
    const entry: Trade = {
      entryType: EntryType.Trade,
      price: 465.78,
      size: 2.34,
      direction: Direction.Long,
      exitDate: new Date(),
      exitPrice: 654.32,
      costs: 9.55,
      loss: 450,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Trade);
    expect(result.result).toBe(431.63);
    expect(result.grossResult).toBe(441.18);
    expect(result.accountChange).toBe(0.437);
    expect(result.accountRisk).toBe(0.0374);
    expect(result.accountBalance).toBe(1419.28);
  });

  it('should calculate balance for losing Long Trade', async () => {
    const entry: Trade = {
      entryType: EntryType.Trade,
      price: 543.21,
      size: 1.56,
      direction: Direction.Long,
      exitDate: new Date(),
      exitPrice: 432.19,
      costs: 9.55,
      loss: 501.66,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Trade);
    expect(result.result).toBe(-182.74);
    expect(result.grossResult).toBe(-173.19);
    expect(result.accountChange).toBe(-0.185);
    expect(result.accountRisk).toBe(0.0656);
    expect(result.accountBalance).toBe(804.91);
  });

  it('should calculate balance for winning Short Trade', async () => {
    const entry: Trade = {
      entryType: EntryType.Trade,
      price: 598.78,
      size: 3.12,
      direction: Direction.Short,
      exitDate: new Date(),
      exitPrice: 456.78,
      costs: 9.55,
      loss: 630,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Trade);
    expect(result.result).toBe(433.49);
    expect(result.grossResult).toBe(443.04);
    expect(result.accountChange).toBe(0.4389);
    expect(result.accountRisk).toBe(0.0986);
    expect(result.accountBalance).toBe(1421.14);
  });

  it('should calculate balance for loosing Short Trade', async () => {
    const entry: Trade = {
      entryType: EntryType.Trade,
      price: 879.54,
      size: 2.5,
      direction: Direction.Short,
      exitDate: new Date(),
      exitPrice: 999.99,
      costs: 9.55,
      loss: 900.12,
    };
    const balance: Balance = {
      current: 987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Trade);
    expect(result.result).toBe(-310.68);
    expect(result.grossResult).toBe(-301.13);
    expect(result.accountChange).toBe(-0.3146);
    expect(result.accountRisk).toBe(0.0521);
    expect(result.accountBalance).toBe(676.97);
  });

  it('should calculate balance for winning Trade on a negative current balance', async () => {
    const entry: Trade = {
      entryType: EntryType.Trade,
      price: 598.78,
      size: 3.12,
      direction: Direction.Short,
      exitDate: new Date(),
      exitPrice: 456.78,
      costs: 9.55,
      loss: 630,
    };
    const balance: Balance = {
      current: -987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Trade);
    expect(result.result).toBe(433.49);
    expect(result.grossResult).toBe(443.04);
    expect(result.accountChange).toBe(0.4389);
    expect(result.accountRisk).toBe(0.0986);
    expect(result.accountBalance).toBe(-554.16);
  });

  it('should calculate balance for loosing Trade on a negative current balance', async () => {
    const entry: Trade = {
      entryType: EntryType.Trade,
      price: 879.54,
      size: 2.5,
      direction: Direction.Short,
      exitDate: new Date(),
      exitPrice: 999.99,
      costs: 9.55,
      loss: 900.12,
    };
    const balance: Balance = {
      current: -987.65,
    };

    const result = await balanceEntry(entry, balance);

    expect(result.entryType).toBe(EntryType.Trade);
    expect(result.result).toBe(-310.68);
    expect(result.grossResult).toBe(-301.13);
    expect(result.accountChange).toBe(-0.3146);
    expect(result.accountRisk).toBe(0.0521);
    expect(result.accountBalance).toBe(-1298.33);
  });
});
