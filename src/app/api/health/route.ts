import { NextResponse } from "next/server";

/**
 * Health check endpoint for Cloud Run / load balancer probes.
 * Returns service status, version and uptime.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "threadly-api",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
