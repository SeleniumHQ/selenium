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


@pytest.mark.xfail_safari
def testShouldFireClickEventWhenClicking(driver, pages):
    pages.load("javascriptPage.html")
    _clickOnElementWhichRecordsEvents(driver)
    _assertEventFired(driver, "click")


@pytest.mark.xfail_safari
def testShouldFireMouseDownEventWhenClicking(driver, pages):
    pages.load("javascriptPage.html")
    _clickOnElementWhichRecordsEvents(driver)
    _assertEventFired(driver, "mousedown")


@pytest.mark.xfail_safari
def testShouldFireMouseUpEventWhenClicking(driver, pages):
    pages.load("javascriptPage.html")
    _clickOnElementWhichRecordsEvents(driver)
    _assertEventFired(driver, "mouseup")


@pytest.mark.xfail_safari
def testShouldIssueMouseDownEvents(driver, pages):
    pages.load("javascriptPage.html")
    driver.find_element(By.ID, "mousedown").click()
    result = driver.find_element(By.ID, "result").text
    assert result == "mouse down"


@pytest.mark.xfail_safari
def testShouldIssueClickEvents(driver, pages):
    pages.load("javascriptPage.html")
    driver.find_element(By.ID, "mouseclick").click()
    result = driver.find_element(By.ID, "result").text
    assert result == "mouse click"


@pytest.mark.xfail_safari
def testShouldIssueMouseUpEvents(driver, pages):
    pages.load("javascriptPage.html")
    driver.find_element(By.ID, "mouseup").click()
    result = driver.find_element(By.ID, "result").text
    assert result == "mouse up"


@pytest.mark.xfail_safari
def testMouseEventsShouldBubbleUpToContainingElements(driver, pages):
    pages.load("javascriptPage.html")
    driver.find_element(By.ID, "child").click()
    result = driver.find_element(By.ID, "result").text
    assert result == "mouse down"


@pytest.mark.xfail_safari
def testShouldEmitOnChangeEventsWhenSelectingElements(driver, pages):
    pages.load("javascriptPage.html")
    select = driver.find_element(By.ID, 'selector')
    options = select.find_elements(By.TAG_NAME, 'option')
    initialTextValue = driver.find_element(By.ID, "result").text

    select.click()
    assert driver.find_element(By.ID, "result").text == initialTextValue
    options[1].click()
    assert driver.find_element(By.ID, "result").text == "bar"


@pytest.mark.xfail_safari
def testShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox(driver, pages):
    pages.load("javascriptPage.html")
    checkbox = driver.find_element(By.ID, "checkbox")
    checkbox.click()
    assert driver.find_element(By.ID, "result").text == "checkbox thing"


def testShouldEmitClickEventWhenClickingOnATextInputElement(driver, pages):
    pages.load("javascriptPage.html")
    clicker = driver.find_element(By.ID, "clickField")
    clicker.click()

    assert clicker.get_attribute("value") == "Clicked"


@pytest.mark.xfail_safari
def testClearingAnElementShouldCauseTheOnChangeHandlerToFire(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(By.ID, "clearMe")
    element.clear()
    result = driver.find_element(By.ID, "result")
    assert result.text == "Cleared"

# TODO Currently Failing and needs fixing
# def testSendingKeysToAnotherElementShouldCauseTheBlurEventToFire(driver, pages):
#    pages.load("javascriptPage.html")
#    element = driver.find_element(By.ID, "theworks")
#    element.send_keys("foo")
#    element2 = driver.find_element(By.ID, "changeable")
#    element2.send_keys("bar")
#    _assertEventFired(driver, "blur")

# TODO Currently Failing and needs fixing
# def testSendingKeysToAnElementShouldCauseTheFocusEventToFire(driver, pages):
#    pages.load("javascriptPage.html")
#    element = driver.find_element(By.ID, "theworks")
#    element.send_keys("foo")
#    _assertEventFired(driver, "focus")


def _clickOnElementWhichRecordsEvents(driver):
    driver.find_element(By.ID, "plainButton").click()


def _assertEventFired(driver, eventName):
    result = driver.find_element(By.ID, "result")
    text = result.text
    assert eventName in text, "No " + eventName + " fired: " + text
