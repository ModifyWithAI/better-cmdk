import type { NextConfig } from "next";

const docsOrigin =
	process.env.DOCS_ORIGIN ??
	(process.env.NODE_ENV === "development"
		? "http://127.0.0.1:3050"
		: "https://docs.better-cmdk.com");

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	async rewrites() {
		return [
			{
				source: "/mango/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/mango/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
			{
				source: "/docs",
				destination: `${docsOrigin}/docs`,
			},
			{
				source: "/docs/:match*",
				destination: `${docsOrigin}/docs/:match*`,
			},
		];
	},
};

export default nextConfig;
