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
import json
import sys
from pathlib import Path
from unittest import mock

import pytest

import selenium
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.selenium_manager import SeleniumManager


def test_gets_results(monkeypatch):
    expected_output = {"driver_path": "/path/to/driver"}
    lib_path = "selenium.webdriver.common.selenium_manager.SeleniumManager"

    with mock.patch(lib_path + "._get_binary", return_value="/path/to/sm") as mock_get_binary, mock.patch(
        lib_path + "._run", return_value=expected_output
    ) as mock_run:
        SeleniumManager().binary_paths([])

        mock_get_binary.assert_called_once()
        expected_run_args = ["/path/to/sm", "--language-binding", "python", "--output", "json"]
        mock_run.assert_called_once_with(expected_run_args)


def test_uses_environment_variable(monkeypatch):
    monkeypatch.setenv("SE_MANAGER_PATH", "/path/to/manager")
    monkeypatch.setattr(Path, "is_file", lambda _: True)

    binary = SeleniumManager()._get_binary()

    assert str(binary) == "/path/to/manager"


def test_uses_windows(monkeypatch):
    monkeypatch.setattr(sys, "platform", "win32")
    binary = SeleniumManager()._get_binary()

    project_root = Path(selenium.__file__).parent.parent
    assert binary == project_root.joinpath("selenium/webdriver/common/windows/selenium-manager.exe")


def test_uses_linux(monkeypatch):
    monkeypatch.setattr(sys, "platform", "linux")
    binary = SeleniumManager()._get_binary()

    project_root = Path(selenium.__file__).parent.parent
    assert binary == project_root.joinpath("selenium/webdriver/common/linux/selenium-manager")


def test_uses_mac(monkeypatch):
    monkeypatch.setattr(sys, "platform", "darwin")
    binary = SeleniumManager()._get_binary()

    project_root = Path(selenium.__file__).parent.parent
    assert binary == project_root.joinpath("selenium/webdriver/common/macos/selenium-manager")


def test_errors_if_not_file(monkeypatch):
    monkeypatch.setattr(Path, "is_file", lambda _: False)

    with pytest.raises(WebDriverException) as excinfo:
        SeleniumManager()._get_binary()
    assert "Unable to obtain working Selenium Manager binary" in str(excinfo.value)


def test_errors_if_invalid_os(monkeypatch):
    monkeypatch.setattr(sys, "platform", "linux")
    monkeypatch.setattr("platform.machine", lambda: "invalid")

    with pytest.raises(WebDriverException) as excinfo:
        SeleniumManager()._get_binary()
    assert "Unsupported platform/architecture combination" in str(excinfo.value)


def test_error_if_invalid_env_path(monkeypatch):
    monkeypatch.setenv("SE_MANAGER_PATH", "/path/to/manager")

    with pytest.raises(WebDriverException) as excinfo:
        SeleniumManager()._get_binary()
    assert "Unable to obtain working Selenium Manager binary; /path/to/manager" in str(excinfo.value)


def test_run_successful():
    expected_result = {"driver_path": "/path/to/driver", "browser_path": "/path/to/browser"}
    run_output = {"result": expected_result, "logs": []}
    with mock.patch("subprocess.run") as mock_run, mock.patch("json.loads", return_value=run_output):
        mock_run.return_value = mock.Mock(stdout=json.dumps(run_output).encode("utf-8"), stderr=b"", returncode=0)
        result = SeleniumManager._run(["arg1", "arg2"])
        assert result == expected_result


def test_run_exception():
    with mock.patch("subprocess.run", side_effect=Exception("Test Error")):
        with pytest.raises(WebDriverException) as excinfo:
            SeleniumManager._run(["/path/to/sm", "arg1", "arg2"])
    assert "Unsuccessful command executed: /path/to/sm arg1 arg2" in str(excinfo.value)


def test_run_non_zero_exit_code():
    with mock.patch("subprocess.run") as mock_run, mock.patch("json.loads", return_value={"result": "", "logs": []}):
        mock_run.return_value = mock.Mock(stdout=b"{}", stderr=b"Error Message", returncode=1)
        with pytest.raises(WebDriverException) as excinfo:
            SeleniumManager._run(["/path/to/sm", "arg1"])
    assert "Unsuccessful command executed: /path/to/sm arg1; code: 1\n\nError Message" in str(excinfo.value)
