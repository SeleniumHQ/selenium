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

"""Tests for advanced user interactions."""
import unittest
import pytest
import sys
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait


class AdvancedUserInteractionTest(unittest.TestCase):

    def _before(self):
        if self.driver.capabilities['browserName'] == 'firefox' and sys.platform == 'darwin':
            pytest.skip("native events not supported on Mac for Firefox")

    def performDragAndDropWithMouse(self):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        # self._before()
        self._loadPage("draggableLists")
        dragReporter = self.driver.find_element_by_id("dragging_reports")
        toDrag = self.driver.find_element_by_id("rightitem-3")
        dragInto = self.driver.find_element_by_id("sortable1")

        holdItem = ActionChains(self.driver).click_and_hold(toDrag)
        moveToSpecificItem = ActionChains(self.driver) \
            .move_to_element(self.driver.find_element_by_id("leftitem-4"))
        moveToOtherList = ActionChains(self.driver).move_to_element(dragInto)
        drop = ActionChains(self.driver).release(dragInto)
        self.assertEqual("Nothing happened.", dragReporter.text)

        holdItem.perform()
        moveToSpecificItem.perform()
        moveToOtherList.perform()
        self.assertEqual("Nothing happened. DragOut", dragReporter.text)

        drop.perform()

    def testDraggingElementWithMouseMovesItToAnotherList(self):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        self.performDragAndDropWithMouse()
        dragInto = self.driver.find_element_by_id("sortable1")
        self.assertEqual(6, len(dragInto.find_elements_by_tag_name("li")))

    def _testDraggingElementWithMouseFiresEvents(self):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface.
        Disabled since this test doesn't work with HTMLUNIT.
        """
        self.performDragAndDropWithMouse()
        dragReporter = self.driver.find_element_by_id("dragging_reports")
        self.assertEqual("Nothing happened. DragOut DropIn RightItem 3", dragReporter.text)

    def _isElementAvailable(self, id):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        try:
            self.driver.find_element_by_id(id)
            return True
        except:
            return False

    def testDragAndDrop(self):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        element_available_timeout = 15
        wait = WebDriverWait(self, element_available_timeout)
        self._loadPage("droppableItems")
        wait.until(lambda dr: dr._isElementAvailable("draggable"))

        if not self._isElementAvailable("draggable"):
            raise "Could not find draggable element after 15 seconds."

        toDrag = self.driver.find_element_by_id("draggable")
        dropInto = self.driver.find_element_by_id("droppable")

        holdDrag = ActionChains(self.driver) \
            .click_and_hold(toDrag)
        move = ActionChains(self.driver) \
            .move_to_element(dropInto)
        drop = ActionChains(self.driver).release(dropInto)

        holdDrag.perform()
        move.perform()
        drop.perform()

        dropInto = self.driver.find_element_by_id("droppable")
        text = dropInto.find_element_by_tag_name("p").text
        self.assertEqual("Dropped!", text)

    def testDoubleClick(self):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        self._loadPage("javascriptPage")
        toDoubleClick = self.driver.find_element_by_id("doubleClickField")

        dblClick = ActionChains(self.driver) \
            .double_click(toDoubleClick)

        dblClick.perform()
        self.assertEqual("DoubleClicked", toDoubleClick.get_attribute('value'))

    def testContextClick(self):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        self._loadPage("javascriptPage")
        if self.driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver has an issue here")
        toContextClick = self.driver.find_element_by_id("doubleClickField")

        contextClick = ActionChains(self.driver) \
            .context_click(toContextClick)

        contextClick.perform()
        self.assertEqual("ContextClicked", toContextClick.get_attribute('value'))

    def testMoveAndClick(self):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        self._loadPage("javascriptPage")
        toClick = self.driver.find_element_by_id("clickField")

        click = ActionChains(self.driver) \
            .move_to_element(toClick) \
            .click()

        click.perform()
        self.assertEqual("Clicked", toClick.get_attribute('value'))

    @pytest.mark.ignore_chrome
    def testCannotMoveToANullLocator(self):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        self._loadPage("javascriptPage")

        try:
            move = ActionChains(self.driver) \
                .move_to_element(None)

            move.perform()
            self.fail("Shouldn't be allowed to click on null element.")
        except AttributeError:
            pass  # Expected.

    def _testClickingOnFormElements(self):
        """Copied from org.openqa.selenium.interactions.CombinedInputActionsTest.
        Disabled since this test doesn't work with HTMLUNIT.
        """
        self._loadPage("formSelectionPage")
        options = self.driver.find_elements_by_tag_name("option")
        selectThreeOptions = ActionChains(self.driver) \
            .click(options[1]) \
            .key_down(Keys.SHIFT) \
            .click(options[2]) \
            .click(options[3]) \
            .key_up(Keys.SHIFT)
        selectThreeOptions.perform()

        showButton = self.driver.find_element_by_name("showselected")
        showButton.click()

        resultElement = self.driver.find_element_by_id("result")
        self.assertEqual("roquefort parmigiano cheddar", resultElement.text)

    @pytest.mark.ignore_chrome
    def testSelectingMultipleItems(self):
        """Copied from org.openqa.selenium.interactions.CombinedInputActionsTest."""
        self._loadPage("selectableItems")
        if self.driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver does not seem to select all the elements")
        reportingElement = self.driver.find_element_by_id("infodiv")
        self.assertEqual("no info", reportingElement.text)

        listItems = self.driver.find_elements_by_tag_name("li")
        selectThreeItems = ActionChains(self.driver) \
            .key_down(Keys.CONTROL) \
            .click(listItems[1]) \
            .click(listItems[3]) \
            .click(listItems[5]) \
            .key_up(Keys.CONTROL)
        selectThreeItems.perform()

        self.assertEqual("#item2 #item4 #item6", reportingElement.text)

        # Now click on another element, make sure that's the only one selected.
        actionsBuilder = ActionChains(self.driver)
        actionsBuilder.click(listItems[6]).perform()
        self.assertEqual("#item7", reportingElement.text)

    @pytest.mark.ignore_chrome
    def testMovingMouseBackAndForthPastViewPort(self):
        if self.driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver does not seem to trigger the events")
        self._before()
        self._loadPage("veryLargeCanvas")

        firstTarget = self.driver.find_element_by_id("r1")
        ActionChains(self.driver) \
            .move_to_element(firstTarget) \
            .click() \
            .perform()
        resultArea = self.driver.find_element_by_id("result")
        expectedEvents = "First"
        wait = WebDriverWait(resultArea, 15)

        def expectedEventsFired(element):
            return element.text == expectedEvents

        wait.until(expectedEventsFired)

        # Move to element with id 'r2', at (2500, 50) to (2580, 100).
        ActionChains(self.driver) \
            .move_by_offset(2540 - 150, 75 - 125) \
            .click() \
            .perform()

        expectedEvents += " Second"
        wait.until(expectedEventsFired)

        # Move to element with id 'r3' at (60, 1500) to (140, 1550).
        ActionChains(self.driver) \
            .move_by_offset(100 - 2540, 1525 - 75) \
            .click() \
            .perform()
        expectedEvents += " Third"
        wait.until(expectedEventsFired)

        # Move to element with id 'r4' at (220,180) to (320, 230).
        ActionChains(self.driver) \
            .move_by_offset(270 - 100, 205 - 1525) \
            .click() \
            .perform()
        expectedEvents += " Fourth"
        wait.until(expectedEventsFired)

    def testSendingKeysToActiveElementWithModifier(self):
        self._loadPage("formPage")
        e = self.driver.find_element_by_id("working")
        e.click()

        ActionChains(self.driver) \
            .key_down(Keys.SHIFT) \
            .send_keys("abc") \
            .key_up(Keys.SHIFT) \
            .perform()

        self.assertEqual("ABC", e.get_attribute('value'))

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
