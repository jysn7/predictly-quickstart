"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../rootProvider";
import { SignInWithBaseButton } from "@base-org/account-ui/react";

export default function AuthPage() {
  const router = useRouter();
  const { connect, isConnected, isLoading, address } = useAuth();
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Redirect if already connected
    if (isConnected && address) {
      router.push("/dashboard");
    }
  }, [isConnected, address, router]);

  const handleConnect = async () => {
    try {
      setError("");
      setIsAuthenticating(true);
      await connect();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Predictly
          </h1>
          <p className="text-gray-400">
            Sign in with your Base Account to get started
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <SignInWithBaseButton
              colorScheme="dark"
              onClick={handleConnect}
            />
          </div>

          {isAuthenticating && (
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span>Connecting...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <span className="text-blue-500">✓</span>
            <span>Secure authentication with Base Account</span>
          </div>
          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <span className="text-blue-500">✓</span>
            <span>No passwords needed</span>
          </div>
          <div className="flex items-start space-x-3 text-sm text-gray-400">
            <span className="text-blue-500">✓</span>
            <span>Full control of your data</span>
          </div>
        </div>
      </div>
    </div>
  );
}