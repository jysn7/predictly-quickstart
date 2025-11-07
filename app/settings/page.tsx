"use client";

export default function Settings() {
  return (
    <main className="min-h-screen bg-blackDark text-white font-techy p-6">
      <h1 className="text-4xl font-bold text-purpleNeon mb-6">Settings</h1>
      <div className="flex flex-col gap-4 max-w-xl">
        <button className="px-6 py-3 bg-purpleNeon rounded-xl font-bold text-black hover:bg-purpleNeon/80 transition">
          Connect Wallet
        </button>
        <button className="px-6 py-3 border-2 border-purpleNeon rounded-xl font-bold text-purpleNeon hover:border-purpleNeon/70 transition">
          Manage Notifications
        </button>
      </div>
    </main>
  );
}
