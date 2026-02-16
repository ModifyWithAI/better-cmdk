#!/usr/bin/env bun

import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { INTEGRATION_PROMPT, type Framework } from "../prompts/integration"

const ROOT = resolve(import.meta.dirname, "..")
const DIST = resolve(ROOT, "dist")

const FRAMEWORKS: Framework[] = ["nextjs", "remix", "tanstack-start", "vite"]

async function build() {
	console.log("Building static prompt files...")

	for (const framework of FRAMEWORKS) {
		const dir = resolve(DIST, framework)
		await mkdir(dir, { recursive: true })

		const content = INTEGRATION_PROMPT(framework)
		await writeFile(resolve(dir, "AGENTS.md"), content, "utf-8")
		console.log(`  ${framework}/AGENTS.md`)
	}

	console.log("Done — 4 prompt files generated")
}

build().catch((err) => {
	console.error("Failed to build prompt files:", err)
	process.exit(1)
})
