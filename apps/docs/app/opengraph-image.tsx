import { createSocialImage } from "./lib/social-image";

export const alt = "better-cmdk Docs";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function OpengraphImage() {
	return createSocialImage({
		eyebrow: "BETTER-CMDK DOCS",
		headline: "QUICKSTART",
		subheadline: "COMMAND MENU, AI CHAT, AND ACTIONS FOR REACT",
		footerLeft: "docs.better-cmdk.com",
		footerRight: "OPEN SOURCE",
	});
}
