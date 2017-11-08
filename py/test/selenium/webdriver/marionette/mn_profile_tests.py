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

import os

import pytest

from selenium.webdriver import FirefoxProfile
from selenium.webdriver.firefox.options import Options


@pytest.fixture(params=['capabilities', 'firefox_profile', 'options'])
def driver_kwargs(request, driver_kwargs, profile):
    if request.param == 'capabilities':
        options = {'profile': profile}
        driver_kwargs[request.param].setdefault('moz:firefoxOptions', options)
    elif request.param == 'firefox_profile':
        driver_kwargs[request.param] = profile
    elif request.param == 'options':
        options = Options()
        options.profile = profile
        driver_kwargs[request.param] = options
    driver_kwargs['firefox_profile'] = profile
    return driver_kwargs


@pytest.fixture
def profile():
    profile = FirefoxProfile()
    profile.set_preference('browser.startup.homepage_override.mstone', '')
    profile.set_preference('startup.homepage_welcome_url', 'about:')
    profile.update_preferences()
    return profile


def test_profile_is_used(driver):
    assert 'about:' == driver.current_url


def test_profile_is_deleted(driver, profile):
    assert os.path.exists(profile.path)
    driver.quit()
    assert not os.path.exists(profile.path)
