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


def testShouldFireClickEventWhenClicking(driver, pages):
    pages.load("javascriptPage.html")
    _clickOnElementWhichRecordsEvents(driver)
    _assertEventFired(driver, "click")


def testShouldFireMouseDownEventWhenClicking(driver, pages):
    pages.load("javascriptPage.html")
    _clickOnElementWhichRecordsEvents(driver)
    _assertEventFired(driver, "mousedown")


def testShouldFireMouseUpEventWhenClicking(driver, pages):
    pages.load("javascriptPage.html")
    _clickOnElementWhichRecordsEvents(driver)
    _assertEventFired(driver, "mouseup")


def testShouldIssueMouseDownEvents(driver, pages):
    pages.load("javascriptPage.html")
    driver.find_element_by_id("mousedown").click()
    result = driver.find_element_by_id("result").text
    assert result == "mouse down"


def testShouldIssueClickEvents(driver, pages):
    pages.load("javascriptPage.html")
    driver.find_element_by_id("mouseclick").click()
    result = driver.find_element_by_id("result").text
    assert result == "mouse click"


def testShouldIssueMouseUpEvents(driver, pages):
    pages.load("javascriptPage.html")
    driver.find_element_by_id("mouseup").click()
    result = driver.find_element_by_id("result").text
    assert result == "mouse up"


def testMouseEventsShouldBubbleUpToContainingElements(driver, pages):
    pages.load("javascriptPage.html")
    driver.find_element_by_id("child").click()
    result = driver.find_element_by_id("result").text
    assert result == "mouse down"


def testShouldEmitOnChangeEventsWhenSelectingElements(driver, pages):
    pages.load("javascriptPage.html")
    select = driver.find_element_by_id('selector')
    options = select.find_elements_by_tag_name('option')
    initialTextValue = driver.find_element_by_id("result").text

    select.click()
    assert driver.find_element_by_id("result").text == initialTextValue
    options[1].click()
    assert driver.find_element_by_id("result").text == "bar"


def testShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox(driver, pages):
    pages.load("javascriptPage.html")
    checkbox = driver.find_element_by_id("checkbox")
    checkbox.click()
    assert driver.find_element_by_id("result").text == "checkbox thing"


def testShouldEmitClickEventWhenClickingOnATextInputElement(driver, pages):
    pages.load("javascriptPage.html")
    clicker = driver.find_element_by_id("clickField")
    clicker.click()

    assert clicker.get_attribute("value") == "Clicked"


def testClearingAnElementShouldCauseTheOnChangeHandlerToFire(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element_by_id("clearMe")
    element.clear()
    result = driver.find_element_by_id("result")
    assert result.text == "Cleared"

# TODO Currently Failing and needs fixing
# def testSendingKeysToAnotherElementShouldCauseTheBlurEventToFire(driver, pages):
#    pages.load("javascriptPage.html")
#    element = driver.find_element_by_id("theworks")
#    element.send_keys("foo")
#    element2 = driver.find_element_by_id("changeable")
#    element2.send_keys("bar")
#    _assertEventFired(driver, "blur")

# TODO Currently Failing and needs fixing
# def testSendingKeysToAnElementShouldCauseTheFocusEventToFire(driver, pages):
#    pages.load("javascriptPage.html")
#    element = driver.find_element_by_id("theworks")
#    element.send_keys("foo")
#    _assertEventFired(driver, "focus")


def _clickOnElementWhichRecordsEvents(driver):
    driver.find_element_by_id("plainButton").click()


def _assertEventFired(driver, eventName):
    result = driver.find_element_by_id("result")
    text = result.text
    assert eventName in text, "No " + eventName + " fired: " + text
