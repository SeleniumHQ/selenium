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

"""Run ruff format on Python files across the project.

Usage:
    bazel run //py:ruff-format -- [ruff format args]
"""

import os
import subprocess
import sys

from python.runfiles import Runfiles

ALL_DIRS = ["py", "scripts", "common", "dotnet", "java", "javascript", "rb"]
EXCLUDES = ["**/node_modules/**", "**/.bundle/**", "**/bidi/**", "**/devtools/**"]


def run_format(ruff, exclude_args, dirs, extra_args):
    """Run ruff format."""
    cmd = [ruff, "format", "--config=py/pyproject.toml"]
    return subprocess.run(cmd + exclude_args + dirs + extra_args).returncode


if __name__ == "__main__":
    r = Runfiles.Create()
    ruff = r.Rlocation("rules_multitool++multitool+multitool/tools/ruff/ruff")

    os.chdir(os.environ["BUILD_WORKSPACE_DIRECTORY"])

    exclude_args = []
    for pattern in EXCLUDES:
        exclude_args.extend(["--exclude", pattern])

    sys.exit(run_format(ruff, exclude_args, ALL_DIRS, sys.argv[1:]))
