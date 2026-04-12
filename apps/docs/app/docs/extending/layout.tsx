import { buildDocsSocialMetadata } from "@/app/lib/docs-social-metadata";

export const metadata = buildDocsSocialMetadata({
	title: "Extending",
	description:
		"Design strong actions, customize rendering, and wire approvals and history correctly.",
	path: "/docs/extending",
});

export default function ExtendingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
