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

import pytest
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities


@pytest.fixture
def capabilities():
    capabilities = DesiredCapabilities.FIREFOX.copy()
    capabilities['marionette'] = False
    return capabilities


@pytest.fixture
def driver(options):
    driver = webdriver.Remote(options=options)
    yield driver
    driver.quit()


@pytest.fixture
def options():
    options = webdriver.FirefoxOptions()
    options.set_preference('browser.startup.homepage', 'about:')
    return options


def test_profile_is_used(driver):
    assert 'about:blank' == driver.current_url or 'about:' == driver.current_url
