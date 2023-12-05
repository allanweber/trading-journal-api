import { z } from 'zod';

export const balanceSchema = z.object({
  current: z
    .number({
      required_error: 'current-balance-required',
      invalid_type_error: 'current-balance-positive',
    })
    .max(9999999999, { message: 'current-balance-max' }),
});

export type Balance = z.infer<typeof balanceSchema>;

export const journalSchema = z.object({
  _id: z.string().optional(),
  name: z
    .string({
      required_error: 'name-required',
    })
    .min(5, {
      message: 'name-min',
    })
    .max(30, {
      message: 'name-max',
    }),
  description: z.string().optional(),
  startDate: z.coerce.date({
    required_error: 'start-date-required',
  }),
  startBalance: z
    .number({
      required_error: 'start-balance-required',
      invalid_type_error: 'start-balance-positive',
    })
    .positive({ message: 'start-balance-positive' })
    .max(9999999999, { message: 'start-balance-max' }),
  currency: z.string({
    required_error: 'currency-required',
  }),
  balance: balanceSchema.optional(),
});

export type Journal = z.infer<typeof journalSchema>;
