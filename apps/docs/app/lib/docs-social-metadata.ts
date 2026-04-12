import type { Metadata } from "next";
import { docsSite } from "@/lib/site";

type DocsSocialMetadataOptions = {
	title: string;
	description: string;
	path: string;
};

function buildDocsSocialImageUrl({
	title,
	description,
	path,
}: DocsSocialMetadataOptions) {
	const url = new URL("/api/og", docsSite.url);
	url.searchParams.set("title", title);
	url.searchParams.set("description", description);
	url.searchParams.set("path", path);
	return url.toString();
}

export function buildDocsSocialMetadata({
	title,
	description,
	path,
}: DocsSocialMetadataOptions): Metadata {
	const pageTitle = `${title} | better-cmdk Docs`;
	const pageUrl = new URL(path, docsSite.url).toString();
	const imageUrl = buildDocsSocialImageUrl({ title, description, path });

	return {
		alternates: {
			canonical: pageUrl,
		},
		openGraph: {
			type: "website",
			siteName: docsSite.title,
			title: pageTitle,
			description,
			url: pageUrl,
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: pageTitle,
			description,
			images: [imageUrl],
		},
	};
}
