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

import importlib
import sys

_PLATFORM_MODULES = {
    "linux": "selenium_manager_linux_x86_64",
    "darwin": "selenium_manager_macos",
    "win32": "selenium_manager_windows",
}


def main() -> None:
    module_name = _PLATFORM_MODULES.get(sys.platform)
    if module_name is None:
        raise SystemExit(f"Unsupported platform: {sys.platform}. Supported: linux, darwin, win32")

    try:
        platform_module = importlib.import_module(module_name)
    except ImportError as exc:
        pkg_name = module_name.replace("_", "-")
        raise SystemExit(f"Platform package {pkg_name} is not installed.\nRun: pip install {pkg_name}") from exc

    platform_module.main()
