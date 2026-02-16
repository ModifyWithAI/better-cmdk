import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  getIntegrationGuide,
  integrationGuides,
} from "../../lib/integration-guides";
import { siteConfig, siteUrl } from "../../lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return integrationGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getIntegrationGuide(slug);

  if (!guide) {
    return {
      title: "Integration Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: guide.pageTitle,
    description: guide.metaDescription,
    keywords: [
      guide.keyword,
      `${guide.providerName} integration`,
      "better-cmdk setup",
      "react ai command palette",
    ],
    alternates: {
      canonical: `/integrations/${guide.slug}`,
    },
    openGraph: {
      type: "article",
      url: `/integrations/${guide.slug}`,
      title: guide.pageTitle,
      description: guide.metaDescription,
      siteName: siteConfig.name,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.pageTitle,
      description: guide.metaDescription,
      images: ["/twitter-image"],
    },
  };
}

export default async function IntegrationGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getIntegrationGuide(slug);

  if (!guide) {
    notFound();
  }

  const relatedGuides = integrationGuides.filter(
    (entry) => entry.slug !== guide.slug,
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Integrations",
        item: `${siteUrl}/integrations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.providerName,
        item: `${siteUrl}/integrations/${guide.slug}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Script
        id={`faq-jsonld-${guide.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`breadcrumb-jsonld-${guide.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="mx-auto max-w-6xl px-5 pt-12 pb-10 sm:pt-16">
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 border-2 border-foreground bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft className="size-3.5" />
          All Integrations
        </Link>

        <p className="mt-6 inline-flex border-2 border-foreground bg-secondary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">
          {guide.keyword}
        </p>

        <h1 className="font-display mt-5 text-[clamp(2.8rem,10vw,7rem)] leading-[0.84] uppercase">
          {guide.providerName}
          <span className="block text-[0.72em]">Integration Guide</span>
        </h1>

        <p className="mt-5 max-w-4xl font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
          {guide.heroSummary}
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="border-4 border-foreground bg-card p-6 sm:p-8">
          <h2 className="font-display text-[clamp(2rem,6vw,4.2rem)] leading-[0.86] uppercase">
            Implementation Notes
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
            {guide.intro}
          </p>

          <h3 className="mt-8 border-2 border-foreground bg-secondary px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em]">
            Best For
          </h3>
          <ul className="mt-4 space-y-2 font-mono text-sm uppercase tracking-[0.08em] text-foreground/92">
            {guide.bestFor.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>

          <h3 className="mt-8 border-2 border-foreground bg-secondary px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em]">
            Quick Setup Checklist
          </h3>
          <ol className="mt-4 space-y-2 font-mono text-sm uppercase tracking-[0.08em] text-foreground/92">
            {guide.setupChecklist.map((item, index) => (
              <li key={item}>
                {index + 1}. {item}
              </li>
            ))}
          </ol>
        </article>

        <aside className="space-y-6">
          <article className="border-4 border-foreground bg-secondary p-6">
            <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[0.86] uppercase">
              Approval Rules
            </h2>
            <ul className="mt-4 space-y-2 font-mono text-sm uppercase tracking-[0.08em] text-foreground/92">
              {guide.approvalChecklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>

          <article className="border-4 border-foreground bg-card p-6">
            <h2 className="font-display text-[clamp(1.8rem,5vw,3.1rem)] leading-[0.88] uppercase">
              Common Pitfalls
            </h2>
            <ul className="mt-4 space-y-2 font-mono text-sm uppercase tracking-[0.08em] text-foreground/92">
              {guide.commonPitfalls.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>

          <article className="border-4 border-foreground bg-foreground p-6 text-background">
            <h2 className="font-display text-[clamp(1.8rem,5vw,3.1rem)] leading-[0.88] uppercase">
              Read Full Docs
            </h2>
            <p className="mt-3 font-mono text-sm uppercase tracking-[0.08em] text-background/92">
              Use the package docs for framework-specific files and provider API
              details.
            </p>
            <a
              href="https://better-cmdk.com/docs"
              className="mt-5 inline-flex items-center gap-2 border-4 border-background bg-background px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-foreground transition-transform hover:-translate-y-1"
            >
              Open Setup Docs
              <ArrowUpRight className="size-4" />
            </a>
          </article>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="border-4 border-foreground bg-card p-6 sm:p-8">
          <h2 className="font-display text-[clamp(2rem,6vw,4rem)] leading-[0.86] uppercase">
            Integration FAQ
          </h2>
          <div className="mt-6 grid gap-4">
            {guide.faqs.map((faq) => (
              <article
                key={faq.question}
                className="border-2 border-foreground bg-background p-4"
              >
                <h3 className="font-mono text-sm uppercase tracking-[0.1em]">
                  {faq.question}
                </h3>
                <p className="mt-3 font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="border-4 border-foreground bg-secondary p-6 sm:p-8">
          <h2 className="font-display text-[clamp(2rem,6vw,4rem)] leading-[0.88] uppercase">
            Related Integration Guides
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {relatedGuides.map((relatedGuide) => (
              <Link
                key={relatedGuide.slug}
                href={`/integrations/${relatedGuide.slug}`}
                className="group border-2 border-foreground bg-background p-4 transition-transform hover:-translate-y-1"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/84">
                  {relatedGuide.keyword}
                </p>
                <h3 className="font-display mt-3 text-[clamp(1.6rem,4vw,2.6rem)] leading-[0.9] uppercase">
                  {relatedGuide.providerName}
                </h3>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-foreground/92">
                  {relatedGuide.heroSummary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
