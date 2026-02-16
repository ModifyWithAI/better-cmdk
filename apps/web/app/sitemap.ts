import type { MetadataRoute } from "next";
import { integrationGuides } from "./lib/integration-guides";
import { siteUrl } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const integrationEntries: MetadataRoute.Sitemap = integrationGuides.map(
    (guide) => ({
      url: `${siteUrl}/integrations/${guide.slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/integrations`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...integrationEntries,
  ];
}
