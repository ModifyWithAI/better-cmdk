import { NextRequest } from "next/server";
import { createDocsPageSocialImage } from "@/app/lib/social-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const title = searchParams.get("title")?.trim() || "better-cmdk Docs";
	const description = searchParams.get("description")?.trim() || undefined;
	const path = searchParams.get("path")?.trim() || undefined;

	const imageResponse = await createDocsPageSocialImage({
		title,
		description,
		path,
	});

	const headers = new Headers(imageResponse.headers);
	headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

	return new Response(imageResponse.body, {
		headers,
		status: imageResponse.status,
		statusText: imageResponse.statusText,
	});
}
