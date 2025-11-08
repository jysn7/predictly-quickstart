import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// GitHub Models configuration with DeepSeek
const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-V3-0324";

const client = new OpenAI({ 
  apiKey: token,
  baseURL: endpoint
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const teamStats = body.teamStats; // Optional team stats for enhanced reasoning
    
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
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

    const resp = await client.chat.completions.create({
      model: body.model || model,
      messages: [
        { 
          role: "system", 
          content: "You are an expert sports analyst providing accurate predictions based on team statistics and historical performance. Always provide a clear winner prediction with confidence percentage and brief reasoning." 
        },
        { 
          role: "user", 
          content: enhancedPrompt 
        }
      ],
      max_tokens: body.max_tokens || 500,
      temperature: body.temperature || 0.7,
    });

    const text = resp.choices?.[0]?.message?.content || "";

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("AI route error:", err);
    const message = err?.message || "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
