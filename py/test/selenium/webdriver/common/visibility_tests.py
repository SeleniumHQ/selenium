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

from selenium.common.exceptions import (
    ElementNotVisibleException,
    ElementNotInteractableException)
from selenium.webdriver.common.by import By


def testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot(driver, pages):
    pages.load("javascriptPage.html")

    assert driver.find_element(by=By.ID, value="displayed").is_displayed() is True
    assert driver.find_element(by=By.ID, value="none").is_displayed() is False
    assert driver.find_element(by=By.ID, value="suppressedParagraph").is_displayed() is False
    assert driver.find_element(by=By.ID, value="hidden").is_displayed() is False


def testVisibilityShouldTakeIntoAccountParentVisibility(driver, pages):
    pages.load("javascriptPage.html")

    childDiv = driver.find_element(by=By.ID, value="hiddenchild")
    hiddenLink = driver.find_element(by=By.ID, value="hiddenlink")

    assert childDiv.is_displayed() is False
    assert hiddenLink.is_displayed() is False


def testShouldCountElementsAsVisibleIfStylePropertyHasBeenSet(driver, pages):
    pages.load("javascriptPage.html")
    shown = driver.find_element(by=By.ID, value="visibleSubElement")
    assert shown.is_displayed() is True


def testShouldModifyTheVisibilityOfAnElementDynamically(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="hideMe")
    assert element.is_displayed() is True
    element.click()
    assert element.is_displayed() is False


def testHiddenInputElementsAreNeverVisible(driver, pages):
    pages.load("javascriptPage.html")

    shown = driver.find_element(by=By.NAME, value="hidden")

    assert shown.is_displayed() is False


def testShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="unclickable")
    try:
        element.click()
        assert 1 == 0, "should have thrown an exception"
    except (ElementNotVisibleException, ElementNotInteractableException):
        pass


def testShouldNotBeAbleToToggleAnElementThatIsNotDisplayed(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="untogglable")
    try:
        element.click()
        assert 1 == 0, "should have thrown an exception"
    except (ElementNotVisibleException, ElementNotInteractableException):
        pass


def testShouldNotBeAbleToSelectAnElementThatIsNotDisplayed(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="untogglable")
    try:
        element.click()
        assert 1 == 0, "should have thrown an exception"
    except (ElementNotVisibleException, ElementNotInteractableException):
        pass


def testShouldNotBeAbleToTypeAnElementThatIsNotDisplayed(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="unclickable")
    try:
        element.send_keys("You don't see me")
        assert 1 == 0, "should have thrown an exception"
    except (ElementNotVisibleException, ElementNotInteractableException):
        pass
    assert element.get_attribute("value") != "You don't see me"


def testShouldSayElementsWithNegativeTransformAreNotDisplayed(driver, pages):
    pages.load('cssTransform.html')
    elementX = driver.find_element(By.ID, value='parentX')
    assert elementX.is_displayed() is False
    elementY = driver.find_element(By.ID, value='parentY')
    assert elementY.is_displayed() is False


def testShouldSayElementsWithParentWithNegativeTransformAreNotDisplayed(driver, pages):
    pages.load('cssTransform.html')
    elementX = driver.find_element(By.ID, value='childX')
    assert elementX.is_displayed() is False
    elementY = driver.find_element(By.ID, value='childY')
    assert elementY.is_displayed() is False


def testShouldSayElementWithZeroTransformIsVisible(driver, pages):
    pages.load('cssTransform.html')
    zero_tranform = driver.find_element(By.ID, 'zero-tranform')
    assert zero_tranform.is_displayed() is True


def testShouldSayElementIsVisibleWhenItHasNegativeTransformButElementisntInANegativeSpace(driver, pages):
    pages.load('cssTransform2.html')
    zero_tranform = driver.find_element(By.ID, 'negative-percentage-transformY')
    assert zero_tranform.is_displayed() is True


def testShouldShowElementNotVisibleWithHiddenAttribute(driver, pages):
    pages.load('hidden.html')
    singleHidden = driver.find_element(By.ID, 'singleHidden')
    assert singleHidden.is_displayed() is False


def testShouldShowElementNotVisibleWhenParentElementHasHiddenAttribute(driver, pages):
    pages.load('hidden.html')
    child = driver.find_element(By.ID, 'child')
    assert child.is_displayed() is False
