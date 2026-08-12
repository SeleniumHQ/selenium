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


"""Extracts the Python bindings' deprecations into a machine-readable dataset.

The deprecation policy says public functionality is marked deprecated with a
message naming its replacement before it is removed. Those messages are the
project's own record of "this is gone, use that instead", but they only exist as
prose inside `warnings.warn` calls, where nothing but a running program can read
them. That makes them invisible to the API reference, to any tool checking
generated code, and to a model reasoning about which API to suggest.

This script parses `py/selenium` with `ast` — no import, so it is safe to run
without a configured environment — and writes `deprecations.json` next to the
documentation sources, from where the Sphinx build publishes it alongside the
HTML.

Run it with::

    bazel run //py:generate-deprecations
"""

from __future__ import annotations

import argparse
import ast
import json
import os
import re

# Deprecation messages are written for a human reading a traceback, and follow a
# stable shape: what is deprecated, then what to use instead. Splitting on that
# hinge turns the prose into two fields without needing the messages rewritten.
_REPLACEMENT_PATTERNS = (
    re.compile(r"\bis deprecated[,;:]\s*(?P<replacement>.+)", re.IGNORECASE | re.DOTALL),
    re.compile(r"\bhas been deprecated[,;:]\s*(?P<replacement>.+)", re.IGNORECASE | re.DOTALL),
    re.compile(r"\bdeprecated[,;:]\s*(?P<replacement>use .+)", re.IGNORECASE | re.DOTALL),
)


def module_name(path, package_root):
    """Map a source path to its dotted module name."""
    relative = os.path.relpath(path, os.path.dirname(package_root))
    parts = relative.replace(os.sep, "/").removesuffix(".py").split("/")
    if parts[-1] == "__init__":
        parts.pop()
    return ".".join(parts)


def _string_value(node):
    """Return the value of a string literal, joining implicit concatenations."""
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    if isinstance(node, ast.JoinedStr):
        # An f-string: keep the literal parts and mark each interpolation, so the
        # message stays readable rather than being dropped for being dynamic.
        parts = []
        for value in node.values:
            if isinstance(value, ast.Constant) and isinstance(value.value, str):
                parts.append(value.value)
            else:
                parts.append("...")
        return "".join(parts)
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        left = _string_value(node.left)
        right = _string_value(node.right)
        if left is not None and right is not None:
            return left + right
    return None


def _is_deprecation_warning(node):
    """True for `warnings.warn(msg, DeprecationWarning, ...)` in either arg form."""
    func = node.func
    name = func.attr if isinstance(func, ast.Attribute) else getattr(func, "id", None)
    if name != "warn":
        return False

    categories = [arg for arg in node.args[1:]]
    categories += [kw.value for kw in node.keywords if kw.arg == "category"]
    for category in categories:
        category_name = category.attr if isinstance(category, ast.Attribute) else getattr(category, "id", None)
        if category_name in ("DeprecationWarning", "PendingDeprecationWarning"):
            return True
    return False


def _message(node):
    if node.args:
        return _string_value(node.args[0])
    for kw in node.keywords:
        if kw.arg == "message":
            return _string_value(kw.value)
    return None


def split_message(message):
    """Split a deprecation message into what is deprecated and what replaces it."""
    collapsed = " ".join(message.split())
    for pattern in _REPLACEMENT_PATTERNS:
        match = pattern.search(collapsed)
        if match:
            deprecated = collapsed[: match.start()].strip().rstrip(",;:")
            replacement = match.group("replacement").strip()
            return deprecated or None, replacement
    return None, None


def find_deprecations(source, module):
    """Return every deprecation declared in one module's source, in source order."""
    tree = ast.parse(source)
    deprecations = []

    # Walking with an explicit stack keeps the enclosing class and function in
    # hand, which is what makes an entry addressable as an API rather than as a
    # line number.
    stack = [(tree, [])]
    while stack:
        node, scope = stack.pop()
        for child in ast.iter_child_nodes(node):
            child_scope = scope
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                child_scope = scope + [child.name]
            elif isinstance(child, ast.Call) and _is_deprecation_warning(child):
                message = _message(child)
                if message:
                    deprecated, replacement = split_message(message)
                    deprecations.append(
                        {
                            "module": module,
                            "api": ".".join([module] + scope) if scope else module,
                            "deprecated": deprecated,
                            "replacement": replacement,
                            "message": " ".join(message.split()),
                            "line": child.lineno,
                        }
                    )
            stack.append((child, child_scope))

    return sorted(deprecations, key=lambda entry: entry["line"])


def collect(package_root):
    """Walk a package and collect every deprecation it declares."""
    deprecations = []
    for dirpath, dirnames, filenames in os.walk(package_root):
        # Generated CDP bindings are large, versioned, and not a public API
        # surface users are meant to hold on to.
        dirnames[:] = sorted(d for d in dirnames if d != "devtools" and not d.startswith("__"))
        for filename in sorted(filenames):
            if not filename.endswith(".py"):
                continue
            path = os.path.join(dirpath, filename)
            with open(path, encoding="utf-8") as f:
                source = f.read()
            if "DeprecationWarning" not in source:
                continue
            deprecations += find_deprecations(source, module_name(path, package_root))
    return deprecations


def build_dataset(package_root, version):
    return {
        "binding": "python",
        "version": version,
        "policy": "https://github.com/SeleniumHQ/selenium/blob/trunk/AGENTS.md#deprecation-policy",
        "description": (
            "Deprecated APIs in the Selenium Python bindings and their replacements, extracted from "
            "the deprecation warnings in the source of this release. An API listed here still works "
            "but will be removed; use the replacement instead."
        ),
        "deprecations": collect(package_root),
    }


def _version_from(pyproject):
    with open(pyproject, encoding="utf-8") as f:
        for line in f:
            match = re.match(r'^version\s*=\s*"(?P<version>[^"]+)"', line)
            if match:
                return match.group("version")
    return "unknown"


def main():
    # Under `bazel run` the sources are read-only runfiles, so writes have to go
    # back to the workspace; run directly, the script's own directory is `py`.
    workspace = os.environ.get("BUILD_WORKSPACE_DIRECTORY")
    py_dir = os.path.join(workspace, "py") if workspace else os.path.dirname(os.path.abspath(__file__))

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", default=os.path.join(py_dir, "selenium"))
    parser.add_argument("--output", default=os.path.join(py_dir, "docs", "source", "_extra", "deprecations.json"))
    parser.add_argument("--version", default=None)
    args = parser.parse_args()

    dataset = build_dataset(args.package, args.version or _version_from(os.path.join(py_dir, "pyproject.toml")))

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
        f.write("\n")

    print(f"wrote {len(dataset['deprecations'])} deprecations to: {args.output}")

    unresolved = [entry["api"] for entry in dataset["deprecations"] if not entry["replacement"]]
    if unresolved:
        print("\nno replacement could be read from the warning for:")
        for api in unresolved:
            print(f"    {api}")


if __name__ == "__main__":
    main()
