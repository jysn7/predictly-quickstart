// Simple helper to return mock AI responses when running a static demo.
// When NEXT_PUBLIC_USE_STATIC_DEMO === 'true' this returns deterministic mock data.
// Otherwise it proxies to the real /api/ai endpoint.
export type AiRequest = { prompt: string; max_tokens?: number; teamStats?: any };

export async function callAiOrMock(req: AiRequest) {
  try {
    const useMock = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_STATIC_DEMO === 'true';
    if (useMock) {
      // Very small heuristic to return plausible structured text based on prompt contents.
      const { prompt } = req;
      // If prompt contains "Explain this prediction" produce a short explanation.
      if (/Explain this prediction/i.test(prompt)) {
        return {
          text: `Winner: Team A\nConfidence: 72%\nExplanation: Team A has better recent form and expected tactical advantage based on available public stats. (demo)`
        };
      }

      // If it's a suggestion/predict prompt, return a winner/confidence format.
      return {
        text: `Winner: Team A\nConfidence: 68%\nRationale: Based on team strengths and historical matchup patterns, Team A is slightly favored. (demo)`
      };
    }

    // Real mode: forward to local AI API endpoint
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return await res.json();
  } catch (err) {
    return { text: '', error: (err as Error).message || 'Unknown error' };
  }
}
