import { defineConfig } from "tsdown"

const publish =
    Bun.argv.includes("--publish") ||
    process.argv.includes("--publish") ||
    process.env.npm_lifecycle_event === "build:publish"
const DIST_TYPES_ENTRY = "./dist/index.d.ts"
const ROOT_STYLE_ENTRY = "./index.css"
const ROOT_STYLES_SUBPATH = "./styles.css"
const DIST_STYLES_ENTRY = "./dist/styles.css"

function getOrderedRootExport(mainExport: unknown): Record<string, unknown> {
    const rootExport: Record<string, unknown> = {
        types: DIST_TYPES_ENTRY,
        style: ROOT_STYLE_ENTRY,
    }

    if (typeof mainExport === "string") {
        rootExport.import = mainExport
        rootExport.default = mainExport
        return rootExport
    }

    if (
        typeof mainExport !== "object" ||
        mainExport === null ||
        Array.isArray(mainExport)
    ) {
        return rootExport
    }

    const mainRecord = mainExport as Record<string, unknown>

    if ("require" in mainRecord) {
        rootExport.require = mainRecord.require
    }
    if ("import" in mainRecord) {
        rootExport.import = mainRecord.import
    }
    if ("default" in mainRecord) {
        rootExport.default = mainRecord.default
    }

    for (const [key, value] of Object.entries(mainRecord)) {
        if (
            key === "types" ||
            key === "style" ||
            key === "require" ||
            key === "import" ||
            key === "default"
        ) {
            continue
        }
        rootExport[key] = value
    }

    return rootExport
}

export default defineConfig({
    entry: ["index.ts", "lib/utils.ts"],
    format: "esm",
    target: "es2022",
    platform: "browser",
    tsconfig: "./tsconfig.json",
    clean: true,
    minify: true,
    skipNodeModulesBundle: true,
    exports: publish
        ? {
              legacy: true,
              customExports: (pkgExports) => {
                  const nextExports = { ...pkgExports }
                  nextExports["."] = getOrderedRootExport(nextExports["."])
                  nextExports["./index.css"] = ROOT_STYLE_ENTRY
                  nextExports[ROOT_STYLES_SUBPATH] = DIST_STYLES_ENTRY

                  return nextExports
              },
          }
        : false,
})
