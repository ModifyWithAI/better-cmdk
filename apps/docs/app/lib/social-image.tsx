import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

type SocialImageOptions = {
	eyebrow?: string;
	headline?: string;
	subheadline?: string;
	footerLeft?: string;
	footerRight?: string;
};

type DocsPageSocialImageOptions = {
	title: string;
	description?: string;
	path?: string;
};

export const socialImageSize = {
	width: 1200,
	height: 630,
};

export const socialImageContentType = "image/png";

const fontsPromise = Promise.all([
	readFile(join(process.cwd(), "../web/public/fonts/BebasNeue-Regular.ttf")),
	readFile(join(process.cwd(), "../web/public/fonts/IBMPlexMono-Medium.ttf")),
]);

function getHeadlineFontSize(headline: string) {
	if (headline.length > 28) return 108;
	if (headline.length > 20) return 124;
	if (headline.length > 14) return 142;
	return 170;
}

function getSubheadlineFontSize(subheadline: string) {
	if (subheadline.length > 150) return 23;
	if (subheadline.length > 110) return 27;
	if (subheadline.length > 80) return 31;
	return 35;
}

export async function createSocialImage(options: SocialImageOptions = {}) {
	const [bebas, plexMono] = await fontsPromise;

	const eyebrow = options.eyebrow ?? "BETTER-CMDK DOCS";
	const headline = options.headline ?? "BETTER-CMDK";
	const subheadline =
		options.subheadline ?? "COMMAND MENU, AI CHAT, AND ACTIONS FOR REACT";
	const footerLeft = options.footerLeft ?? "docs.better-cmdk.com";
	const footerRight = options.footerRight ?? "REACT COMMAND MENU";
	const headlineFontSize = getHeadlineFontSize(headline);
	const subheadlineFontSize = getSubheadlineFontSize(subheadline);

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					position: "relative",
					background: "#f8f6ed",
					color: "#111111",
					padding: 26,
					fontFamily: "IBM Plex Mono",
				}}
			>
				<div
					style={{
						position: "absolute",
						inset: 0,
						opacity: 0.14,
						backgroundImage:
							"linear-gradient(to right, #111111 1px, transparent 1px), linear-gradient(to bottom, #111111 1px, transparent 1px)",
						backgroundSize: "42px 42px",
					}}
				/>

				<div
					style={{
						position: "absolute",
						top: 0,
						right: 42,
						width: 200,
						height: 68,
						transform: "rotate(8deg)",
						border: "4px solid #111111",
						background: "#ddd9cf",
					}}
				/>

				<div
					style={{
						position: "absolute",
						bottom: 8,
						left: 18,
						width: 140,
						height: 56,
						transform: "rotate(-10deg)",
						border: "4px solid #111111",
						background: "#ebe7dd",
					}}
				/>

				<div
					style={{
						width: "100%",
						height: "100%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						position: "relative",
						border: "6px solid #111111",
						padding: "30px 34px 24px",
						background: "rgba(248, 246, 237, 0.9)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 24,
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								border: "3px solid #111111",
								background: "#ffffff",
								padding: "7px 14px",
								fontSize: 19,
								textTransform: "uppercase",
								letterSpacing: "0.16em",
								lineHeight: 1,
							}}
						>
							{eyebrow}
						</div>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8,
							flex: 1,
							justifyContent: "center",
						}}
					>
						<div
							style={{
								display: "flex",
								fontFamily: "Bebas Neue",
								fontSize: headlineFontSize,
								lineHeight: 0.82,
								letterSpacing: "0.01em",
								textTransform: "uppercase",
								maxWidth: 1000,
							}}
						>
							{headline}
						</div>
						<div
							style={{
								display: "flex",
								maxWidth: 820,
								fontSize: subheadlineFontSize,
								lineHeight: 1,
								letterSpacing: "0.12em",
								textTransform: "uppercase",
							}}
						>
							{subheadline}
						</div>
					</div>

					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							borderTop: "4px solid #111111",
							paddingTop: 16,
							gap: 24,
						}}
					>
						<div
							style={{
								display: "flex",
								fontSize: 20,
								letterSpacing: "0.16em",
								textTransform: "uppercase",
							}}
						>
							{footerLeft}
						</div>
						<div
							style={{
								display: "flex",
								fontSize: 20,
								letterSpacing: "0.16em",
								textTransform: "uppercase",
							}}
						>
							{footerRight}
						</div>
					</div>
				</div>
			</div>
		),
		{
			...socialImageSize,
			fonts: [
				{
					name: "Bebas Neue",
					data: bebas,
					style: "normal",
					weight: 400,
				},
				{
					name: "IBM Plex Mono",
					data: plexMono,
					style: "normal",
					weight: 500,
				},
			],
		},
	);
}

export async function createDocsPageSocialImage(
	options: DocsPageSocialImageOptions,
) {
	const footerLeft = options.path
		? `docs.better-cmdk.com${options.path}`
		: "docs.better-cmdk.com";

	return createSocialImage({
		eyebrow: "BETTER-CMDK DOCS",
		headline: options.title,
		subheadline:
			options.description ??
			"COMMAND MENU, AI CHAT, AND ACTIONS FOR REACT",
		footerLeft,
		footerRight: "REACT COMMAND MENU",
	});
}
