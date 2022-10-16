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

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait


def test_any_of_true(driver, pages):
    pages.load("simpleTest.html")
    WebDriverWait(driver, 0.1).until(EC.any_of(EC.title_is("Nope"), EC.title_is("Hello WebDriver")))


def test_any_of_false(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.1).until(EC.any_of(EC.title_is("Nope"), EC.title_is("Still Nope")))


def test_all_of_true(driver, pages):
    pages.load("simpleTest.html")
    results = WebDriverWait(driver, 0.1).until(
        EC.all_of(EC.title_is("Hello WebDriver"), EC.visibility_of_element_located((By.ID, "oneline")))
    )
    assert results[0] is True
    assert isinstance(results[1], WebElement)


def test_all_of_false(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.1).until(EC.all_of(EC.title_is("Nope"), EC.title_is("Still Nope")))


def test_none_of_true(driver, pages):
    pages.load("simpleTest.html")
    WebDriverWait(driver, 0.1).until(EC.none_of(EC.title_is("Nope"), EC.title_is("Still Nope")))


def test_none_of_false(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.1).until(EC.none_of(EC.title_is("Nope"), EC.title_is("Hello WebDriver")))


def test_clickable_locator_true(driver, pages):
    pages.load("simpleTest.html")
    WebDriverWait(driver, 0.1).until(EC.element_to_be_clickable((By.ID, "multilinelink")))


def test_clickable_locator_false(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(TimeoutException):
        # text element, should not be clickable
        WebDriverWait(driver, 0.1).until(EC.element_to_be_clickable((By.ID, "hiddenline")))


def test_clickable_element_true(driver, pages):
    pages.load("simpleTest.html")
    target = (By.ID, "multilinelink")
    element = driver.find_element(*target)  # grab element at locator
    WebDriverWait(driver, 0.1).until(EC.element_to_be_clickable(element))


def test_clickable_element_false(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(TimeoutException):
        target = (By.ID, "hiddenline")  # text, should not be clickable
        element = driver.find_element(*target)  # grab element at locator
        WebDriverWait(driver, 0.1).until(EC.element_to_be_clickable(element))


def test_text_to_be_present_in_element_attribute(driver, pages):
    pages.load("inputs.html")
    locator_test = (By.XPATH, "/html/body/form/input[1]")  # parameter is locator
    web_element_test = driver.find_element(*locator_test)  # parameter is WebElement
    WebDriverWait(driver, 0.1).until(
        EC.text_to_be_present_in_element_attribute(locator_test, "value", "input with no type")
    )
    WebDriverWait(driver, 0.1).until(
        EC.text_to_be_present_in_element_attribute(web_element_test, "value", "input with no type")
    )


def test_text_to_be_present_in_element(driver, pages):
    pages.load("simpleTest.html")
    locator_test = (By.XPATH, "/html/body/h1")  # parameter is locator
    web_element_test = driver.find_element(*locator_test)  # parameter is WebElement
    WebDriverWait(driver, 1).until(EC.text_to_be_present_in_element(locator_test, "Heading"))
    WebDriverWait(driver, 1).until(EC.text_to_be_present_in_element(web_element_test, "Heading"))


def test_text_to_be_present_in_element_value(driver, pages):
    pages.load("inputs.html")
    locator_test = (By.XPATH, "/html/body/form/input[1]")  # parameter is locator
    web_element_test = driver.find_element(*locator_test)  # parameter is WebElement
    WebDriverWait(driver, 0.1).until(EC.text_to_be_present_in_element_value(locator_test, "input with no type"))
    WebDriverWait(driver, 0.1).until(EC.text_to_be_present_in_element_value(web_element_test, "input with no type"))


def test_element_located_to_be_selected(driver, pages):
    pages.load("inputs.html")
    locator_test = (By.XPATH, "/html/body/form/input[10]")  # parameter is locator
    web_element_test = driver.find_element(*locator_test)  # parameter is WebElement
    WebDriverWait(driver, 0.1).until(EC.element_located_to_be_selected(locator_test))
    WebDriverWait(driver, 0.1).until(EC.element_located_to_be_selected(web_element_test))


def test_element_located_selection_state_to_be(driver, pages):
    pages.load("inputs.html")

    selected_locator_test = (By.XPATH, "/html/body/form/input[10]")  # parameter is locator
    selected_web_element_test = driver.find_element(*selected_locator_test)  # parameter is WebElement

    unselected_locator_test = (By.XPATH, "/html/body/form/input[12]")  # parameter is locator
    unselected_web_element_test = driver.find_element(*unselected_locator_test)  # parameter is WebElement

    WebDriverWait(driver, 0.1).until(EC.element_located_selection_state_to_be(selected_locator_test, True))
    WebDriverWait(driver, 0.1).until(EC.element_located_selection_state_to_be(selected_web_element_test, True))
    WebDriverWait(driver, 0.1).until(EC.element_located_selection_state_to_be(unselected_locator_test, False))
    WebDriverWait(driver, 0.1).until(EC.element_located_selection_state_to_be(unselected_web_element_test, False))


def test_element_attribute_to_include(driver, pages):
    pages.load("inputs.html")
    locator_test = (By.XPATH, "/html/body/form/input[13]")
    web_element_test = driver.find_element(*locator_test)
    WebDriverWait(driver, 0.1).until(EC.element_attribute_to_include(locator_test, "name"))
    WebDriverWait(driver, 0.1).until(EC.element_attribute_to_include(web_element_test, "type"))
