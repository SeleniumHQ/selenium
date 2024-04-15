import { build } from "esbuild";
import {esbuildConfig} from "./esbuild.base.config.mjs";


await build({
  ...esbuildConfig,

  minify: true
})
