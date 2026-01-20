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

"""Run ruff linter on Python files outside py/ directory."""

import os
import subprocess
import sys

from python.runfiles import Runfiles

LINT_DIRS = ["scripts", "common", "dotnet", "java", "javascript", "rb"]
EXCLUDES = ["**/node_modules/**", "**/.bundle/**"]


if __name__ == "__main__":
    r = Runfiles.Create()
    ruff = r.Rlocation("rules_multitool++multitool+multitool/tools/ruff/ruff")

    os.chdir(os.environ["BUILD_WORKSPACE_DIRECTORY"])

    # Check if --check flag is passed (for CI - verify without fixing)
    check_only = "--check" in sys.argv
    extra_args = [arg for arg in sys.argv[1:] if arg != "--check"]

    exclude_args = []
    for pattern in EXCLUDES:
        exclude_args.extend(["--exclude", pattern])

    check_cmd = [ruff, "check", "--config=py/pyproject.toml"]
    if not check_only:
        check_cmd.extend(["--fix", "--show-fixes"])
    check_result = subprocess.run(check_cmd + exclude_args + LINT_DIRS + extra_args)

    format_cmd = [ruff, "format", "--config=py/pyproject.toml"]
    if check_only:
        format_cmd.append("--check")
    format_result = subprocess.run(format_cmd + exclude_args + LINT_DIRS)

    sys.exit(check_result.returncode or format_result.returncode)
