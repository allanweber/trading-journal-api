import { z } from "zod";

export const exitEntrySchema = z.object({
  exitDate: z.coerce.date(),
  exitPrice: z.coerce.number().max(9999999999, { message: "exitPrice-max" }),
});

export type ExitEntry = z.infer<typeof exitEntrySchema>;
