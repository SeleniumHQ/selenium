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
