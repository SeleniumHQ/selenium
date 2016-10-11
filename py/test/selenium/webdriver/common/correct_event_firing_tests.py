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


class TestEventFiring(object):

    def testShouldFireClickEventWhenClicking(self, driver, pages):
        pages.load("javascriptPage.html")
        self._clickOnElementWhichRecordsEvents(driver)
        self._assertEventFired(driver, "click")

    def testShouldFireMouseDownEventWhenClicking(self, driver, pages):
        pages.load("javascriptPage.html")
        self._clickOnElementWhichRecordsEvents(driver)
        self._assertEventFired(driver, "mousedown")

    def testShouldFireMouseUpEventWhenClicking(self, driver, pages):
        pages.load("javascriptPage.html")
        self._clickOnElementWhichRecordsEvents(driver)
        self._assertEventFired(driver, "mouseup")

    def testShouldIssueMouseDownEvents(self, driver, pages):
        pages.load("javascriptPage.html")
        driver.find_element_by_id("mousedown").click()
        result = driver.find_element_by_id("result").text
        assert result == "mouse down"

    def testShouldIssueClickEvents(self, driver, pages):
        pages.load("javascriptPage.html")
        driver.find_element_by_id("mouseclick").click()
        result = driver.find_element_by_id("result").text
        assert result == "mouse click"

    def testShouldIssueMouseUpEvents(self, driver, pages):
        pages.load("javascriptPage.html")
        driver.find_element_by_id("mouseup").click()
        result = driver.find_element_by_id("result").text
        assert result == "mouse up"

    def testMouseEventsShouldBubbleUpToContainingElements(self, driver, pages):
        pages.load("javascriptPage.html")
        driver.find_element_by_id("child").click()
        result = driver.find_element_by_id("result").text
        assert result == "mouse down"

    def testShouldEmitOnChangeEventsWhenSelectingElements(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c == True:
            pytest.xfail("Marionette Issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1309240")
        pages.load("javascriptPage.html")
        # Intentionally not looking up the select tag.  See selenium r7937 for details.
        allOptions = driver.find_elements_by_xpath("//select[@id='selector']//option")
        initialTextValue = driver.find_element_by_id("result").text

        foo = allOptions[0]
        bar = allOptions[1]

        foo.click()
        assert driver.find_element_by_id("result").text == initialTextValue
        bar.click()
        assert driver.find_element_by_id("result").text == "bar"

    def testShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox(self, driver, pages):
        pages.load("javascriptPage.html")
        checkbox = driver.find_element_by_id("checkbox")
        checkbox.click()
        assert driver.find_element_by_id("result").text == "checkbox thing"

    def testShouldEmitClickEventWhenClickingOnATextInputElement(self, driver, pages):
        pages.load("javascriptPage.html")
        clicker = driver.find_element_by_id("clickField")
        clicker.click()

        assert clicker.get_attribute("value") == "Clicked"

    def testClearingAnElementShouldCauseTheOnChangeHandlerToFire(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element_by_id("clearMe")
        element.clear()
        result = driver.find_element_by_id("result")
        assert result.text == "Cleared"

    # TODO Currently Failing and needs fixing
    # def testSendingKeysToAnotherElementShouldCauseTheBlurEventToFire(self, driver, pages):
    #    pages.load("javascriptPage.html")
    #    element = driver.find_element_by_id("theworks")
    #    element.send_keys("foo")
    #    element2 = driver.find_element_by_id("changeable")
    #    element2.send_keys("bar")
    #    self._assertEventFired(driver, "blur")

    # TODO Currently Failing and needs fixing
    # def testSendingKeysToAnElementShouldCauseTheFocusEventToFire(self, driver, pages):
    #    pages.load("javascriptPage.html")
    #    element = driver.find_element_by_id("theworks")
    #    element.send_keys("foo")
    #    self._assertEventFired(driver, "focus")

    def _clickOnElementWhichRecordsEvents(self, driver):
        driver.find_element_by_id("plainButton").click()

    def _assertEventFired(self, driver, eventName):
        result = driver.find_element_by_id("result")
        text = result.text
        assert eventName in text, "No " + eventName + " fired: " + text
