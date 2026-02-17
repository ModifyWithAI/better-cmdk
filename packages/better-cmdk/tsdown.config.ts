import { defineConfig } from "tsdown"

const publish = Bun.argv.includes("--publish")
const DIST_TYPES_ENTRY = "./dist/index.d.ts"

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
                  const mainExport = nextExports["."]

                  if (
                      typeof mainExport === "object" &&
                      mainExport !== null &&
                      !Array.isArray(mainExport)
                  ) {
                      nextExports["."] = {
                          ...mainExport,
                          style: "./index.css",
                          types: DIST_TYPES_ENTRY,
                      }
                  } else if (typeof mainExport === "string") {
                      const rootExport: Record<string, unknown> = {
                          import: mainExport,
                          default: mainExport,
                          style: "./index.css",
                          types: DIST_TYPES_ENTRY,
                      }
                      nextExports["."] = rootExport
                  } else {
                      nextExports["."] = {
                          style: "./index.css",
                          types: DIST_TYPES_ENTRY,
                      }
                  }

                  nextExports["./index.css"] = "./index.css"
                  nextExports["./styles.css"] = "./dist/styles.css"

                  return nextExports
              },
          }
        : false,
})
