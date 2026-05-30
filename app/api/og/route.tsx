import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "SchoolOS Pakistan";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#1D4ED8",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            width: "80px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "48px", color: "#1D4ED8", fontWeight: "bold" }}>
            S
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: "white",
            fontSize: "56px",
            fontWeight: "bold",
            textAlign: "center",
            margin: "0 0 16px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "#93C5FD",
            fontSize: "28px",
            margin: "0 0 40px",
            textAlign: "center",
          }}
        >
          School Management System
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "20px 40px",
          }}
        >
          {["200+ Schools", "AI Powered", "Made in Pakistan 🇵🇰"].map(
            (stat) => (
              <span
                key={stat}
                style={{ color: "white", fontSize: "20px", fontWeight: "600" }}
              >
                {stat}
              </span>
            )
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}