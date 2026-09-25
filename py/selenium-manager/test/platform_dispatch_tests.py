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

import platform
import sys

import pytest
from selenium_manager import _module_name, binary_path


def test_linux_dispatches_on_architecture():
    assert _module_name("linux", "x86_64") == "selenium_manager_linux_x86_64"
    assert _module_name("linux", "aarch64") == "selenium_manager_linux_aarch64"


@pytest.mark.parametrize("machine", ["x86_64", "arm64"])
def test_macos_is_universal(machine):
    assert _module_name("darwin", machine) == "selenium_manager_macos"


@pytest.mark.parametrize("machine", ["x86", "AMD64", "ARM64"])
def test_windows_binary_covers_every_architecture(machine):
    assert _module_name("win32", machine) == "selenium_manager_windows"


def test_unsupported_linux_architecture_lists_the_supported_ones():
    with pytest.raises(SystemExit) as excinfo:
        _module_name("linux", "riscv64")
    message = str(excinfo.value)
    assert "riscv64" in message
    assert "x86_64" in message
    assert "aarch64" in message


def test_unsupported_platform():
    with pytest.raises(SystemExit, match="freebsd14"):
        _module_name("freebsd14", "x86_64")


def test_module_names_match_their_distribution_names():
    # binary_path() turns the module name into the pip install hint by swapping
    # underscores for hyphens, so the two have to stay in step.
    expected = {
        "selenium_manager_linux_x86_64": "selenium-manager-linux-x86-64",
        "selenium_manager_linux_aarch64": "selenium-manager-linux-aarch64",
        "selenium_manager_macos": "selenium-manager-macos",
        "selenium_manager_windows": "selenium-manager-windows",
    }
    for module_name, distribution in expected.items():
        assert module_name.replace("_", "-") == distribution


def test_se_manager_path_overrides_the_platform_package(monkeypatch):
    monkeypatch.setenv("SE_MANAGER_PATH", "/opt/sm/selenium-manager")
    assert binary_path() == "/opt/sm/selenium-manager"


def test_empty_se_manager_path_is_ignored(monkeypatch):
    # An unset variable and one exported as empty should behave the same.
    monkeypatch.setenv("SE_MANAGER_PATH", "")
    with pytest.raises(SystemExit):
        binary_path()


def test_missing_platform_package_names_the_package_to_install(monkeypatch):
    # No platform package is a dependency of this test, so the import failure
    # here is the real one a user hits after a partial install.
    monkeypatch.delenv("SE_MANAGER_PATH", raising=False)
    with pytest.raises(SystemExit, match="pip install selenium-manager-"):
        binary_path()


def test_platform_package_supplies_the_path(tmp_path, monkeypatch):
    # Stand up a real platform package rather than patching the import, so what
    # is exercised here is the contract an installed wheel actually provides.
    module_name = _module_name(sys.platform, platform.machine())
    package = tmp_path / module_name
    package.mkdir()
    (package / "__init__.py").write_text('def binary_path():\n    return "/wheels/bin/selenium-manager"\n')

    monkeypatch.delenv("SE_MANAGER_PATH", raising=False)
    monkeypatch.syspath_prepend(str(tmp_path))
    monkeypatch.delitem(sys.modules, module_name, raising=False)

    try:
        assert binary_path() == "/wheels/bin/selenium-manager"
    finally:
        sys.modules.pop(module_name, None)
