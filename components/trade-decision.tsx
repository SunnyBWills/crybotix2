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
  const [side, setSide] = useState<"long" | "short">("long");

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

  const metrics = useMemo(() => {
    const entry = Number(side === "long" ? data.long_entry : data.short_entry);
    const tp = Number(side === "long" ? data.long_tp : data.short_tp);
    const sl = Number(side === "long" ? data.long_sl : data.short_sl);
    if (!Number.isFinite(entry) || !Number.isFinite(tp) || !Number.isFinite(sl)) {
      return { profitRate: NaN, lossRate: NaN, rr: NaN };
    }
    if (side === "long") {
      const profitRate = (tp - entry) / entry;
      const lossRate = (entry - sl) / entry;
      return {
        profitRate,
        lossRate,
        rr: profitRate / Math.max(lossRate, 1e-9),
      };
    } else {
      const profitRate = (entry - tp) / entry;
      const lossRate = (sl - entry) / entry;
      return {
        profitRate,
        lossRate,
        rr: profitRate / Math.max(lossRate, 1e-9),
      };
    }
  }, [data, side]);

  const handleChange = (field: keyof TradeData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setData({ ...data, [field]: e.target.value });

  const disabled =
    !result.success ||
    !data.volume ||
    (side === "long"
      ? !data.long_entry || !data.long_tp || !data.long_sl
      : !data.short_entry || !data.short_tp || !data.short_sl);

  const warn =
    side === "long"
      ? !(
          Number(data.long_sl) < Number(data.long_entry) &&
          Number(data.long_entry) < Number(data.long_tp)
        )
      : !(
          Number(data.short_tp) < Number(data.short_entry) &&
          Number(data.short_entry) < Number(data.short_sl)
        );

  async function onOrder() {
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
      <div className="flex gap-2">
        <Button
          className={cn(side === "long" && "bg-accent2")}
          onClick={() => setSide("long")}
        >
          Long
        </Button>
        <Button
          className={cn(side === "short" && "bg-accent2")}
          onClick={() => setSide("short")}
        >
          Short
        </Button>
      </div>

      <Card>
        <CardHeader>{side === "long" ? "Long Inputs" : "Short Inputs"}</CardHeader>
        <CardContent>
          <div>
            <label
              htmlFor={`${side}-entry`}
              className="mb-1 block text-sm"
            >
              Entry
            </label>
            <Input
              id={`${side}-entry`}
              value={side === "long" ? data.long_entry : data.short_entry}
              onChange={handleChange(side === "long" ? "long_entry" : "short_entry")}
            />
            {errors[side === "long" ? "long_entry" : "short_entry"] && (
              <p className="text-xs text-red-500">
                {errors[side === "long" ? "long_entry" : "short_entry"]}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`${side}-tp`}
              className="mb-1 block text-sm"
            >
              Take Profit
            </label>
            <Input
              id={`${side}-tp`}
              value={side === "long" ? data.long_tp : data.short_tp}
              onChange={handleChange(side === "long" ? "long_tp" : "short_tp")}
            />
            {errors[side === "long" ? "long_tp" : "short_tp"] && (
              <p className="text-xs text-red-500">
                {errors[side === "long" ? "long_tp" : "short_tp"]}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={`${side}-sl`}
              className="mb-1 block text-sm"
            >
              Stop Loss
            </label>
            <Input
              id={`${side}-sl`}
              value={side === "long" ? data.long_sl : data.short_sl}
              onChange={handleChange(side === "long" ? "long_sl" : "short_sl")}
            />
            {errors[side === "long" ? "long_sl" : "short_sl"] && (
              <p className="text-xs text-red-500">
                {errors[side === "long" ? "long_sl" : "short_sl"]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Result</CardHeader>
        <CardContent>
          <div className="text-sm">Profit Rate: {formatPercent(metrics.profitRate)}</div>
          <div className="text-sm">Loss Rate: {formatPercent(metrics.lossRate)}</div>
          <div className={cn("text-sm", metrics.rr < 1 ? "text-red-500" : metrics.rr >= 1.5 ? "text-green-600" : undefined)}>
            RR: {Number.isFinite(metrics.rr) ? metrics.rr.toFixed(2) : "—"}
          </div>
          {warn && <div className="text-xs text-red-500">Check TP/SL order</div>}
        </CardContent>
      </Card>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="volume" className="mb-1 block text-sm">
            Volume
          </label>
          <Input id="volume" value={data.volume} onChange={handleChange("volume")} />
          {errors.volume && <p className="text-xs text-red-500">{errors.volume}</p>}
        </div>
        <Button onClick={onOrder} disabled={disabled}>
          発注
        </Button>
      </div>
    </div>
  );
}
