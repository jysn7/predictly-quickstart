"use client";
import PredictionCard from "../components/PredictionCard";

export default function Dashboard() {
  const mockPredictions = [
    { match: "Team A vs Team B", winner: "Team A", confidence: 75 },
    { match: "Team C vs Team D", winner: "Team D", confidence: 62 },
  ];

  return (
    <main className="min-h-screen bg-blackDark text-white font-techy p-6">
      <h1 className="text-4xl font-bold text-purpleNeon mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockPredictions.map((pred, idx) => (
          <PredictionCard key={idx} {...pred} />
        ))}
      </div>
    </main>
  );
}
