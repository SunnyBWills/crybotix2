"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

const formatNumber = (n: number) => new Intl.NumberFormat().format(n);
const formatPercent = (n: number) => `${(n * 100).toFixed(2)}%`;

const positions = [
  { id: 1, symbol: "BTC/USDT", entry: 45000, current: 45500 },
  { id: 2, symbol: "ETH/USDT", entry: 3500, current: 3400 },
];

export function Positions() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {positions.map((p) => {
        const pnl = p.current - p.entry;
        const pnlRate = pnl / p.entry;
        return (
          <Card key={p.id}>
            <CardHeader>{p.symbol}</CardHeader>
            <CardContent>
              <div className="text-sm">Entry: {formatNumber(p.entry)}</div>
              <div className="text-sm">Current: {formatNumber(p.current)}</div>
              <div className="text-sm">
                PnL: {formatNumber(pnl)} ({formatPercent(pnlRate)})
              </div>
              <div className="mt-2 h-16 rounded bg-grid" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
