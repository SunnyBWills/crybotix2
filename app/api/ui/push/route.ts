import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { tradeSchema } from "@/lib/trade";

export async function GET() {
  return NextResponse.json({ status: "public ok" });
}

export async function POST(req: Request) {
  const ingestToken = process.env.INGEST_TOKEN;
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || authHeader !== `Bearer ${ingestToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    tradeSchema.parse(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ ok: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

