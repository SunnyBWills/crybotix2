import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { tradeSchema, type TradeData } from "@/lib/trade";

let latestTrade: TradeData | null = null;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const trade = tradeSchema.parse(data);
    latestTrade = trade;
    console.log("Received trade", trade);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  if (latestTrade) {
    return NextResponse.json(latestTrade);
  }
  return NextResponse.json({});
}
