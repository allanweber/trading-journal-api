export class UpdateBalance {
  constructor(
    public portfolioId: string,
    public date: Date,
    public value: number,
    public entryId: string
  ) {}
}
