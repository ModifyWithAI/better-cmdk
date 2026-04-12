import { createSocialImage } from "./lib/social-image";

export const alt = "better-cmdk Docs";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function TwitterImage() {
	return createSocialImage({
		eyebrow: "COMMAND-GRID DOCS",
		headline: "BETTER-CMDK",
		subheadline: "INSTALL. INTEGRATE. EXTEND.",
		footerLeft: "docs.better-cmdk.com",
		footerRight: "REACT COMMAND MENU",
	});
}
