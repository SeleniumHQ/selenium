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
from selenium.common.exceptions import MoveTargetOutOfBoundsException
from selenium.webdriver.common.actions.wheel_input import ScrollOrigin

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions import interaction
from selenium.webdriver.support.ui import WebDriverWait


def perform_drag_and_drop_with_mouse(driver, pages):
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
def test_dragging_element_with_mouse_moves_it_to_another_list(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    perform_drag_and_drop_with_mouse(driver, pages)
    dragInto = driver.find_element(By.ID, "sortable1")
    assert 6 == len(dragInto.find_elements(By.TAG_NAME, "li"))


@pytest.mark.xfail_safari
def test_dragging_element_with_mouse_fires_events(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    perform_drag_and_drop_with_mouse(driver, pages)
    dragReporter = driver.find_element(By.ID, "dragging_reports")
    assert "Nothing happened. DragOut DropIn RightItem 3" == dragReporter.text


def _is_element_available(driver, id):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    try:
        driver.find_element(By.ID, id)
        return True
    except Exception:
        return False


@pytest.mark.xfail_safari
def test_drag_and_drop(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    element_available_timeout = 15
    wait = WebDriverWait(driver, element_available_timeout)
    pages.load("droppableItems.html")
    wait.until(lambda dr: _is_element_available(driver, "draggable"))

    if not _is_element_available(driver, "draggable"):
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
def test_double_click(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")
    toDoubleClick = driver.find_element(By.ID, "doubleClickField")

    dblClick = ActionChains(driver) \
        .double_click(toDoubleClick)

    dblClick.perform()
    assert "DoubleClicked" == toDoubleClick.get_attribute('value')


def test_context_click(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")
    toContextClick = driver.find_element(By.ID, "doubleClickField")

    contextClick = ActionChains(driver) \
        .context_click(toContextClick)

    contextClick.perform()
    assert "ContextClicked" == toContextClick.get_attribute('value')


def test_move_and_click(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")
    toClick = driver.find_element(By.ID, "clickField")

    click = ActionChains(driver) \
        .move_to_element(toClick) \
        .click()

    click.perform()
    assert "Clicked" == toClick.get_attribute('value')


def test_cannot_move_to_anull_locator(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")

    with pytest.raises(AttributeError):
        move = ActionChains(driver) \
            .move_to_element(None)
        move.perform()


@pytest.mark.xfail_safari
def test_clicking_on_form_elements(driver, pages):
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
def test_selecting_multiple_items(driver, pages):
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
def test_sending_keys_to_active_element_with_modifier(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element(By.ID, "working")
    e.click()

    ActionChains(driver) \
        .key_down(Keys.SHIFT) \
        .send_keys("abc") \
        .key_up(Keys.SHIFT) \
        .perform()

    assert "ABC" == e.get_attribute('value')


def test_sending_keys_to_element(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element(By.ID, "working")

    ActionChains(driver).send_keys_to_element(e, 'abc').perform()

    assert "abc" == e.get_attribute('value')


def test_can_send_keys_between_clicks(driver, pages):
    """
    For W3C, ensures that the correct number of pauses are given to the other
    input device.
    """
    pages.load('javascriptPage.html')
    keyup = driver.find_element(By.ID, "keyUp")
    keydown = driver.find_element(By.ID, "keyDown")
    ActionChains(driver).click(keyup).send_keys('foobar').click(keydown).perform()

    assert 'foobar' == keyup.get_attribute('value')


def test_can_reset_interactions(driver):
    actions = ActionChains(driver)
    actions.click()
    actions.key_down('A')
    assert all(len(device.actions) > 0 for device in actions.w3c_actions.devices if device.type != interaction.WHEEL)

    actions.reset_actions()

    assert all(len(device.actions) == 0 for device in actions.w3c_actions.devices)


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


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_scroll_to_element(driver, pages):
    pages.load("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html")
    iframe = driver.find_element(By.TAG_NAME, "iframe")

    assert not _in_viewport(driver, iframe)

    ActionChains(driver).scroll_to_element(iframe).perform()

    assert _in_viewport(driver, iframe)


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_scroll_from_element_by_amount(driver, pages):
    pages.load("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html")
    iframe = driver.find_element(By.TAG_NAME, "iframe")
    scroll_origin = ScrollOrigin.from_element(iframe)

    ActionChains(driver).scroll_from_origin(scroll_origin, 0, 200).pause(0.2).perform()

    driver.switch_to.frame(iframe)
    checkbox = driver.find_element(By.NAME, "scroll_checkbox")
    assert _in_viewport(driver, checkbox)


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_scroll_from_element_with_offset_by_amount(driver, pages):
    pages.load("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html")
    footer = driver.find_element(By.TAG_NAME, "footer")
    scroll_origin = ScrollOrigin.from_element(footer, 0, -50)

    ActionChains(driver).scroll_from_origin(scroll_origin, 0, 200).pause(0.2).perform()

    iframe = driver.find_element(By.TAG_NAME, "iframe")
    driver.switch_to.frame(iframe)
    checkbox = driver.find_element(By.NAME, "scroll_checkbox")
    assert _in_viewport(driver, checkbox)


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_errors_when_element_offset_not_in_viewport(driver, pages):
    pages.load("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html")
    footer = driver.find_element(By.TAG_NAME, "footer")
    scroll_origin = ScrollOrigin.from_element(footer, 0, 50)

    with pytest.raises(MoveTargetOutOfBoundsException):
        ActionChains(driver).scroll_from_origin(scroll_origin, 0, 200).pause(0.2).perform()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_scroll_from_viewport_by_amount(driver, pages):
    pages.load("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html")
    footer = driver.find_element(By.TAG_NAME, "footer")
    delta_y = footer.rect['y']

    ActionChains(driver).scroll_by_amount(0, delta_y).pause(0.2).perform()

    assert _in_viewport(driver, footer)


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_scroll_from_viewport_with_offset_by_amount(driver, pages):
    pages.load("scrolling_tests/frame_with_nested_scrolling_frame.html")
    scroll_origin = ScrollOrigin.from_viewport(10, 10)

    ActionChains(driver).scroll_from_origin(scroll_origin, 0, 200).pause(0.2).perform()

    iframe = driver.find_element(By.TAG_NAME, "iframe")
    driver.switch_to.frame(iframe)
    checkbox = driver.find_element(By.NAME, "scroll_checkbox")
    assert _in_viewport(driver, checkbox)


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_errors_when_origin_offset_not_in_viewport(driver, pages):
    pages.load("scrolling_tests/frame_with_nested_scrolling_frame.html")
    scroll_origin = ScrollOrigin.from_viewport(-10, -10)

    with pytest.raises(MoveTargetOutOfBoundsException):
        ActionChains(driver).scroll_from_origin(scroll_origin, 0, 200).pause(0.2).perform()


def _get_events(driver):
    """Return list of key events recorded in the test_keys_page fixture."""
    events = driver.execute_script("return allEvents.events;") or []
    # `key` values in `allEvents` may be escaped (see `escapeSurrogateHalf` in
    # test_keys_wdspec.html), so this converts them back into unicode literals.
    for e in events:
        # example: turn "U+d83d" (6 chars) into u"\ud83d" (1 char)
        if "key" in e and e["key"].startswith("U+"):
            key = e["key"]
            hex_suffix = key[key.index("+") + 1:]
            e["key"] = chr(int(hex_suffix, 16))

        # WebKit sets code as 'Unidentified' for unidentified key codes, but
        # tests expect ''.
        if "code" in e and e["code"] == "Unidentified":
            e["code"] = ""
    return events


def _in_viewport(driver, element):
    script = (
        "for(var e=arguments[0],f=e.offsetTop,t=e.offsetLeft,o=e.offsetWidth,n=e.offsetHeight;\n"
        "e.offsetParent;)f+=(e=e.offsetParent).offsetTop,t+=e.offsetLeft;\n"
        "return f<window.pageYOffset+window.innerHeight&&t<window.pageXOffset+window.innerWidth&&f+n>\n"
        "window.pageYOffset&&t+o>window.pageXOffset"
    )
    return driver.execute_script(script, element)
