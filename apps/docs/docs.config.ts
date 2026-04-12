import { createElement } from "react";
import { defineDocs } from "@farming-labs/docs";
import { commandGrid } from "@farming-labs/theme/command-grid";
import { ArrowUpRight, BookOpenText, Bot, Rocket, SlidersHorizontal, Sparkles } from "lucide-react";
import { DocsBrand } from "./components/docs-brand";
import { docsSite } from "./lib/site";

export default defineDocs({
	entry: "docs",
	theme: commandGrid({
		ui: {
			typography: {
				font: {
					style: {
						sans: "'IBM Plex Mono', 'Geist Mono', ui-monospace, monospace",
						mono: "'IBM Plex Mono', 'Geist Mono', ui-monospace, monospace",
					},
				},
			},
		},
	}),
	nav: {
		title: createElement(DocsBrand),
		url: "/docs",
	},
	github: {
		url: docsSite.githubUrl,
		directory: "apps/docs",
	},
	icons: {
		book: createElement(BookOpenText, { size: 15, strokeWidth: 2.2 }),
		rocket: createElement(Rocket, { size: 15, strokeWidth: 2.2 }),
		sliders: createElement(SlidersHorizontal, { size: 15, strokeWidth: 2.2 }),
	},
	search: {
		provider: "simple",
		maxResults: 8,
	},
	ordering: "numeric",
	sidebar: {
		flat: true,
	},
	pageActions: {
		copyMarkdown: {
			enabled: true,
		},
		openDocs: {
			enabled: true,
			providers: [
				{
					name: "ChatGPT",
					icon: createElement(Bot, { size: 14, strokeWidth: 2.1 }),
					urlTemplate:
						"https://chatgpt.com/?hints=search&q=Read+{mdxUrl},+I+want+to+ask+questions+about+it.",
				},
				{
					name: "Claude",
					icon: createElement(Sparkles, { size: 14, strokeWidth: 2.1 }),
					urlTemplate:
						"https://claude.ai/new?q=Read+{mdxUrl},+I+want+to+ask+questions+about+it.",
				},
				{
					name: "GitHub",
					icon: createElement(ArrowUpRight, { size: 14, strokeWidth: 2.1 }),
					urlTemplate: "{githubUrl}",
				},
			],
		},
	},
	lastUpdated: {
		position: "footer",
	},
	llmsTxt: {
		enabled: true,
		baseUrl: docsSite.url,
		siteTitle: docsSite.title,
		siteDescription: docsSite.description,
	},
	metadata: {
		titleTemplate: "%s | better-cmdk Docs",
		description: docsSite.description,
		twitterCard: "summary_large_image",
	},
	og: {
		defaultImage: `${docsSite.url}/opengraph-image`,
	},
});
