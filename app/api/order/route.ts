import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    return NextResponse.json(data);
  } catch (err) {
    logError(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
