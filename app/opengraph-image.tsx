import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "ZentraScore — Crypto Credit Score for DeFi & On-Chain Lending";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(0,201,141,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(0,201,141,0.08) 0%, transparent 55%), #0b1a12",
          fontFamily: "'Inter', sans-serif",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0f1412",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="19"
                width="5"
                height="7"
                rx="1.5"
                fill="#00c98d"
              />
              <rect
                x="13.5"
                y="13"
                width="5"
                height="13"
                rx="1.5"
                fill="#00c98d"
              />
              <rect
                x="21"
                y="7"
                width="5"
                height="19"
                rx="1.5"
                fill="#00c98d"
              />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            <span style={{ color: "#ffffff" }}>Zentra</span>
            <span style={{ color: "#00c98d" }}>Score</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 72,
            flexGrow: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(0,201,141,0.14)",
              border: "1px solid rgba(0,201,141,0.35)",
              color: "#00c98d",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            On-chain Credit Intelligence
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 36,
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-2.5px",
            }}
          >
            <span>Crypto Credit Score</span>
            <span>
              for{" "}
              <span style={{ color: "#00c98d", fontStyle: "italic" }}>
                DeFi
              </span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 26,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.62)",
              maxWidth: 860,
            }}
          >
            The first cryptocurrency credit score built entirely from
            blockchain data — unlock undercollateralized lending and better
            rates.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 20,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <span
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#00c98d",
              }}
            />
            Ethereum · Arbitrum · Base · Avalanche · Unichain
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              padding: "14px 22px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: 52, fontWeight: 800, color: "#ffffff" }}>
              734
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 8,
                background: "rgba(0,201,141,0.14)",
                color: "#00c98d",
              }}
            >
              GOOD
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
