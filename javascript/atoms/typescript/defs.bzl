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

"""Build rules for the TypeScript atoms.

An atom ships in two shapes, both built from one entry point:

  typescript/<name>.generated.js  the injectable expression the language
                                  bindings send over the wire, and the text the
                                  `@selenium/atoms` `/source` subpath exports
  typescript/<name>-global.js     the same bytes published as a browser global
                                  so the QUnit pages can load it with <script>

Keeping both derived from a single esbuild output is deliberate: the test pages
then exercise the artifact the bindings actually inject, rather than a parallel
build of the same source that can drift away from it.
"""

load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")
load("@aspect_rules_js//js:defs.bzl", "js_run_binary")

# The single registry of TypeScript atoms. `typescript_atom` builds from it and
# the npm export map is generated from it, so adding an atom is a one-line
# change here rather than an edit in four places that silently drift apart.
#
#   name     entry point stem under typescript/, and the npm subpath
#   export   the identifier re-exported from index.ts
#   global   dotted window path the QUnit pages read
#   aliases  extra npm subpaths serving the *same* artifact. An alias is an
#            export-map entry, never a second build target — two targets would
#            mean two compiled copies that can drift.
ATOMS = [
    {
        "name": "get-attribute",
        "export": "getAttribute",
        "global": "bot.dom.typescript.getAttribute",
        "aliases": [],
    },
    {
        "name": "find-elements",
        "export": "findElements",
        "global": "bot.locators.typescript.findElements",
        "aliases": [],
    },
    {
        "name": "is-displayed",
        "export": "isDisplayed",
        "global": "bot.dom.typescript.isShown",
        "aliases": [],
    },
]

def typescript_atom(name, global_name, srcs, visibility = None):
    """Builds one TypeScript atom in both of the shapes consumers need.

    Args:
      name: atom stem, e.g. "is-displayed". The entry point is
        typescript/<name>.ts and the outputs are named after it.
      global_name: dotted path the browser-global shim assigns to, e.g.
        "bot.dom.typescript.isShown".
      srcs: every TypeScript source the bundle may reach — the entry point plus
        the shared modules under typescript/core/.
      visibility: visibility for the generated artifacts.
    """

    esbuild(
        name = "%s-typescript-generated" % name,
        srcs = srcs,
        bundle = True,
        config = ":esbuild-atom-config",
        entry_point = "typescript/%s.ts" % name,
        format = "iife",
        output = "typescript/%s.generated.js" % name,
        platform = "browser",
        # The rule defaults to "linked", which appends a sourceMappingURL
        # comment. That rides along on every injection and points at a file no
        # browser can fetch, so the atom text stays map-free.
        sourcemap = "",
        target = "es2017",
        visibility = visibility,
    )

    js_run_binary(
        name = "%s-global" % name,
        srcs = [":typescript/%s.generated.js" % name],
        outs = ["typescript/%s-global.js" % name],
        args = [
            "$(rootpath :typescript/%s.generated.js)" % name,
            "$(rootpath :typescript/%s-global.js)" % name,
            global_name,
        ],
        tool = ":wrap_as_global",
        visibility = visibility,
    )
