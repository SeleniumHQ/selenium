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


from copy import deepcopy
from importlib import import_module

import pytest

from selenium.webdriver import DesiredCapabilities
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver


def test_converts_oss_capabilities_to_w3c(mocker):
    mock = mocker.patch('selenium.webdriver.remote.webdriver.WebDriver.execute')
    oss_caps = {'platform': 'WINDOWS', 'version': '11', 'acceptSslCerts': True}
    w3c_caps = {'platformName': 'windows', 'browserVersion': '11', 'acceptInsecureCerts': True}
    WebDriver(desired_capabilities=deepcopy(oss_caps))
    expected_params = {'capabilities': {'firstMatch': [{}], 'alwaysMatch': w3c_caps},
                       'desiredCapabilities': oss_caps}
    mock.assert_called_with(Command.NEW_SESSION, expected_params)


def test_converts_proxy_type_value_to_lowercase_for_w3c(mocker):
    mock = mocker.patch('selenium.webdriver.remote.webdriver.WebDriver.execute')
    oss_caps = {'proxy': {'proxyType': 'MANUAL', 'httpProxy': 'foo'}}
    w3c_caps = {'proxy': {'proxyType': 'manual', 'httpProxy': 'foo'}}
    WebDriver(desired_capabilities=deepcopy(oss_caps))
    expected_params = {'capabilities': {'firstMatch': [{}], 'alwaysMatch': w3c_caps},
                       'desiredCapabilities': oss_caps}
    mock.assert_called_with(Command.NEW_SESSION, expected_params)


def test_works_as_context_manager(mocker):
    mocker.patch('selenium.webdriver.remote.webdriver.WebDriver.execute')
    quit_ = mocker.patch('selenium.webdriver.remote.webdriver.WebDriver.quit')

    with WebDriver() as driver:
        assert isinstance(driver, WebDriver)

    assert quit_.call_count == 1


@pytest.mark.parametrize('browser_name', ['firefox', 'chrome', 'ie', 'opera'])
def test_accepts_firefox_options_to_remote_driver(mocker, browser_name):
    options = import_module('selenium.webdriver.{}.options'.format(browser_name))
    caps_name = browser_name.upper() if browser_name != 'ie' else 'INTERNETEXPLORER'
    mock = mocker.patch('selenium.webdriver.remote.webdriver.WebDriver.start_session')

    opts = options.Options()
    opts.add_argument('foo')
    expected_caps = getattr(DesiredCapabilities, caps_name)
    caps = expected_caps.copy()
    expected_caps.update(opts.to_capabilities())

    WebDriver(desired_capabilities=caps, options=opts)
    mock.assert_called_with(expected_caps, None)
