#!/usr/bin/env bun

import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const PACKAGE_JSON = resolve(import.meta.dirname, "..", "package.json")

type ExportEntry = string | Record<string, unknown>

function normalizeRootExport(
	rootExport: ExportEntry | undefined,
	typesField: unknown,
): Record<string, unknown> {
	if (typeof rootExport === "string") {
		const normalized: Record<string, unknown> = {
			import: rootExport,
			default: rootExport,
		}
		if (typeof typesField === "string") {
			normalized.types = typesField
		}
		normalized.style = "./index.css"
		return normalized
	}

	const normalized = { ...(rootExport ?? {}) }
	normalized.style = "./index.css"
	return normalized
}

async function fixPublishCssExports() {
	const source = await readFile(PACKAGE_JSON, "utf8")
	const pkg = JSON.parse(source) as Record<string, unknown>

	if (
		!pkg.exports ||
		typeof pkg.exports !== "object" ||
		Array.isArray(pkg.exports)
	) {
		throw new Error("Expected package.json exports to be an object.")
	}

	const exportsField = { ...(pkg.exports as Record<string, unknown>) }

	exportsField["."] = normalizeRootExport(
		exportsField["."] as ExportEntry | undefined,
		pkg.types,
	)
	exportsField["./index.css"] = "./index.css"
	exportsField["./styles.css"] = "./dist/styles.css"

	pkg.exports = exportsField
	pkg.style = "./index.css"

	await writeFile(PACKAGE_JSON, `${JSON.stringify(pkg, null, 2)}\n`, "utf8")
	console.log("[fix-publish-css-exports] CSS exports ensured.")
}

fixPublishCssExports().catch((error) => {
	console.error("[fix-publish-css-exports] Failed:", error)
	process.exit(1)
})
