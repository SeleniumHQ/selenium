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
import platform
import sys

_PLATFORM_MODULES = {
    "darwin": "selenium_manager_macos",
    "win32": "selenium_manager_windows",
}

# Linux is the only platform where we ship a package per architecture: the macOS
# binary is universal and the Windows one is i686, which runs on x64 and arm64 too.
_LINUX_MODULES = {
    "x86_64": "selenium_manager_linux_x86_64",
    "aarch64": "selenium_manager_linux_aarch64",
}


def _module_name(sys_platform: str, machine: str) -> str:
    if sys_platform == "linux":
        module_name = _LINUX_MODULES.get(machine)
        if module_name is None:
            supported = ", ".join(_LINUX_MODULES)
            raise SystemExit(f"Unsupported Linux architecture: {machine}. Supported: {supported}")
        return module_name

    module_name = _PLATFORM_MODULES.get(sys_platform)
    if module_name is None:
        raise SystemExit(f"Unsupported platform: {sys_platform}. Supported: linux, darwin, win32")
    return module_name


def main() -> None:
    module_name = _module_name(sys.platform, platform.machine())

    try:
        platform_module = importlib.import_module(module_name)
    except ImportError as exc:
        pkg_name = module_name.replace("_", "-")
        raise SystemExit(f"Platform package {pkg_name} is not installed.\nRun: pip install {pkg_name}") from exc

    platform_module.main()
