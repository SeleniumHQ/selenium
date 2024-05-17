/** @type {import("esbuild").BuildOptions;} */
export const esbuildConfig = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  minify: false,
  external: [
    "fs",
    "module",
    "os",
    "path",
    "util"
  ],
  loader: {
    ".png": "file",
    ".svg": "file",
    ".woff": "file",
    ".woff2": "file",
  },
  platform: 'browser',
  outfile: 'build/index.js',
  sourcemap: true,
  target: 'es6',
  supported: {
    bigint: true
  },
}
