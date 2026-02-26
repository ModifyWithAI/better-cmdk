import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	async redirects() {
		return [
			{
				source: "/:path*",
				has: [
					{
						type: "host",
						value: "docs.better-cmdk.com",
					},
				],
				destination: "https://better-cmdk.com/docs/:path*",
				permanent: true,
			},
		];
	},
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
				destination: "https://better-cmdk.mintlify.dev/docs",
			},
			{
				source: "/docs/:match*",
				destination: "https://better-cmdk.mintlify.dev/docs/:match*",
			},
		];
	},
};

export default nextConfig;
