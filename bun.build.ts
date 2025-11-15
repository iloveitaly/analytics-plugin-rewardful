await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "dist",
  external: ["analytics"],
  target: "browser",
  format: "esm",
  naming: {
    entry: "[dir]/[name].js",
  },
})

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "dist",
  external: ["analytics"],
  target: "node",
  format: "esm",
  naming: {
    entry: "[dir]/lib.node.js",
  },
})
