import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

type SocialImageOptions = {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  footerLeft?: string;
  footerRight?: string;
};

const imageSize = {
  width: 1200,
  height: 630,
};

const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "public/fonts/BebasNeue-Regular.ttf")),
  readFile(join(process.cwd(), "public/fonts/IBMPlexMono-Medium.ttf")),
]);

export async function createSocialImage(options: SocialImageOptions = {}) {
  const [bebas, plexMono] = await fontsPromise;

  const eyebrow = options.eyebrow ?? "AI COMMAND MENU FOR REACT";
  const headline = options.headline ?? "BETTER-CMDK";
  const subheadline =
    options.subheadline ?? "COMMAND. CHAT. EXECUTE. ONE SURFACE.";
  const footerLeft = options.footerLeft ?? "better-cmdk.com";
  const footerRight = options.footerRight ?? "THE DYNAMIC UI COMPANY";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#f8f6ed",
          color: "#111111",
          padding: 26,
          fontFamily: "IBM Plex Mono",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.14,
            backgroundImage:
              "linear-gradient(to right, #111111 1px, transparent 1px), linear-gradient(to bottom, #111111 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 42,
            width: 200,
            height: 68,
            transform: "rotate(8deg)",
            border: "4px solid #111111",
            background: "#ddd9cf",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 18,
            width: 140,
            height: 56,
            transform: "rotate(-10deg)",
            border: "4px solid #111111",
            background: "#ebe7dd",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            border: "6px solid #111111",
            padding: "30px 34px 24px",
            background: "rgba(248, 246, 237, 0.9)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "3px solid #111111",
                background: "#ffffff",
                padding: "7px 14px",
                fontSize: 19,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                lineHeight: 1,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "3px solid #111111",
                background: "#111111",
                color: "#f8f6ed",
                padding: "7px 14px",
                fontSize: 19,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                lineHeight: 1,
              }}
            >
              OPEN SOURCE
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 36,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "Bebas Neue",
                  fontSize: 182,
                  lineHeight: 0.82,
                  letterSpacing: "0.01em",
                  textTransform: "uppercase",
                }}
              >
                {headline}
              </div>
              <div
                style={{
                  display: "flex",
                  maxWidth: 760,
                  fontSize: 37,
                  lineHeight: 1,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {subheadline}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "4px solid #111111",
              paddingTop: 16,
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {footerLeft}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {footerRight}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...imageSize,
      fonts: [
        {
          name: "Bebas Neue",
          data: bebas,
          style: "normal",
          weight: 400,
        },
        {
          name: "IBM Plex Mono",
          data: plexMono,
          style: "normal",
          weight: 500,
        },
      ],
    },
  );
}

