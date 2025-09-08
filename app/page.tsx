import { TradeDecision, tradeSchema, type TradeData } from "@/components/trade-decision";
import { Positions } from "@/components/positions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

const empty: TradeData = {
  symbol: "",
  long_entry: "",
  long_tp: "",
  long_sl: "",
  short_entry: "",
  short_tp: "",
  short_sl: "",
  volume: "",
};

export default function Page() {
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
