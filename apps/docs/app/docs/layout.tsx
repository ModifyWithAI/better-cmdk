import type { Metadata } from "next";
import docsConfig from "@/docs.config";
import {
	createNextDocsLayout,
	createNextDocsMetadata,
} from "@farming-labs/next/layout";
import { buildDocsSocialMetadata } from "@/app/lib/docs-social-metadata";

export const metadata: Metadata = {
	...createNextDocsMetadata(docsConfig),
	...buildDocsSocialMetadata({
		title: "Introduction",
		description:
			"Meet better-cmdk's shared action model, chat modes, and docs navigation.",
		path: "/docs",
	}),
};

const DocsLayout = createNextDocsLayout(docsConfig);

export default function Layout({ children }: { children: React.ReactNode }) {
	return <DocsLayout>{children}</DocsLayout>;
}
