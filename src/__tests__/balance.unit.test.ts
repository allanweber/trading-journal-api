import { Direction, Entry, EntryType } from "@prisma/client";
import { balanceEntry } from "../app/entries/balance";

describe("balanceEntry", () => {
  it("should calculate balance for Deposit entry", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.DEPOSIT,
      price: 1234.56,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.DEPOSIT);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(1234.56);
    expect(result.grossResult).toBe(1234.56);
  });

  it("should calculate balance for Withdrawal entry", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.WITHDRAWAL,
      price: 1234.56,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.WITHDRAWAL);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(-1234.56);
    expect(result.grossResult).toBe(1234.56);
  });

  it("should calculate balance for Dividend entry", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.DIVIDEND,
      price: 45.67,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.DIVIDEND);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(45.67);
    expect(result.grossResult).toBe(45.67);
  });

  it("should calculate balance for Taxes entry", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.TAXES,
      price: 12.34,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.TAXES);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(-12.34);
    expect(result.grossResult).toBe(12.34);
  });

  it("should calculate balance for Fees entry", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.FEES,
      price: 12.34,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.FEES);
    expect(result.exitDate).toBe(entry.date);
    expect(result.result).toBe(-12.34);
    expect(result.grossResult).toBe(12.34);
  });

  it("should not calculate balance for Trade because it is still open", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.STOCK,
      price: 500,
      size: 2,
      direction: Direction.LONG,
    };
    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.STOCK);
    expect(result.result).toBeUndefined();
    expect(result.grossResult).toBeUndefined();
    expect(result.returnPercentage).toBeUndefined();
    expect(result.plannedRR).toBeUndefined();
  });

  it("should calculate balance for winning Long Trade", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.STOCK,
      price: 465.78,
      size: 2.34,
      direction: Direction.LONG,
      exitDate: new Date(),
      exitPrice: 654.32,
      costs: 9.55,
      loss: 450,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.STOCK);
    expect(result.result).toBe(431.63);
    expect(result.grossResult).toBe(441.18);
    expect(result.returnPercentage).toBe(0.9267);
    expect(result.plannedRR).toBeUndefined();
  });

  it("should calculate PlannedRR for Long Trade", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.STOCK,
      price: 100,
      size: 2,
      direction: Direction.LONG,
      profit: 200,
      loss: 50,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.STOCK);
    expect(result.plannedRR).toBe(2);
    expect(result.result).toBeUndefined();
    expect(result.grossResult).toBeUndefined();
    expect(result.returnPercentage).toBeUndefined();
  });

  it("should calculate balance for losing Long Trade", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.STOCK,
      price: 543.21,
      size: 1.56,
      direction: Direction.LONG,
      exitDate: new Date(),
      exitPrice: 432.19,
      costs: 9.55,
      loss: 501.66,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.STOCK);
    expect(result.result).toBe(-182.74);
    expect(result.grossResult).toBe(-173.19);
    expect(result.returnPercentage).toBe(-0.3364);
    expect(result.plannedRR).toBeUndefined();
  });

  it("should calculate balance for winning Short Trade", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.STOCK,
      price: 598.78,
      size: 3.12,
      direction: Direction.SHORT,
      exitDate: new Date(),
      exitPrice: 456.78,
      costs: 9.55,
      loss: 630,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.STOCK);
    expect(result.result).toBe(433.49);
    expect(result.grossResult).toBe(443.04);
    expect(result.returnPercentage).toBe(0.724);
    expect(result.plannedRR).toBeUndefined();
  });

  it("should calculate balance for loosing Short Trade", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.STOCK,
      price: 879.54,
      size: 2.5,
      direction: Direction.SHORT,
      exitDate: new Date(),
      exitPrice: 999.99,
      costs: 9.55,
      loss: 900.12,
    };

    const result = await balanceEntry(entry as Entry);

    expect(result.entryType).toBe(EntryType.STOCK);
    expect(result.result).toBe(-310.68);
    expect(result.grossResult).toBe(-301.13);
    expect(result.returnPercentage).toBe(-0.3532);
    expect(result.plannedRR).toBeUndefined();
  });

  it("trying to balance not implemented entry type should throw an error", async () => {
    const entry: Partial<Entry> = {
      entryType: EntryType.CRYPTO,
    };

    await expect(balanceEntry(entry as Entry)).rejects.toThrow(
      `Entry type ${entry.entryType} not supported`
    );

    entry.entryType = EntryType.FOREX;
    await expect(balanceEntry(entry as Entry)).rejects.toThrow(
      `Entry type ${entry.entryType} not supported`
    );

    entry.entryType = EntryType.FUTURES;
    await expect(balanceEntry(entry as Entry)).rejects.toThrow(
      `Entry type ${entry.entryType} not supported`
    );

    entry.entryType = EntryType.INDEX;
    await expect(balanceEntry(entry as Entry)).rejects.toThrow(
      `Entry type ${entry.entryType} not supported`
    );

    entry.entryType = EntryType.OPTION;
    await expect(balanceEntry(entry as Entry)).rejects.toThrow(
      `Entry type ${entry.entryType} not supported`
    );
  });
});
