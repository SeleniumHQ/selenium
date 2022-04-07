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


from selenium.common.exceptions import (
    ElementNotVisibleException,
    ElementNotInteractableException)
from selenium.webdriver.common.by import By


def test_should_allow_the_user_to_tell_if_an_element_is_displayed_or_not(driver, pages):
    pages.load("javascriptPage.html")

    assert driver.find_element(by=By.ID, value="displayed").is_displayed() is True
    assert driver.find_element(by=By.ID, value="none").is_displayed() is False
    assert driver.find_element(by=By.ID, value="suppressedParagraph").is_displayed() is False
    assert driver.find_element(by=By.ID, value="hidden").is_displayed() is False


def test_visibility_should_take_into_account_parent_visibility(driver, pages):
    pages.load("javascriptPage.html")

    childDiv = driver.find_element(by=By.ID, value="hiddenchild")
    hiddenLink = driver.find_element(by=By.ID, value="hiddenlink")

    assert childDiv.is_displayed() is False
    assert hiddenLink.is_displayed() is False


def test_should_count_elements_as_visible_if_style_property_has_been_set(driver, pages):
    pages.load("javascriptPage.html")
    shown = driver.find_element(by=By.ID, value="visibleSubElement")
    assert shown.is_displayed() is True


@pytest.mark.xfail_safari
def test_should_modify_the_visibility_of_an_element_dynamically(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="hideMe")
    assert element.is_displayed() is True
    element.click()
    assert element.is_displayed() is False


def test_hidden_input_elements_are_never_visible(driver, pages):
    pages.load("javascriptPage.html")

    shown = driver.find_element(by=By.NAME, value="hidden")

    assert shown.is_displayed() is False


def test_should_not_be_able_to_click_on_an_element_that_is_not_displayed(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="unclickable")
    try:
        element.click()
        assert 1 == 0, "should have thrown an exception"
    except (ElementNotVisibleException, ElementNotInteractableException):
        pass


def test_should_not_be_able_to_toggle_an_element_that_is_not_displayed(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="untogglable")
    try:
        element.click()
        assert 1 == 0, "should have thrown an exception"
    except (ElementNotVisibleException, ElementNotInteractableException):
        pass


def test_should_not_be_able_to_select_an_element_that_is_not_displayed(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="untogglable")
    try:
        element.click()
        assert 1 == 0, "should have thrown an exception"
    except (ElementNotVisibleException, ElementNotInteractableException):
        pass


def test_should_not_be_able_to_type_an_element_that_is_not_displayed(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="unclickable")
    try:
        element.send_keys("You don't see me")
        assert 1 == 0, "should have thrown an exception"
    except (ElementNotVisibleException, ElementNotInteractableException):
        pass
    assert element.get_attribute("value") != "You don't see me"


def test_should_say_elements_with_negative_transform_are_not_displayed(driver, pages):
    pages.load('cssTransform.html')
    elementX = driver.find_element(By.ID, value='parentX')
    assert elementX.is_displayed() is False
    elementY = driver.find_element(By.ID, value='parentY')
    assert elementY.is_displayed() is False


def test_should_say_elements_with_parent_with_negative_transform_are_not_displayed(driver, pages):
    pages.load('cssTransform.html')
    elementX = driver.find_element(By.ID, value='childX')
    assert elementX.is_displayed() is False
    elementY = driver.find_element(By.ID, value='childY')
    assert elementY.is_displayed() is False


def test_should_say_element_with_zero_transform_is_visible(driver, pages):
    pages.load('cssTransform.html')
    zero_tranform = driver.find_element(By.ID, 'zero-tranform')
    assert zero_tranform.is_displayed() is True


def test_should_say_element_is_visible_when_it_has_negative_transform_but_elementisnt_in_anegative_space(driver, pages):
    pages.load('cssTransform2.html')
    zero_tranform = driver.find_element(By.ID, 'negative-percentage-transformY')
    assert zero_tranform.is_displayed() is True


def test_should_show_element_not_visible_with_hidden_attribute(driver, pages):
    pages.load('hidden.html')
    singleHidden = driver.find_element(By.ID, 'singleHidden')
    assert singleHidden.is_displayed() is False


def test_should_show_element_not_visible_when_parent_element_has_hidden_attribute(driver, pages):
    pages.load('hidden.html')
    child = driver.find_element(By.ID, 'child')
    assert child.is_displayed() is False
