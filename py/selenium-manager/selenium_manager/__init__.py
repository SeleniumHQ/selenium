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

"""Platform dispatch for the standalone Selenium Manager distribution.

The platform packages carry nothing but the binary and a path to it; this is the
only package that spawns a process, so `selenium-manager` means the same thing
whether it is reached through the console script, `python -m selenium_manager`,
`uvx selenium-manager`, or `binary_path()` from another library.
"""

import importlib
import os
import platform
import stat
import subprocess
import sys

__all__ = ["binary_path", "main"]

_PLATFORM_MODULES = {
    "darwin": "selenium_manager_macos",
    "win32": "selenium_manager_windows_x86",
}

# The architecture in a package name is the binary's, not the machine's. Linux is
# the only platform that needs a package per machine architecture: the macOS
# binary is universal, and the Windows i686 build runs on x64 and arm64 too, so
# every Windows machine resolves to the one `_x86` module.
_LINUX_MODULES = {
    "x86_64": "selenium_manager_linux_x86_64",
    "aarch64": "selenium_manager_linux_aarch64",
}


def _module_name(sys_platform: str, machine: str) -> str:
    if sys_platform == "linux":
        module_name = _LINUX_MODULES.get(machine)
        if module_name is None:
            supported = ", ".join(_LINUX_MODULES)
            raise RuntimeError(f"Unsupported Linux architecture: {machine}. Supported: {supported}")
        return module_name

    module_name = _PLATFORM_MODULES.get(sys_platform)
    if module_name is None:
        raise RuntimeError(f"Unsupported platform: {sys_platform}. Supported: linux, darwin, win32")
    return module_name


def binary_path() -> str:
    """Return the absolute path of the Selenium Manager binary for this platform.

    `SE_MANAGER_PATH` wins when set, matching how every binding already lets
    users point at a manager they built or vendored themselves.

    Raises RuntimeError, not SystemExit, when the platform is unsupported or its
    package is missing, so a binding can catch it and fall back.
    """
    override = os.environ.get("SE_MANAGER_PATH")
    if override:
        return override

    module_name = _module_name(sys.platform, platform.machine())
    try:
        platform_module = importlib.import_module(module_name)
    except ImportError as exc:
        pkg_name = module_name.replace("_", "-")
        raise RuntimeError(f"Platform package {pkg_name} is not installed.\nRun: pip install {pkg_name}") from exc

    binary = platform_module.binary_path()
    _ensure_executable(binary)
    return binary


def _ensure_executable(binary: str) -> None:
    # Wheels do not carry the executable bit through every installer, so restore
    # it here rather than in main(): library callers run the path themselves.
    if os.name == "nt":
        return
    try:
        mode = os.stat(binary).st_mode
        if not mode & stat.S_IXUSR:
            os.chmod(binary, mode | 0o755)
    except OSError:
        # A read-only site-packages can't be repaired from here; running the
        # binary then fails with an error that names the path.
        pass


def main() -> None:
    try:
        binary = binary_path()
    except RuntimeError as exc:
        sys.exit(str(exc))
    # Installing the standalone package is not consent to usage stats, so they
    # are opt-in here: SE_AVOID_STATS=false (or se-config.toml) turns them on.
    env = {**os.environ}
    if not env.get("SE_AVOID_STATS"):
        env["SE_AVOID_STATS"] = "true"
    sys.exit(subprocess.run([binary, *sys.argv[1:]], env=env).returncode)
