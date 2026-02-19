import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { integrationGuides } from "../lib/integration-guides";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "better-cmdk Integration Guides",
  description:
    "Provider-specific better-cmdk integration guides for modifywithai.com, Vercel AI SDK, Custom ExternalChat, and self-hosted endpoints.",
  alternates: {
    canonical: "/integrations",
  },
  openGraph: {
    title: "better-cmdk Integration Guides",
    description:
      "Implementation guides for integrating better-cmdk with common AI provider paths.",
    url: "/integrations",
    type: "website",
    siteName: siteConfig.name,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "better-cmdk Integration Guides",
    description:
      "Integration guides for modifywithai.com, Vercel AI SDK, custom adapters, and self-hosted endpoints.",
    images: ["/twitter-image"],
  },
};

export default function IntegrationsIndexPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-18">
        <p className="inline-flex border-2 border-foreground bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]">
          Programmatic SEO Hub
        </p>

        <h1 className="font-display mt-6 text-[clamp(3rem,10vw,7.5rem)] leading-[0.84] uppercase">
          Integration Guides
        </h1>

        <p className="mt-5 max-w-3xl font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
          These pages cover concrete setup paths for better-cmdk with popular
          provider architectures. Each guide explains when to choose that path,
          what to configure, and what to validate before production. For
          zero-setup development, better-cmdk also includes a free hosted trial
          endpoint (no signup, 10 requests per 10 minutes).
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {integrationGuides.map((guide) => (
            <article
              key={guide.slug}
              className="border-4 border-foreground bg-card p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/84">
                {guide.keyword}
              </p>
              <h2 className="font-display mt-3 text-[clamp(2rem,5vw,3.4rem)] leading-[0.86] uppercase">
                {guide.providerName}
              </h2>
              <p className="mt-4 font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
                {guide.heroSummary}
              </p>

              <ul className="mt-5 space-y-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground/90">
                {guide.bestFor.slice(0, 2).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>

              <Link
                href={`/integrations/${guide.slug}`}
                className="mt-6 inline-flex items-center gap-2 border-4 border-foreground bg-foreground px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-background transition-transform hover:-translate-y-1"
              >
                Read Integration Guide
                <ArrowUpRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 border-4 border-foreground bg-secondary p-6 sm:p-8">
          <h2 className="font-display text-[clamp(2rem,6vw,4rem)] leading-[0.88] uppercase">
            How To Use These Pages
          </h2>
          <ol className="mt-5 space-y-3 font-mono text-sm uppercase tracking-[0.08em] text-foreground/92">
            <li>1. Pick the provider model that matches your architecture.</li>
            <li>2. Use the setup checklist to implement the path quickly.</li>
            <li>
              3. Apply the approval checklist before enabling write actions.
            </li>
            <li>4. Validate pitfalls and monitoring before launch.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
