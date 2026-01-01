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
    # We use IIFE format and the output will be wrapped further
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
        # Output a single file
        output = "%s_bundle.js" % name,
        **kwargs
    )

    # Step 2: Wrap the bundle in the Selenium fragment pattern
    # We use $(rootpaths) since esbuild may output multiple files (js + map)
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
