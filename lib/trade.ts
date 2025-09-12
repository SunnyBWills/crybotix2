import { z } from "zod";

const numString = z.string().refine((s) => s === "" || !isNaN(Number(s)), {
  message: "Invalid",
});

export const tradeSchema = z.object({
  symbol: z.string(),
  long_entry: numString,
  long_tp: numString,
  long_sl: numString,
  long_volume: numString,
  short_entry: numString,
  short_tp: numString,
  short_sl: numString,
  short_volume: numString,
});

export type TradeData = z.infer<typeof tradeSchema>;
