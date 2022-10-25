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

from selenium.webdriver.safari.options import Options


@pytest.fixture
def options():
    return Options()


def test_set_binary_location(options):
    options.binary_location = "/foo/bar"
    assert options._binary_location == "/foo/bar"


def test_get_binary_location(options):
    options._binary_location = "/foo/bar"
    assert options.binary_location == "/foo/bar"


def test_creates_capabilities(options):
    options._arguments = ["foo"]
    options._binary_location = "/bar"
    caps = options.to_capabilities()
    opts = caps.get(Options.KEY)
    assert opts
    assert "foo" in opts["args"]
    assert opts["binary"] == "/bar"


def test_starts_with_default_capabilities(options):
    from selenium.webdriver import DesiredCapabilities

    caps = DesiredCapabilities.SAFARI.copy()
    caps.update({"pageLoadStrategy": "normal"})
    assert options._caps == caps


def test_is_a_baseoptions(options):
    from selenium.webdriver.common.options import BaseOptions

    assert isinstance(options, BaseOptions)


def test_can_set_automatic_inspection(options):
    options.automatic_inspection = True
    assert options.automatic_inspection is True
    assert options._caps.get(Options.AUTOMATIC_INSPECTION) is True


def test_can_set_automatic_profiling(options):
    options.automatic_profiling = True
    assert options.automatic_profiling is True
    assert options._caps.get(Options.AUTOMATIC_PROFILING) is True


def test_setting_technology_preview_changes_browser_name(options):
    from selenium.webdriver import DesiredCapabilities

    BROWSER_NAME = "browserName"
    assert options._caps.get(BROWSER_NAME) == DesiredCapabilities.SAFARI[BROWSER_NAME]

    options.use_technology_preview = True
    assert options._caps.get(BROWSER_NAME) == options.SAFARI_TECH_PREVIEW

    options.use_technology_preview = False
    assert options._caps.get(BROWSER_NAME) == DesiredCapabilities.SAFARI[BROWSER_NAME]
