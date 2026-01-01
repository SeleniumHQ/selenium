# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""
Modern TypeScript-based fragment generation using esbuild.

This replaces the Closure Compiler-based fragment.bzl with a modern approach:
1. TypeScript source files are compiled and bundled with esbuild
2. Tree-shaking removes unused code
3. esbuild's minifier produces compact output
4. A wrapper script applies the IIFE wrapper pattern required by Selenium

The wrapper pattern ensures:
- The fragment never pollutes the global scope
- The inner function runs with `this === window` so navigator/document are accessible
- The exported function is returned and can be called with arguments

NOTE: esbuild fragments are currently ~50% larger than Closure Compiler fragments
due to less aggressive minification (no property renaming) and module-level
tree-shaking vs statement-level. This will be addressed when we:
1. Complete the migration away from Closure Compiler
2. Switch to const enums with isolatedModules: false
3. Optionally add terser as a post-processing step
"""

load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")
load("@aspect_rules_js//js:defs.bzl", "js_run_binary")

def ts_fragment(
        name,
        entry_point,
        visibility = None,
        deps = [],
        **kwargs):
    """
    Generates a minified JavaScript fragment from TypeScript source.

    Args:
        name: Name of the fragment target
        entry_point: TypeScript file that exports the fragment function as default
        visibility: Bazel visibility
        deps: Dependencies (ts_project targets)
        **kwargs: Additional arguments passed to esbuild
    """

    # Step 1: Bundle with esbuild (tree-shaking + minification)
    bundle_name = "_%s_bundle" % name
    esbuild(
        name = bundle_name,
        srcs = deps + [entry_point],
        entry_point = entry_point,
        bundle = True,
        minify = True,
        format = "iife",
        platform = "browser",
        target = "es2015",
        output = "%s_bundle.js" % name,
        config = {
            "treeShaking": True,
            "ignoreAnnotations": False,
        },
        # Disable sandbox plugin to allow resolving sources from other packages
        bazel_sandbox_plugin = False,
        **kwargs
    )

    # Step 2: Wrap the bundle in the Selenium fragment pattern
    js_run_binary(
        name = name,
        srcs = [":%s" % bundle_name],
        args = [
            "$(rootpaths :%s)" % bundle_name,
        ],
        stdout = "%s.js" % name,
        tool = "//javascript/private:fragment_wrapper",
        visibility = visibility,
    )
