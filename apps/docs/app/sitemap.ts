import type { MetadataRoute } from "next";
import { docsSite } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	return [
		{
			url: docsSite.url,
			lastModified: now,
		},
		{
			url: `${docsSite.url}/docs`,
			lastModified: now,
		},
		{
			url: `${docsSite.url}/docs/quickstart`,
			lastModified: now,
		},
		{
			url: `${docsSite.url}/docs/extending`,
			lastModified: now,
		},
	];
}
