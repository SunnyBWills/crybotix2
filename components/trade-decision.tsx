"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const numString = z.string().refine((s) => s === "" || !isNaN(Number(s)), {
  message: "Invalid",
});

export const tradeSchema = z.object({
  symbol: z.string(),
  long_entry: numString,
  long_tp: numString,
  long_sl: numString,
  short_entry: numString,
  short_tp: numString,
  short_sl: numString,
  volume: numString,
});

export type TradeData = z.infer<typeof tradeSchema>;

const formatNumber = (n: number) =>
  Number.isFinite(n) ? new Intl.NumberFormat().format(n) : "—";
const formatPercent = (n: number) =>
  Number.isFinite(n) ? `${(n * 100).toFixed(2)}%` : "—";
export function TradeDecision({ initial }: { initial: TradeData }) {
  const [data, setData] = useState<TradeData>(initial);

  const result = tradeSchema.safeParse(data);
  const errors = useMemo(() => {
    const map: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        map[issue.path[0] as string] = issue.message;
      }
    }
    return map;
  }, [result]);

  const metricsLong = useMemo(() => {
    const entry = Number(data.long_entry);
    const tp = Number(data.long_tp);
    const sl = Number(data.long_sl);
    if (!Number.isFinite(entry) || !Number.isFinite(tp) || !Number.isFinite(sl)) {
      return { profitRate: NaN, lossRate: NaN, rr: NaN };
    }
    const profitRate = (tp - entry) / entry;
    const lossRate = (entry - sl) / entry;
    return { profitRate, lossRate, rr: profitRate / Math.max(lossRate, 1e-9) };
  }, [data.long_entry, data.long_tp, data.long_sl]);

  const metricsShort = useMemo(() => {
    const entry = Number(data.short_entry);
    const tp = Number(data.short_tp);
    const sl = Number(data.short_sl);
    if (!Number.isFinite(entry) || !Number.isFinite(tp) || !Number.isFinite(sl)) {
      return { profitRate: NaN, lossRate: NaN, rr: NaN };
    }
    const profitRate = (entry - tp) / entry;
    const lossRate = (sl - entry) / entry;
    return { profitRate, lossRate, rr: profitRate / Math.max(lossRate, 1e-9) };
  }, [data.short_entry, data.short_tp, data.short_sl]);

  const handleChange = (field: keyof TradeData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setData({ ...data, [field]: e.target.value });

  const disabledLong =
    !result.success ||
    !data.volume ||
    !data.long_entry ||
    !data.long_tp ||
    !data.long_sl;

  const disabledShort =
    !result.success ||
    !data.volume ||
    !data.short_entry ||
    !data.short_tp ||
    !data.short_sl;

  const warnLong = !(
    Number(data.long_sl) < Number(data.long_entry) &&
    Number(data.long_entry) < Number(data.long_tp)
  );

  const warnShort = !(
    Number(data.short_tp) < Number(data.short_entry) &&
    Number(data.short_entry) < Number(data.short_sl)
  );

  async function onOrder(side: "long" | "short") {
    const entry = side === "long" ? data.long_entry : data.short_entry;
    const tp = side === "long" ? data.long_tp : data.short_tp;
    const sl = side === "long" ? data.long_sl : data.short_sl;
    await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side, symbol: data.symbol, entry, tp, sl, volume: data.volume }),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Volume"
          value={data.volume}
          onChange={handleChange("volume")}
        />
        {errors.volume && <p className="text-xs text-red-500">{errors.volume}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>Long Inputs</CardHeader>
          <CardContent>
            <div>
              <Input
                placeholder="Entry"
                value={data.long_entry}
                onChange={handleChange("long_entry")}
              />
              {errors.long_entry && (
                <p className="text-xs text-red-500">{errors.long_entry}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Take Profit"
                value={data.long_tp}
                onChange={handleChange("long_tp")}
              />
              {errors.long_tp && (
                <p className="text-xs text-red-500">{errors.long_tp}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Stop Loss"
                value={data.long_sl}
                onChange={handleChange("long_sl")}
              />
              {errors.long_sl && (
                <p className="text-xs text-red-500">{errors.long_sl}</p>
              )}
            </div>
            <div className="text-sm">
              Profit Rate: {formatPercent(metricsLong.profitRate)}
            </div>
            <div className="text-sm">
              Loss Rate: {formatPercent(metricsLong.lossRate)}
            </div>
            <div
              className={cn(
                "text-sm",
                metricsLong.rr < 1
                  ? "text-red-500"
                  : metricsLong.rr >= 1.5
                  ? "text-green-600"
                  : undefined
              )}
            >
              RR: {Number.isFinite(metricsLong.rr)
                ? metricsLong.rr.toFixed(2)
                : "—"}
            </div>
            {warnLong && (
              <div className="text-xs text-red-500">Check TP/SL order</div>
            )}
            <Button onClick={() => onOrder("long")} disabled={disabledLong}>
              発注
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Short Inputs</CardHeader>
          <CardContent>
            <div>
              <Input
                placeholder="Entry"
                value={data.short_entry}
                onChange={handleChange("short_entry")}
              />
              {errors.short_entry && (
                <p className="text-xs text-red-500">{errors.short_entry}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Take Profit"
                value={data.short_tp}
                onChange={handleChange("short_tp")}
              />
              {errors.short_tp && (
                <p className="text-xs text-red-500">{errors.short_tp}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Stop Loss"
                value={data.short_sl}
                onChange={handleChange("short_sl")}
              />
              {errors.short_sl && (
                <p className="text-xs text-red-500">{errors.short_sl}</p>
              )}
            </div>
            <div className="text-sm">
              Profit Rate: {formatPercent(metricsShort.profitRate)}
            </div>
            <div className="text-sm">
              Loss Rate: {formatPercent(metricsShort.lossRate)}
            </div>
            <div
              className={cn(
                "text-sm",
                metricsShort.rr < 1
                  ? "text-red-500"
                  : metricsShort.rr >= 1.5
                  ? "text-green-600"
                  : undefined
              )}
            >
              RR: {Number.isFinite(metricsShort.rr)
                ? metricsShort.rr.toFixed(2)
                : "—"}
            </div>
            {warnShort && (
              <div className="text-xs text-red-500">Check TP/SL order</div>
            )}
            <Button onClick={() => onOrder("short")} disabled={disabledShort}>
              発注
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
