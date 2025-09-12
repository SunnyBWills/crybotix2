"use client";

import { Suspense } from "react";
import { TradeDecision } from "@/components/trade-decision";
import { tradeSchema, type TradeData } from "@/lib/trade";
import { Positions } from "@/components/positions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

const empty: TradeData = {
  symbol: "",
  long_entry: "",
  long_tp: "",
  long_sl: "",
  long_volume: "",
  short_entry: "",
  short_tp: "",
  short_sl: "",
  short_volume: "",
};

function PageContent() {
  const params = useSearchParams();
  let initial = empty;
  const value = params.get("value");
  if (value) {
    try {
      initial = { ...empty, ...tradeSchema.parse(JSON.parse(value)) };
    } catch {}
  }
  return (
    <Tabs defaultValue="trade" className="max-w-xl mx-auto">
      <TabsList>
        <TabsTrigger value="trade">Trade Decision</TabsTrigger>
        <TabsTrigger value="positions">Positions</TabsTrigger>
      </TabsList>
      <TabsContent value="trade">
        <TradeDecision initial={initial} />
      </TabsContent>
      <TabsContent value="positions">
        <Positions />
      </TabsContent>
    </Tabs>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <PageContent />
    </Suspense>
  );
}
