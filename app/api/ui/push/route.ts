import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { tradeSchema } from "@/lib/trade";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const trade = tradeSchema.parse(data);
    // TODO: persist or forward the trade data
    console.log("Received trade", trade);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
