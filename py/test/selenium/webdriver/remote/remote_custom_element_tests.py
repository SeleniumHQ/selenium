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

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement


# Custom element class
class MyCustomElement(WebElement):
    def custom_method(self):
        return "Custom element method"


@pytest.fixture()
def custom_element_driver(driver):
    try:
        driver._web_element_cls = MyCustomElement
        yield driver
    finally:
        driver._web_element_cls = WebElement


def test_find_element_with_custom_class(custom_element_driver, pages):
    """Test to ensure custom element class is used for a single element."""
    pages.load("simpleTest.html")
    element = custom_element_driver.find_element(By.TAG_NAME, "body")
    assert isinstance(element, MyCustomElement)
    assert element.custom_method() == "Custom element method"


def test_find_elements_with_custom_class(custom_element_driver, pages):
    """Test to ensure custom element class is used for multiple elements."""
    pages.load("simpleTest.html")
    elements = custom_element_driver.find_elements(By.TAG_NAME, "div")
    assert all(isinstance(el, MyCustomElement) for el in elements)
    assert all(el.custom_method() == "Custom element method" for el in elements)


def test_default_element_class(driver, pages):
    """Test to ensure default WebElement class is used."""
    pages.load("simpleTest.html")
    element = driver.find_element(By.TAG_NAME, "body")
    assert isinstance(element, WebElement)
    assert not hasattr(element, "custom_method")
