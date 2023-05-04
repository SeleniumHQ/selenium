#  Licensed to the Software Freedom Conservancy (SFC) under one
#  or more contributor license agreements.  See the NOTICE file
#  distributed with this work for additional information
#  regarding copyright ownership.  The SFC licenses this file
#  to you under the Apache License, Version 2.0 (the
#  "License"); you may not use this file except in compliance
#  with the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.

from unittest.mock import Mock

import pytest

from selenium.common.exceptions import SeleniumManagerException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.selenium_manager import SeleniumManager


def test_browser_version_is_used_for_sm(mocker):
    import subprocess

    mock_run = mocker.patch("subprocess.run")
    mocked_result = Mock()
    mocked_result.configure_mock(
        **{"stdout.decode.return_value": '{"result": {"message": "driver"}, "logs": []}', "returncode": 0}
    )
    mock_run.return_value = mocked_result
    options = Options()
    options.capabilities["browserName"] = "chrome"
    options.browser_version = 110

    _ = SeleniumManager().driver_location(options)
    args, kwargs = subprocess.run.call_args
    assert "--browser-version" in args[0]
    assert "110" in args[0]


def test_browser_path_is_used_for_sm(mocker):
    import subprocess

    mock_run = mocker.patch("subprocess.run")
    mocked_result = Mock()
    mocked_result.configure_mock(
        **{"stdout.decode.return_value": '{"result": {"message": "driver"}, "logs": []}', "returncode": 0}
    )
    mock_run.return_value = mocked_result
    options = Options()
    options.capabilities["browserName"] = "chrome"
    options.binary_location = "/opt/bin/browser-bin"

    _ = SeleniumManager().driver_location(options)
    args, kwargs = subprocess.run.call_args
    assert "--browser-path" in args[0]
    assert "/opt/bin/browser-bin" in args[0]


def test_stderr_is_propagated_to_exception_messages():
    msg = r"Selenium Manager failed for:.* --browser foo --output json\.\nInvalid browser name: foo\n"
    with pytest.raises(SeleniumManagerException, match=msg):
        manager = SeleniumManager()
        binary = manager.get_binary()
        _ = manager.run([str(binary), "--browser", "foo", "--output", "json"])
