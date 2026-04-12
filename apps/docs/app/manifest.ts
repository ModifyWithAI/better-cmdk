import type { MetadataRoute } from "next";
import { docsSite } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: docsSite.title,
		short_name: "better-cmdk",
		description: docsSite.description,
		start_url: "/docs",
		display: "standalone",
		background_color: "#f8f6ed",
		theme_color: "#141414",
		icons: [
			{
				src: "/icon.svg",
				sizes: "any",
				type: "image/svg+xml",
			},
		],
	};
}
