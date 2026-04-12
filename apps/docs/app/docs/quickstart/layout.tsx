import { buildDocsSocialMetadata } from "@/app/lib/docs-social-metadata";

export const metadata = buildDocsSocialMetadata({
	title: "Quickstart",
	description:
		"Install better-cmdk, import the styles, and launch your first AI-native command menu.",
	path: "/docs/quickstart",
});

export default function QuickstartLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
