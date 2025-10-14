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
from selenium.webdriver.remote.locator_converter import LocatorConverter


class CustomLocatorConverter(LocatorConverter):
    def convert(self, by, value):
        # Custom conversion logic
        if by == "custom":
            return "css selector", f'[custom-attr="{value}"]'
        return super().convert(by, value)


@pytest.fixture()
def custom_locator_driver(firefox_options):
    driver = webdriver.Remote(options=firefox_options, locator_converter=CustomLocatorConverter())
    yield driver
    driver.quit()


def test_find_element_with_custom_locator(custom_locator_driver):
    custom_locator_driver.get("data:text/html,<div custom-attr='example'>Test</div>")
    element = custom_locator_driver.find_element("custom", "example")
    assert element is not None
    assert element.text == "Test"


def test_find_elements_with_custom_locator(custom_locator_driver):
    custom_locator_driver.get(
        "data:text/html,<div custom-attr='example'>Test1</div><div custom-attr='example'>Test2</div>"
    )
    elements = custom_locator_driver.find_elements("custom", "example")
    assert len(elements) == 2
    assert elements[0].text == "Test1"
    assert elements[1].text == "Test2"
