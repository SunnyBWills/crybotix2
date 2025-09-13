import { NextResponse } from "next/server";
import OpenAI from "openai";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

const schema = {
  name: "input_v1",
  strict: true,
  schema: {
    type: "object",
    properties: {
      date: { type: ["string", "null"], format: "date" },
      symbol: { type: "string" },
      resistance1: { type: ["number", "null"] },
      resistance2: { type: ["number", "null"] },
      support1: { type: ["number", "null"] },
      support2: { type: ["number", "null"] },
      volume1: { type: ["number", "null"] },
    },
    required: ["date", "symbol"],
    additionalProperties: false,
  },
};

const prompt =
  "あなたは市場水準抽出ボット。入力（画像）を解析し、 指定された JSON Schema「input_v1」に完全準拠したJSONのみを1つ返す。 【厳格ルール】 - 出力はJSONのみ。説明文・コードフェンス・余計なキーは禁止（additionalProperties=false）。 - 数値化：通貨記号・カンマ・空白・全角数字を除去。指数表記は使わない。 - date：入力に日付があればそれを使用。無ければJSTの今日を YYYY-MM-DD で出力。 - symbol：画像や文面から抽出。見つからなければ \"UNKNOWN\"。 - resistance1/2・support1/2 は存在する分だけ出力（無い項目は出力しない）。 並べ方は小さい方→大きい方（例：resistance1 < resistance2、support1 < support2）。 - volume1：POC/最大出来高帯の価格が画像に記載されている場合のみ出力。無ければ出力しない。";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const image = form.get("image");
    if (!image || !(image instanceof File)) {
      logError({ name: "INPUT", message: "no image or wrong field type" });
      return NextResponse.json({ error: "No image" }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      logError({ name: "INPUT", message: "OPENAI_API_KEY missing" });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const res = await client.responses.create({
      model: "gpt-5",
      input: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: [
            { type: "input_text", text: "画像を解析して" },
            { type: "input_image", image_url: dataUrl },
          ] as any,
        },
      ],
      text: {
        format: { type: "json_schema", json_schema: schema },
        verbosity: "medium",
      },
      reasoning: { effort: "medium" },
    } as any);
    const text = res.output_text;
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Failed to parse", text }, { status: 500 });
    }
    return NextResponse.json(json);
  } catch (err: any) {
    logError(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
