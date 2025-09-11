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
  long_volume: numString,
  short_entry: numString,
  short_tp: numString,
  short_sl: numString,
  short_volume: numString,
});

export type TradeData = z.infer<typeof tradeSchema>;

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

  const metrics = useMemo(() => {
    const calc = (side: "long" | "short") => {
      const entry = Number(side === "long" ? data.long_entry : data.short_entry);
      const tp = Number(side === "long" ? data.long_tp : data.short_tp);
      const sl = Number(side === "long" ? data.long_sl : data.short_sl);
      if (!Number.isFinite(entry) || !Number.isFinite(tp) || !Number.isFinite(sl)) {
        return { profitRate: NaN, lossRate: NaN, rr: NaN };
      }
      if (side === "long") {
        const profitRate = (tp - entry) / entry;
        const lossRate = (entry - sl) / entry;
        return { profitRate, lossRate, rr: profitRate / Math.max(lossRate, 1e-9) };
      } else {
        const profitRate = (entry - tp) / entry;
        const lossRate = (sl - entry) / entry;
        return { profitRate, lossRate, rr: profitRate / Math.max(lossRate, 1e-9) };
      }
    };
    return { long: calc("long"), short: calc("short") };
  }, [data]);

  const handleChange = (field: keyof TradeData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setData({ ...data, [field]: e.target.value });

  const disabled = {
    long:
      !data.long_entry ||
      !data.long_tp ||
      !data.long_sl ||
      !data.long_volume ||
      Boolean(
        errors.long_entry ||
          errors.long_tp ||
          errors.long_sl ||
          errors.long_volume
      ),
    short:
      !data.short_entry ||
      !data.short_tp ||
      !data.short_sl ||
      !data.short_volume ||
      Boolean(
        errors.short_entry ||
          errors.short_tp ||
          errors.short_sl ||
          errors.short_volume
      ),
  };

  const warn = {
    long: !(
      Number(data.long_sl) < Number(data.long_entry) &&
      Number(data.long_entry) < Number(data.long_tp)
    ),
    short: !(
      Number(data.short_tp) < Number(data.short_entry) &&
      Number(data.short_entry) < Number(data.short_sl)
    ),
  };

  async function onOrder(side: "long" | "short") {
    const entry = side === "long" ? data.long_entry : data.short_entry;
    const tp = side === "long" ? data.long_tp : data.short_tp;
    const sl = side === "long" ? data.long_sl : data.short_sl;
    const volume = side === "long" ? data.long_volume : data.short_volume;
    await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side, symbol: data.symbol, entry, tp, sl, volume }),
    });
  }

  const InputField = ({
    label,
    field,
    placeholder,
  }: {
    label: string;
    field: keyof TradeData;
    placeholder: string;
  }) => (
    <div>
      <div className="text-sm mb-1">{label}</div>
      <Input
        placeholder={placeholder}
        value={(data[field] as string) ?? ""}
        onChange={handleChange(field)}
      />
      {errors[field as string] && (
        <p className="text-xs text-red-500">{errors[field as string]}</p>
      )}
    </div>
  );

  const SideCard = ({ side }: { side: "long" | "short" }) => (
    <Card>
      <CardHeader>{side === "long" ? "Long" : "Short"}</CardHeader>
      <CardContent className="space-y-2">
        <InputField
          label="Entry"
          field={side === "long" ? "long_entry" : "short_entry"}
          placeholder="Entry"
        />
        <InputField
          label="Take Profit"
          field={side === "long" ? "long_tp" : "short_tp"}
          placeholder="Take Profit"
        />
        <InputField
          label="Stop Loss"
          field={side === "long" ? "long_sl" : "short_sl"}
          placeholder="Stop Loss"
        />
        <InputField
          label="Volume"
          field={side === "long" ? "long_volume" : "short_volume"}
          placeholder="Volume"
        />
        <div className="pt-2 space-y-1">
          <div className="text-sm">
            Profit Rate: {formatPercent(metrics[side].profitRate)}
          </div>
          <div className="text-sm">
            Loss Rate: {formatPercent(metrics[side].lossRate)}
          </div>
          <div
            className={cn(
              "text-sm",
              metrics[side].rr < 1
                ? "text-red-500"
                : metrics[side].rr >= 1.5
                ? "text-green-600"
                : undefined
            )}
          >
            RR: {Number.isFinite(metrics[side].rr)
              ? metrics[side].rr.toFixed(2)
              : "—"}
          </div>
          {warn[side] && (
            <div className="text-xs text-red-500">Check TP/SL order</div>
          )}
        </div>
        <Button
          onClick={() => onOrder(side)}
          disabled={disabled[side]}
          className="mt-2"
        >
          発注
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SideCard side="long" />
      <SideCard side="short" />
    </div>
  );
}
