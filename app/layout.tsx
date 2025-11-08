import type { Metadata } from "next";
// import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import BaseScriptLoader from "./components/BaseScriptLoader";
import Sidebar from "./components/Sidebar";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Predictly - Decentralized Prediction Markets",
    description: "A decentralized predictions platform built on Base with AI-powered insights",
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://predictly.app"),
    openGraph: {
      title: "Predictly - Decentralized Prediction Markets",
      description: "AI-powered prediction markets on Base",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Predictly",
      description: "AI-powered prediction markets on Base",
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "0.1.0",
        imageUrl: "/preview.png",
        button: {
          title: "Join the Predictly Waitlist",
          action: {
            name: "Launch Predictly",
            type: "launch_frame",
          },
        },
      }),
    },
  };
}

// Commented out Google Fonts due to network issues - using system fonts instead
// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
//   display: "swap",
// });

// const sourceCodePro = Source_Code_Pro({
//   variable: "--font-source-code-pro",
//   subsets: ["latin"],
//   display: "swap",
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans">
        <ErrorBoundary>
          <RootProvider>
            <BaseScriptLoader />
            <div className="app-frame">
              <Sidebar />
              <div className="main-content">{children}</div>
            </div>
          </RootProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
