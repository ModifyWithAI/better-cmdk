import type { Metadata, Viewport } from "next";
import { RootProvider } from "@farming-labs/theme";
import docsConfig from "@/docs.config";
import { docsSite } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(docsSite.url),
	applicationName: docsSite.title,
	title: {
		default: docsSite.title,
		template: docsConfig.metadata?.titleTemplate ?? "%s | better-cmdk Docs",
	},
	description: docsSite.description,
	keywords: docsSite.keywords,
	icons: {
		icon: "/icon.svg",
		shortcut: "/icon.svg",
		apple: "/icon.svg",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f8f6ed" },
		{ media: "(prefers-color-scheme: dark)", color: "#121212" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
