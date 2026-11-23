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
                                  bindings send over the wire (not yet exported
                                  from the npm package)
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
        "name": "find-element",
        "export": "findElement",
        "global": "bot.locators.typescript.findElement",
        "aliases": [],
    },
    {
        "name": "active-element",
        "export": "activeElement",
        "global": "bot.frame.typescript.activeElement",
        "aliases": [],
    },
    {
        "name": "default-content",
        "export": "defaultContent",
        "global": "bot.frame.typescript.defaultContent",
        "aliases": [],
    },
    {
        "name": "frame-by-id-or-name",
        "export": "frameByIdOrName",
        "global": "bot.frame.typescript.frameByIdOrName",
        "aliases": [],
    },
    {
        "name": "frame-by-index",
        "export": "frameByIndex",
        "global": "bot.frame.typescript.frameByIndex",
        "aliases": [],
    },
    {
        "name": "get-frame-window",
        "export": "getFrameWindow",
        "global": "bot.frame.typescript.getFrameWindow",
        "aliases": [],
    },
    {
        "name": "is-displayed",
        "export": "isDisplayed",
        "global": "bot.dom.typescript.isShown",
        "aliases": [],
    },
    {
        "name": "is-enabled",
        "export": "isEnabled",
        "global": "bot.dom.typescript.isEnabled",
        "aliases": [],
    },
    {
        "name": "is-selected",
        "export": "isSelected",
        "global": "bot.dom.typescript.isSelected",
        "aliases": [],
    },
    {
        "name": "is-editable",
        "export": "isEditable",
        "global": "bot.dom.typescript.isEditable",
        "aliases": [],
    },
    {
        "name": "is-focusable",
        "export": "isFocusable",
        "global": "bot.dom.typescript.isFocusable",
        "aliases": [],
    },
    {
        "name": "is-interactable",
        "export": "isInteractable",
        "global": "bot.dom.typescript.isInteractable",
        "aliases": [],
    },
    {
        "name": "get-attribute-value",
        "export": "getAttributeValue",
        "global": "bot.dom.typescript.getAttributeValue",
        "aliases": [],
    },
    {
        "name": "get-size",
        "export": "getSize",
        "global": "bot.dom.typescript.getSize",
        "aliases": [],
    },
    {
        "name": "get-location",
        "export": "getLocation",
        "global": "bot.dom.typescript.getLocation",
        "aliases": [],
    },
    # get-value-of-css-property is an export-map alias over this one artifact,
    # not a second build target: two targets would be two bundles that can
    # drift, and the bindings disagree on the name badly enough that neither
    # spelling can be dropped.
    {
        "name": "get-effective-style",
        "export": "getEffectiveStyle",
        "global": "bot.dom.typescript.getEffectiveStyle",
        "aliases": ["get-value-of-css-property"],
    },
    {
        "name": "get-top-left-coordinates",
        "export": "getTopLeftCoordinates",
        "global": "bot.dom.typescript.getTopLeftCoordinates",
        "aliases": [],
    },
    {
        "name": "get-text",
        "export": "getText",
        "global": "bot.dom.typescript.getText",
        "aliases": [],
    },
    # The storage atoms publish under bot.storage rather than bot.dom: they
    # are ports of bot.storage.*, and nothing about them is a DOM read.
    {
        "name": "get-local-storage-item",
        "export": "getLocalStorageItem",
        "global": "bot.storage.typescript.getLocalStorageItem",
        "aliases": [],
    },
    {
        "name": "get-local-storage-key",
        "export": "getLocalStorageKey",
        "global": "bot.storage.typescript.getLocalStorageKey",
        "aliases": [],
    },
    {
        "name": "get-local-storage-keys",
        "export": "getLocalStorageKeys",
        "global": "bot.storage.typescript.getLocalStorageKeys",
        "aliases": [],
    },
    {
        "name": "get-local-storage-size",
        "export": "getLocalStorageSize",
        "global": "bot.storage.typescript.getLocalStorageSize",
        "aliases": [],
    },
    {
        "name": "set-local-storage-item",
        "export": "setLocalStorageItem",
        "global": "bot.storage.typescript.setLocalStorageItem",
        "aliases": [],
    },
    {
        "name": "remove-local-storage-item",
        "export": "removeLocalStorageItem",
        "global": "bot.storage.typescript.removeLocalStorageItem",
        "aliases": [],
    },
    {
        "name": "clear-local-storage",
        "export": "clearLocalStorage",
        "global": "bot.storage.typescript.clearLocalStorage",
        "aliases": [],
    },
    {
        "name": "get-session-storage-item",
        "export": "getSessionStorageItem",
        "global": "bot.storage.typescript.getSessionStorageItem",
        "aliases": [],
    },
    {
        "name": "get-session-storage-key",
        "export": "getSessionStorageKey",
        "global": "bot.storage.typescript.getSessionStorageKey",
        "aliases": [],
    },
    {
        "name": "get-session-storage-keys",
        "export": "getSessionStorageKeys",
        "global": "bot.storage.typescript.getSessionStorageKeys",
        "aliases": [],
    },
    {
        "name": "get-session-storage-size",
        "export": "getSessionStorageSize",
        "global": "bot.storage.typescript.getSessionStorageSize",
        "aliases": [],
    },
    {
        "name": "set-session-storage-item",
        "export": "setSessionStorageItem",
        "global": "bot.storage.typescript.setSessionStorageItem",
        "aliases": [],
    },
    {
        "name": "remove-session-storage-item",
        "export": "removeSessionStorageItem",
        "global": "bot.storage.typescript.removeSessionStorageItem",
        "aliases": [],
    },
    {
        "name": "clear-session-storage",
        "export": "clearSessionStorage",
        "global": "bot.storage.typescript.clearSessionStorage",
        "aliases": [],
    },
    {
        "name": "execute-script",
        "export": "executeScript",
        "global": "bot.inject.typescript.executeScript",
        "aliases": [],
    },
    {
        "name": "execute-async-script",
        "export": "executeAsyncScript",
        "global": "bot.inject.typescript.executeAsyncScript",
        "aliases": [],
    },
    {
        "name": "get-element-from-cache",
        "export": "getElementFromCache",
        "global": "bot.inject.typescript.getElementFromCache",
        "aliases": [],
    },
    {
        "name": "find-element-fragment",
        "export": "findElementFragment",
        "global": "bot.inject.typescript.findElementFragment",
        "aliases": [],
    },
    {
        "name": "click",
        "export": "click",
        "global": "bot.action.typescript.click",
        "aliases": [],
    },
    {
        "name": "type",
        "export": "type",
        "global": "bot.action.typescript.type",
        "aliases": [],
    },
    {
        "name": "clear",
        "export": "clear",
        "global": "bot.action.typescript.clear",
        "aliases": [],
    },
    {
        "name": "submit",
        "export": "submit",
        "global": "bot.action.typescript.submit",
        "aliases": [],
    },
    # Not a DOM primitive behind a WebDriver command: the snapshot is computed by
    # script and labelled as such, so it gets its own namespace rather than
    # bot.dom (docs/decisions/18205-accessibility-tree-snapshot.md).
    {
        "name": "accessibility-snapshot",
        "export": "accessibilitySnapshot",
        "global": "bot.accessibility.typescript.snapshot",
        "aliases": [],
    },
    # The shape the language bindings fetch over BiDi: the same snapshot as JSON
    # text beside the element and frame references, so no binding decodes a
    # nested remote value (docs/decisions/18205-accessibility-tree-snapshot.md).
    {
        "name": "accessibility-snapshot-wire",
        "export": "accessibilitySnapshotWire",
        "global": "bot.accessibility.typescript.snapshotWire",
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
