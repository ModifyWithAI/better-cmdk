#!/usr/bin/env bun

import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const DIST_CSS = resolve(import.meta.dirname, "..", "dist", "styles.css")

const SCOPED_PROPERTIES_SELECTOR =
    ".bcmdk-root,.bcmdk-root *,.bcmdk-root:before,.bcmdk-root:after,.bcmdk-root *:before,.bcmdk-root *:after,.bcmdk-root::backdrop,.bcmdk-root *::backdrop"

async function sanitizeLibraryCss() {
    const source = await readFile(DIST_CSS, "utf8")

    let output = source
    let touched = false

    if (output.includes("*,:before,:after,::backdrop{")) {
        output = output.replace(
            "*,:before,:after,::backdrop{",
            `${SCOPED_PROPERTIES_SELECTOR}{`,
        )
        touched = true
    }

    const rootHostPattern = /:root,\s*:host\s*\{/g
    if (rootHostPattern.test(output)) {
        output = output.replace(rootHostPattern, ".bcmdk-root{")
        touched = true
    }

    const hostRootPattern = /:host,\s*:root\s*\{/g
    if (hostRootPattern.test(output)) {
        output = output.replace(hostRootPattern, ".bcmdk-root{")
        touched = true
    }

    const propertyRulePattern = /@property --tw-[^{]+\{[^}]*\}/g
    if (propertyRulePattern.test(output)) {
        output = output.replace(propertyRulePattern, "")
        touched = true
    }

    if (!touched) {
        console.warn(
            "[sanitize-library-css] No Tailwind global property rules were found to sanitize.",
        )
    }

    await writeFile(DIST_CSS, output, "utf8")
}

sanitizeLibraryCss().catch((error) => {
    console.error("[sanitize-library-css] Failed:", error)
    process.exit(1)
})
