export const buildExplainPrompt = (match: string, winner: string, confidence: number) => {
  return `You are a helpful sports analyst. Given a match description and a predicted winner with a confidence percentage, provide a concise explanation (2-4 short paragraphs) explaining why that prediction might be reasonable, key factors to watch, and suggestions for bettors. Keep the tone neutral and brief.\n\nMatch: ${match}\nPredicted winner: ${winner}\nConfidence: ${confidence}%`;
};

export const buildSuggestionPrompt = (home: string, away: string, sport = 'Football') => {
  return `You are a concise sports prediction assistant. Given the two teams and sport, return a short prediction (winner and confidence percent) and a brief justification (2-3 sentences).\n\nHome: ${home}\nAway: ${away}\nSport: ${sport}`;
};
