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

"""Run ruff linter/formatter on Python files across the project.

Usage:
    bazel run //py:ruff              # both check+fix and format (default)
    bazel run //py:ruff -- format    # format only
    bazel run //py:ruff -- check     # check+fix only
    bazel run //py:ruff -- --check   # CI mode: verify only, no fixes
"""

import os
import subprocess
import sys

from python.runfiles import Runfiles

ALL_DIRS = ["py", "scripts", "common", "dotnet", "java", "javascript", "rb"]
EXCLUDES = ["**/node_modules/**", "**/.bundle/**"]


def run_check(ruff, exclude_args, dirs, check_only, extra_args):
    """Run ruff check (linting)."""
    cmd = [ruff, "check", "--config=py/pyproject.toml"]
    if not check_only:
        cmd.extend(["--fix", "--show-fixes"])
    return subprocess.run(cmd + exclude_args + dirs + extra_args).returncode


def run_format(ruff, exclude_args, dirs, check_only):
    """Run ruff format."""
    cmd = [ruff, "format", "--config=py/pyproject.toml"]
    if check_only:
        cmd.append("--check")
    return subprocess.run(cmd + exclude_args + dirs).returncode


if __name__ == "__main__":
    r = Runfiles.Create()
    ruff = r.Rlocation("rules_multitool++multitool+multitool/tools/ruff/ruff")

    os.chdir(os.environ["BUILD_WORKSPACE_DIRECTORY"])

    args = sys.argv[1:]
    check_only = "--check" in args
    args = [arg for arg in args if arg != "--check"]

    # Determine mode: format, check, or both (default)
    mode = "both"
    if args and args[0] in ("format", "check"):
        mode = args.pop(0)

    exclude_args = []
    for pattern in EXCLUDES:
        exclude_args.extend(["--exclude", pattern])

    exit_code = 0

    if mode in ("check", "both"):
        exit_code |= run_check(ruff, exclude_args, ALL_DIRS, check_only, args)

    if mode in ("format", "both"):
        exit_code |= run_format(ruff, exclude_args, ALL_DIRS, check_only)

    sys.exit(exit_code)
