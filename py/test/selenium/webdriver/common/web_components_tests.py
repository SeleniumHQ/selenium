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

from selenium.common.exceptions import NoSuchShadowRootException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.shadowroot import ShadowRoot
from selenium.webdriver.remote.webelement import WebElement


@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_can_get_the_shadow_root_of_an_element(driver, pages):
    pages.load("webComponents.html")
    shadow_root = driver.find_element(By.CSS_SELECTOR, "custom-checkbox-element").shadow_root
    assert isinstance(shadow_root, ShadowRoot)


@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_no_such_shadow_root_thrown_when_no_shadow_root(driver, pages):
    with pytest.raises(NoSuchShadowRootException):
        pages.load("simpleTest.html")
        driver.find_element(By.CSS_SELECTOR, "div").shadow_root


@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_returns_shadow_root_via_execute_script(driver, pages):
    pages.load("webComponents.html")
    custom_element = driver.find_element(By.CSS_SELECTOR, "custom-checkbox-element")
    shadow_root = custom_element.shadow_root
    execute_shadow_root = driver.execute_script("return arguments[0].shadowRoot", custom_element)
    assert shadow_root == execute_shadow_root


@pytest.mark.xfail_safari
@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_find_element_in_a_shadowroot(driver, pages):
    pages.load("webComponents.html")
    custom_element = driver.find_element(By.CSS_SELECTOR, "custom-checkbox-element")
    shadow_root = custom_element.shadow_root
    element = shadow_root.find_element(By.CSS_SELECTOR, "input")

    assert isinstance(element, WebElement)


@pytest.mark.xfail_safari
@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_find_elements_in_a_shadow_root(driver, pages):
    pages.load("webComponents.html")
    custom_element = driver.find_element(By.CSS_SELECTOR, "custom-checkbox-element")
    shadow_root = custom_element.shadow_root
    elements = shadow_root.find_elements(By.CSS_SELECTOR, "input")
    assert len(elements) == 1

    assert isinstance(elements[0], WebElement)
