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
import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait


def performDragAndDropWithMouse(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("draggableLists.html")
    dragReporter = driver.find_element(By.ID, "dragging_reports")
    toDrag = driver.find_element(By.ID, "rightitem-3")
    dragInto = driver.find_element(By.ID, "sortable1")

    holdItem = ActionChains(driver).click_and_hold(toDrag)
    moveToSpecificItem = ActionChains(driver) \
        .move_to_element(driver.find_element(By.ID, "leftitem-4"))
    moveToOtherList = ActionChains(driver).move_to_element(dragInto)
    drop = ActionChains(driver).release(dragInto)
    assert "Nothing happened." == dragReporter.text

    holdItem.perform()
    moveToSpecificItem.perform()
    moveToOtherList.perform()
    assert "Nothing happened. DragOut" == dragReporter.text

    drop.perform()


@pytest.mark.xfail_safari
def testDraggingElementWithMouseMovesItToAnotherList(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    performDragAndDropWithMouse(driver, pages)
    dragInto = driver.find_element(By.ID, "sortable1")
    assert 6 == len(dragInto.find_elements(By.TAG_NAME, "li"))


@pytest.mark.xfail_safari
def testDraggingElementWithMouseFiresEvents(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    performDragAndDropWithMouse(driver, pages)
    dragReporter = driver.find_element(By.ID, "dragging_reports")
    assert "Nothing happened. DragOut DropIn RightItem 3" == dragReporter.text


def _isElementAvailable(driver, id):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    try:
        driver.find_element(By.ID, id)
        return True
    except Exception:
        return False


@pytest.mark.xfail_safari
def testDragAndDrop(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    element_available_timeout = 15
    wait = WebDriverWait(driver, element_available_timeout)
    pages.load("droppableItems.html")
    wait.until(lambda dr: _isElementAvailable(driver, "draggable"))

    if not _isElementAvailable(driver, "draggable"):
        raise AssertionError("Could not find draggable element after 15 seconds.")

    toDrag = driver.find_element(By.ID, "draggable")
    dropInto = driver.find_element(By.ID, "droppable")

    holdDrag = ActionChains(driver) \
        .click_and_hold(toDrag)
    move = ActionChains(driver) \
        .move_to_element(dropInto)
    drop = ActionChains(driver).release(dropInto)

    holdDrag.perform()
    move.perform()
    drop.perform()

    dropInto = driver.find_element(By.ID, "droppable")
    text = dropInto.find_element(By.TAG_NAME, "p").text
    assert "Dropped!" == text


@pytest.mark.xfail_safari
def testDoubleClick(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")
    toDoubleClick = driver.find_element(By.ID, "doubleClickField")

    dblClick = ActionChains(driver) \
        .double_click(toDoubleClick)

    dblClick.perform()
    assert "DoubleClicked" == toDoubleClick.get_attribute('value')


def testContextClick(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")
    toContextClick = driver.find_element(By.ID, "doubleClickField")

    contextClick = ActionChains(driver) \
        .context_click(toContextClick)

    contextClick.perform()
    assert "ContextClicked" == toContextClick.get_attribute('value')


def testMoveAndClick(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")
    toClick = driver.find_element(By.ID, "clickField")

    click = ActionChains(driver) \
        .move_to_element(toClick) \
        .click()

    click.perform()
    assert "Clicked" == toClick.get_attribute('value')


def testCannotMoveToANullLocator(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")

    with pytest.raises(AttributeError):
        move = ActionChains(driver) \
            .move_to_element(None)
        move.perform()


@pytest.mark.xfail_safari
def testClickingOnFormElements(driver, pages):
    """Copied from org.openqa.selenium.interactions.CombinedInputActionsTest."""
    pages.load("formSelectionPage.html")
    options = driver.find_elements(By.TAG_NAME, "option")
    selectThreeOptions = ActionChains(driver) \
        .click(options[1]) \
        .key_down(Keys.SHIFT) \
        .click(options[3]) \
        .key_up(Keys.SHIFT)
    selectThreeOptions.perform()

    showButton = driver.find_element(By.NAME, "showselected")
    showButton.click()

    resultElement = driver.find_element(By.ID, "result")
    assert "roquefort parmigiano cheddar" == resultElement.text


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
def testSelectingMultipleItems(driver, pages):
    """Copied from org.openqa.selenium.interactions.CombinedInputActionsTest."""
    pages.load("selectableItems.html")
    reportingElement = driver.find_element(By.ID, "infodiv")
    assert "no info" == reportingElement.text

    listItems = driver.find_elements(By.TAG_NAME, "li")
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


@pytest.mark.xfail_safari
def testSendingKeysToActiveElementWithModifier(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element(By.ID, "working")
    e.click()

    ActionChains(driver) \
        .key_down(Keys.SHIFT) \
        .send_keys("abc") \
        .key_up(Keys.SHIFT) \
        .perform()

    assert "ABC" == e.get_attribute('value')


def testSendingKeysToElement(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element(By.ID, "working")

    ActionChains(driver).send_keys_to_element(e, 'abc').perform()

    assert "abc" == e.get_attribute('value')


def testCanSendKeysBetweenClicks(driver, pages):
    """
    For W3C, ensures that the correct number of pauses are given to the other
    input device.
    """
    pages.load('javascriptPage.html')
    keyup = driver.find_element(By.ID, "keyUp")
    keydown = driver.find_element(By.ID, "keyDown")
    ActionChains(driver).click(keyup).send_keys('foobar').click(keydown).perform()

    assert 'foobar' == keyup.get_attribute('value')


def test_can_reset_interactions(driver, pages):
    actions = ActionChains(driver)
    actions.click()
    actions.key_down('A')
    if driver.w3c:
        assert all((len(device.actions) > 0 for device in actions.w3c_actions.devices))
    else:
        assert len(actions._actions) > 0

    actions.reset_actions()

    if driver.w3c:
        assert all((len(device.actions) == 0 for device in actions.w3c_actions.devices))
    else:
        assert len(actions._actions) == 0


def test_can_pause(driver, pages):
    from time import time
    pages.load("javascriptPage.html")

    pause_time = 2
    toClick = driver.find_element(By.ID, "clickField")
    toDoubleClick = driver.find_element(By.ID, "doubleClickField")

    pause = ActionChains(driver).click(toClick).pause(pause_time).click(toDoubleClick)

    start = time()
    pause.perform()
    end = time()

    assert pause_time < end - start
    assert "Clicked" == toClick.get_attribute('value')
    assert "Clicked" == toDoubleClick.get_attribute('value')
