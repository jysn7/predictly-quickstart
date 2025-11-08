import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const teamStats = body.teamStats; // Optional team stats for enhanced reasoning
    
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // If team stats provided, enhance the prompt with statistical context
    let enhancedPrompt = prompt;
    if (teamStats) {
      enhancedPrompt = `${prompt}

Based on the following team statistics:
- Home Team: ${teamStats.homeTeam}
  * Win Rate: ${teamStats.homeWinPercentage}%
  * Recent Form: ${teamStats.homeRecentForm?.join('-') || 'N/A'}
  * Record: ${teamStats.homeWins}W-${teamStats.homeLosses}L-${teamStats.homeDraws}D

- Away Team: ${teamStats.awayTeam}
  * Win Rate: ${teamStats.awayWinPercentage}%
  * Recent Form: ${teamStats.awayRecentForm?.join('-') || 'N/A'}
  * Record: ${teamStats.awayWins}W-${teamStats.awayLosses}L-${teamStats.awayDraws}D

Provide a prediction with the winner and confidence level based on these statistics. Include a brief one-sentence reasoning explaining why this team is favored based on their form and stats.`;
    }

    const resp = await openai.chat.completions.create({
      model: body.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: enhancedPrompt }],
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
