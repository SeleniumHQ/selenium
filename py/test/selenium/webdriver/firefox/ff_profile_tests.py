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
import os

import pytest

from selenium import webdriver
from selenium.webdriver import FirefoxProfile


def test_generates_profile(pages):
    profile = FirefoxProfile()
    profile.set_preference("browser.startup.page", 1)
    profile.set_preference("browser.startup.homepage", pages.url("simpleTest.html"))

    options = webdriver.FirefoxOptions()
    options.profile = profile
    with webdriver.Firefox(options=options) as driver:
        assert driver.current_url == pages.url("simpleTest.html")


def test_accepts_existing_profile(driver):
    # Use the profile from the first driver as an "existing profile"
    existing_profile = driver.capabilities["moz:profile"]
    existing_times = json.load(open(existing_profile + "/times.json"))

    options = webdriver.FirefoxOptions()
    options.profile = FirefoxProfile(existing_profile)

    with webdriver.Firefox(options=options) as driver:
        current_profile = driver.capabilities["moz:profile"]
        current_times = json.load(open(current_profile + "/times.json"))

        assert existing_times == current_times


def test_errors_missing_profile():
    with pytest.raises(FileNotFoundError):
        FirefoxProfile("/invalid/path")


def test_path():
    profile = FirefoxProfile()
    profile.update_preferences()
    assert os.path.isdir(profile.path)
