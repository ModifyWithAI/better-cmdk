import { defineConfig } from "tsdown"

const publish = Bun.argv.includes("--publish")

export default defineConfig({
    entry: ["index.ts", "lib/utils.ts"],
    format: "esm",
    target: "es2022",
    platform: "browser",
    tsconfig: "./tsconfig.json",
    clean: true,
    minify: true,
    skipNodeModulesBundle: true,
    exports: publish ? true : false,
})
