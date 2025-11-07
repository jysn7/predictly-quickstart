import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const resp = await openai.chat.completions.create({
      model: body.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: body.max_tokens || 300,
    });

    const text = resp.choices?.[0]?.message?.content || "";

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("AI route error:", err);
    const message = err?.message || "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
