import type { Metadata, Viewport } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { siteConfig, siteUrl } from "./lib/site";

const brutalDisplay = Bebas_Neue({
  variable: "--font-brutal-display",
  subsets: ["latin"],
  weight: "400",
});

const brutalBody = IBM_Plex_Mono({
  variable: "--font-brutal-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: "better-cmdk | React Command Palette With AI Chat",
    template: "%s | better-cmdk",
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "better-cmdk",
    "react command palette",
    "ai command menu",
    "vercel ai sdk command palette",
    "modifywithai integration",
    "externalchat integration",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: "better-cmdk | React Command Palette With AI Chat",
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "better-cmdk | React Command Palette With AI Chat",
    description: siteConfig.description,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6ed" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteUrl,
  description: siteConfig.description,
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: siteUrl,
  creator: {
    "@type": "Organization",
    name: siteConfig.legalName,
    url: "https://modifywithai.com",
  },
  sameAs: [
    "https://github.com/ModifyWithAI/better-cmdk",
    "https://better-cmdk.com/docs",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${brutalDisplay.variable} ${brutalBody.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Script
            id="website-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          <Script
            id="softwareapp-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(softwareAppJsonLd),
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
