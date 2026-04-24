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

"""Generate a Closure deps.js file by scanning JS sources for goog.provide/require/module calls.

Replaces the Node.js closure-make-deps wrapper to avoid npm symlink issues on Windows.

Usage: closure_make_deps.py <files_list> <output> <closure_path>
  files_list   - path to a file containing one JS source path per line
  output       - path to write the generated deps.js
  closure_path - directory containing Closure Library's base.js (for computing relative paths)
"""

import os
import re
import sys

PROVIDE_RE = re.compile(r"goog\.provide\(\s*['\"]([^'\"]+)['\"]\s*\)")
MODULE_RE = re.compile(r"goog\.module\(\s*['\"]([^'\"]+)['\"]\s*\)")
REQUIRE_RE = re.compile(r"goog\.require\(\s*['\"]([^'\"]+)['\"]\s*\)")


def strip_comments(content):
    """Remove JS comments so regexes don't match goog.require() in documentation."""
    content = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
    content = re.sub(r"//[^\n]*", "", content)
    return content


def parse_js_file(path):
    """Extract goog.provide, goog.module, and goog.require namespaces from a JS file."""
    with open(path, encoding="utf-8") as f:
        content = f.read()

    cleaned = strip_comments(content)

    provides = sorted(PROVIDE_RE.findall(cleaned))
    modules = sorted(MODULE_RE.findall(cleaned))
    requires = sorted(REQUIRE_RE.findall(cleaned))

    is_module = len(modules) > 0
    all_provides = sorted(set(provides + modules))

    return all_provides, requires, is_module


def main():
    if len(sys.argv) < 4:
        print(
            "Usage: closure_make_deps.py <files_list> <output> <closure_path>",
            file=sys.stderr,
        )
        sys.exit(1)

    files_list_path = sys.argv[1]
    output_path = sys.argv[2]
    closure_path = sys.argv[3]

    with open(files_list_path, encoding="utf-8") as f:
        files = [line.strip() for line in f if line.strip()]

    lines = []
    for filepath in files:
        provides, requires, is_module = parse_js_file(filepath)

        rel_path = os.path.relpath(filepath, closure_path)
        # deps.js is consumed in the browser, so always use forward slashes
        rel_path = rel_path.replace(os.sep, "/")

        provides_str = ", ".join(f"'{p}'" for p in provides)
        requires_str = ", ".join(f"'{r}'" for r in requires)

        if is_module:
            line = f"goog.addDependency('{rel_path}', [{provides_str}], [{requires_str}], {{'module': 'goog'}});"
        else:
            line = f"goog.addDependency('{rel_path}', [{provides_str}], [{requires_str}]);"

        lines.append((rel_path, line))

    # Sort by relative path for deterministic output
    lines.sort(key=lambda x: x[0])

    with open(output_path, "w", encoding="utf-8") as f:
        for _, line in lines:
            f.write(line + "\n")


if __name__ == "__main__":
    main()
