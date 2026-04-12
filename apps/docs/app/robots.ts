import type { MetadataRoute } from "next";
import { docsSite } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${docsSite.url}/sitemap.xml`,
		host: docsSite.url,
	};
}
