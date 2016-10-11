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
import sys

import pytest

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait


class TestAdvancedUserInteraction(object):

    def _before(self, driver):
        if driver.capabilities['browserName'] == 'firefox' and sys.platform == 'darwin':
            pytest.skip("native events not supported on Mac for Firefox")

    def performDragAndDropWithMouse(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        pages.load("draggableLists.html")
        dragReporter = driver.find_element_by_id("dragging_reports")
        toDrag = driver.find_element_by_id("rightitem-3")
        dragInto = driver.find_element_by_id("sortable1")

        holdItem = ActionChains(driver).click_and_hold(toDrag)
        moveToSpecificItem = ActionChains(driver) \
            .move_to_element(driver.find_element_by_id("leftitem-4"))
        moveToOtherList = ActionChains(driver).move_to_element(dragInto)
        drop = ActionChains(driver).release(dragInto)
        assert "Nothing happened." == dragReporter.text

        holdItem.perform()
        moveToSpecificItem.perform()
        moveToOtherList.perform()
        assert "Nothing happened. DragOut" == dragReporter.text

        drop.perform()

    def testDraggingElementWithMouseMovesItToAnotherList(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        self.performDragAndDropWithMouse(driver, pages)
        dragInto = driver.find_element_by_id("sortable1")
        assert 6 == len(dragInto.find_elements_by_tag_name("li"))

    def _testDraggingElementWithMouseFiresEvents(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface.
        Disabled since this test doesn't work with HTMLUNIT.
        """
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        self.performDragAndDropWithMouse(driver, pages)
        dragReporter = driver.find_element_by_id("dragging_reports")
        assert "Nothing happened. DragOut DropIn RightItem 3" == dragReporter.text

    def _isElementAvailable(self, driver, id):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        try:
            driver.find_element_by_id(id)
            return True
        except Exception:
            return False

    def testDragAndDrop(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        element_available_timeout = 15
        wait = WebDriverWait(self, element_available_timeout)
        pages.load("droppableItems.html")
        wait.until(lambda dr: dr._isElementAvailable(driver, "draggable"))

        if not self._isElementAvailable(driver, "draggable"):
            raise AssertionError("Could not find draggable element after 15 seconds.")

        toDrag = driver.find_element_by_id("draggable")
        dropInto = driver.find_element_by_id("droppable")

        holdDrag = ActionChains(driver) \
            .click_and_hold(toDrag)
        move = ActionChains(driver) \
            .move_to_element(dropInto)
        drop = ActionChains(driver).release(dropInto)

        holdDrag.perform()
        move.perform()
        drop.perform()

        dropInto = driver.find_element_by_id("droppable")
        text = dropInto.find_element_by_tag_name("p").text
        assert "Dropped!" == text

    def testDoubleClick(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        pages.load("javascriptPage.html")
        toDoubleClick = driver.find_element_by_id("doubleClickField")

        dblClick = ActionChains(driver) \
            .double_click(toDoubleClick)

        dblClick.perform()
        assert "DoubleClicked" == toDoubleClick.get_attribute('value')

    def testContextClick(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        pages.load("javascriptPage.html")
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver has an issue here")
        toContextClick = driver.find_element_by_id("doubleClickField")

        contextClick = ActionChains(driver) \
            .context_click(toContextClick)

        contextClick.perform()
        assert "ContextClicked" == toContextClick.get_attribute('value')

    def testMoveAndClick(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        pages.load("javascriptPage.html")
        toClick = driver.find_element_by_id("clickField")

        click = ActionChains(driver) \
            .move_to_element(toClick) \
            .click()

        click.perform()
        assert "Clicked" == toClick.get_attribute('value')

    @pytest.mark.ignore_chrome
    def testCannotMoveToANullLocator(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        pages.load("javascriptPage.html")

        with pytest.raises(AttributeError):
            move = ActionChains(driver) \
                .move_to_element(None)
            move.perform()

    def _testClickingOnFormElements(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.CombinedInputActionsTest.
        Disabled since this test doesn't work with HTMLUNIT.
        """
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        pages.load("formSelectionPage.html")
        options = driver.find_elements_by_tag_name("option")
        selectThreeOptions = ActionChains(driver) \
            .click(options[1]) \
            .key_down(Keys.SHIFT) \
            .click(options[2]) \
            .click(options[3]) \
            .key_up(Keys.SHIFT)
        selectThreeOptions.perform()

        showButton = driver.find_element_by_name("showselected")
        showButton.click()

        resultElement = driver.find_element_by_id("result")
        assert "roquefort parmigiano cheddar" == resultElement.text

    @pytest.mark.ignore_chrome
    def testSelectingMultipleItems(self, driver, pages):
        """Copied from org.openqa.selenium.interactions.CombinedInputActionsTest."""
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver does not seem to select all the elements")

        pages.load("selectableItems.html")
        reportingElement = driver.find_element_by_id("infodiv")
        assert "no info" == reportingElement.text

        listItems = driver.find_elements_by_tag_name("li")
        selectThreeItems = ActionChains(driver) \
            .key_down(Keys.CONTROL) \
            .click(listItems[1]) \
            .click(listItems[3]) \
            .click(listItems[5]) \
            .key_up(Keys.CONTROL)
        selectThreeItems.perform()

        assert "#item2 #item4 #item6" == reportingElement.text

        # Now click on another element, make sure that's the only one selected.
        actionsBuilder = ActionChains(driver)
        actionsBuilder.click(listItems[6]).perform()
        assert "#item7" == reportingElement.text

    @pytest.mark.ignore_chrome
    def testMovingMouseBackAndForthPastViewPort(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver does not seem to trigger the events")
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        self._before(driver)
        pages.load("veryLargeCanvas.html")

        firstTarget = driver.find_element_by_id("r1")
        ActionChains(driver) \
            .move_to_element(firstTarget) \
            .click() \
            .perform()
        resultArea = driver.find_element_by_id("result")
        expectedEvents = "First"
        wait = WebDriverWait(resultArea, 15)

        def expectedEventsFired(element):
            return element.text == expectedEvents

        wait.until(expectedEventsFired)

        # Move to element with id 'r2', at (2500, 50) to (2580, 100).
        ActionChains(driver) \
            .move_by_offset(2540 - 150, 75 - 125) \
            .click() \
            .perform()

        expectedEvents += " Second"
        wait.until(expectedEventsFired)

        # Move to element with id 'r3' at (60, 1500) to (140, 1550).
        ActionChains(driver) \
            .move_by_offset(100 - 2540, 1525 - 75) \
            .click() \
            .perform()
        expectedEvents += " Third"
        wait.until(expectedEventsFired)

        # Move to element with id 'r4' at (220,180) to (320, 230).
        ActionChains(driver) \
            .move_by_offset(270 - 100, 205 - 1525) \
            .click() \
            .perform()
        expectedEvents += " Fourth"
        wait.until(expectedEventsFired)

    def testSendingKeysToActiveElementWithModifier(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Actions not available in Marionette. https://bugzilla.mozilla.org/show_bug.cgi?id=1292178")
        pages.load("formPage.html")
        e = driver.find_element_by_id("working")
        e.click()

        ActionChains(driver) \
            .key_down(Keys.SHIFT) \
            .send_keys("abc") \
            .key_up(Keys.SHIFT) \
            .perform()

        assert "ABC" == e.get_attribute('value')
