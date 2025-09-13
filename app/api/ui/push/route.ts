import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { tradeSchema } from "@/lib/trade";
import { logError } from "@/lib/logger";

export async function GET() {
  return NextResponse.json({ status: "public ok" });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    tradeSchema.parse(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    logError(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

