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


"""Run mypy type checker for Selenium Python bindings.

This script is used by Bazel to run mypy type checking.
"""

import os
import sys

from mypy import api


def main():
    # Find the workspace root - Bazel sets BUILD_WORKSPACE_DIRECTORY when using 'bazel run'
    workspace = os.environ.get("BUILD_WORKSPACE_DIRECTORY")
    if workspace:
        py_dir = os.path.join(workspace, "py")
    else:
        # Fallback for direct execution
        py_dir = os.path.dirname(os.path.abspath(__file__))

    os.chdir(py_dir)

    # Run mypy on the selenium package
    # Configuration is read from pyproject.toml [tool.mypy] section
    args = ["selenium", *sys.argv[1:]]
    stdout, stderr, exit_code = api.run(args)

    if stdout:
        print(stdout, end="")
    if stderr:
        print(stderr, end="", file=sys.stderr)

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
