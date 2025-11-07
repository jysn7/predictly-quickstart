import { NextRequest, NextResponse } from "next/server";
import { handleBaseAccountCallback } from "@coinbase/base-account";

export async function GET(request: NextRequest) {
  try {
    const callbackResponse = await handleBaseAccountCallback(request);
    
    if (callbackResponse.success) {
      // Redirect to the home page or dashboard after successful authentication
      return NextResponse.redirect(new URL("/", request.url));
    } else {
      // Handle error case
      return NextResponse.redirect(new URL("/error", request.url));
    }
  } catch (error) {
    console.error("Base Account callback error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}