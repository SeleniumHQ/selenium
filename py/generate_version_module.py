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

"""Writes `selenium/_version.py` from the root `version.bzl` for docs builds outside Bazel.

Bazel generates this module during the build; Read the Docs and the tox `docs` env import
`selenium` straight from the source tree, so they run this first.
"""

import re
from pathlib import Path

py_root = Path(__file__).resolve().parent
version_bzl = py_root.parent / "version.bzl"
match = re.search(r'^\s*"python": "([^"]+)"', version_bzl.read_text(), re.MULTILINE)
if not match:
    raise SystemExit(f"No python entry in {version_bzl}")
(py_root / "selenium" / "_version.py").write_text(f'__version__ = "{match.group(1)}"\n')
