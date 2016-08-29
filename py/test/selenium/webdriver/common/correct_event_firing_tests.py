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

import unittest


def not_available_on_remote(func):
    def testMethod(self):
        print(self.driver)
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod


class CorrectEventFiringTests(unittest.TestCase):

    def testShouldFireClickEventWhenClicking(self):
        self._loadPage("javascriptPage")
        self._clickOnElementWhichRecordsEvents()
        self._assertEventFired("click")

    def testShouldFireMouseDownEventWhenClicking(self):
        self._loadPage("javascriptPage")
        self._clickOnElementWhichRecordsEvents()
        self._assertEventFired("mousedown")

    def testShouldFireMouseUpEventWhenClicking(self):
        self._loadPage("javascriptPage")
        self._clickOnElementWhichRecordsEvents()
        self._assertEventFired("mouseup")

    def testShouldIssueMouseDownEvents(self):
        self._loadPage("javascriptPage")
        self.driver.find_element_by_id("mousedown").click()
        result = self.driver.find_element_by_id("result").text
        self.assertEqual(result, "mouse down")

    def testShouldIssueClickEvents(self):
        self._loadPage("javascriptPage")
        self.driver.find_element_by_id("mouseclick").click()
        result = self.driver.find_element_by_id("result").text
        self.assertEqual(result, "mouse click")

    def testShouldIssueMouseUpEvents(self):
        self._loadPage("javascriptPage")
        self.driver.find_element_by_id("mouseup").click()
        result = self.driver.find_element_by_id("result").text
        self.assertEqual(result, "mouse up")

    def testMouseEventsShouldBubbleUpToContainingElements(self):
        self._loadPage("javascriptPage")
        self.driver.find_element_by_id("child").click()
        result = self.driver.find_element_by_id("result").text
        self.assertEqual(result, "mouse down")

    def testShouldEmitOnChangeEventsWhenSelectingElements(self):
        self._loadPage("javascriptPage")
        # Intentionally not looking up the select tag.  See selenium r7937 for details.
        allOptions = self.driver.find_elements_by_xpath("//select[@id='selector']//option")
        initialTextValue = self.driver.find_element_by_id("result").text

        foo = allOptions[0]
        bar = allOptions[1]

        foo.click()
        self.assertEqual(self.driver.find_element_by_id("result").text, initialTextValue)
        bar.click()
        self.assertEqual(self.driver.find_element_by_id("result").text, "bar")

    def testShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox(self):
        self._loadPage("javascriptPage")
        checkbox = self.driver.find_element_by_id("checkbox")
        checkbox.click()
        self.assertEqual(self.driver.find_element_by_id("result").text, "checkbox thing")

    def testShouldEmitClickEventWhenClickingOnATextInputElement(self):
        self._loadPage("javascriptPage")
        clicker = self.driver.find_element_by_id("clickField")
        clicker.click()

        self.assertEqual(clicker.get_attribute("value"), "Clicked")

    def testClearingAnElementShouldCauseTheOnChangeHandlerToFire(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element_by_id("clearMe")
        element.clear()
        result = self.driver.find_element_by_id("result")
        self.assertEqual(result.text, "Cleared")

    # TODO Currently Failing and needs fixing
    # def testSendingKeysToAnotherElementShouldCauseTheBlurEventToFire(self):
    #    self._loadPage("javascriptPage")
    #    element = self.driver.find_element_by_id("theworks")
    #    element.send_keys("foo")
    #    element2 = self.driver.find_element_by_id("changeable")
    #    element2.send_keys("bar")
    #    self._assertEventFired("blur")

    # TODO Currently Failing and needs fixing
    # def testSendingKeysToAnElementShouldCauseTheFocusEventToFire(self):
    #    self._loadPage("javascriptPage")
    #    element = self.driver.find_element_by_id("theworks")
    #    element.send_keys("foo")
    #    self._assertEventFired("focus")

    def _clickOnElementWhichRecordsEvents(self):
        self.driver.find_element_by_id("plainButton").click()

    def _assertEventFired(self, eventName):
        result = self.driver.find_element_by_id("result")
        text = result.text
        self.assertTrue(eventName in text, "No " + eventName + " fired: " + text)

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
