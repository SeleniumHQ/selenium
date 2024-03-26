import {esbuildConfig} from "./esbuild.base.config.mjs";

export default {
  ...esbuildConfig,

  // Unset configs properties that `esbuild` from Bazel will override
  bundle: undefined,
  entryPoints: undefined,
  external: undefined,
  minify: undefined,
  outdir: undefined,
  outfile: undefined,
  splitting: undefined,
  sourcemap: undefined,
}
