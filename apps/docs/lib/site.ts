export const docsSite = {
	name: "better-cmdk",
	title: "better-cmdk Docs",
	description:
		"Guides, quickstart steps, and integration patterns for better-cmdk's AI-native command menu for React.",
	url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.better-cmdk.com").replace(
		/\/+$/,
		"",
	),
	githubUrl: "https://github.com/ModifyWithAI/better-cmdk",
	keywords: [
		"better-cmdk docs",
		"react command palette docs",
		"ai command menu docs",
		"command palette quickstart",
		"modifywithai integration",
	],
};
