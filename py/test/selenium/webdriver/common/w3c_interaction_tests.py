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

from selenium.webdriver.common.actions import interaction
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.common.actions.wheel_input import WheelInput
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait


def test_should_be_able_to_get_pointer_and_keyboard_inputs(driver, pages):
    actions = ActionBuilder(driver)
    pointers = actions.pointer_inputs
    keyboards = actions.key_inputs

    assert pointers is not None
    assert keyboards is not None


@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_sending_keys_to_active_element_with_modifier(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element(By.ID, "working")
    e.click()

    actions = ActionBuilder(driver)
    key_action = actions.key_action
    key_action.key_down(Keys.SHIFT).send_keys("abc").key_up(Keys.SHIFT)

    actions.perform()

    assert "ABC" == e.get_attribute("value")


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_create_pause_action_on_keyboard(driver, pages):
    # If we don't get an error and takes less than 3 seconds to run, we are good
    import datetime

    start = datetime.datetime.now()
    actions1 = ActionBuilder(driver)
    key_actions = actions1.key_action
    key_actions.pause(1)
    actions1.perform()
    finish = datetime.datetime.now()
    assert (finish - start).seconds <= 3

    # Add a filler step
    actions2 = ActionBuilder(driver)
    key_action = actions2.key_action
    key_action.pause()
    actions2.perform()


def test_can_create_pause_action_on_pointer(driver, pages):
    # If we don't get an error and takes less than 3 seconds to run, we are good
    import datetime

    start = datetime.datetime.now()
    actions1 = ActionBuilder(driver)
    key_actions = actions1.pointer_action
    key_actions.pause(1)
    actions1.perform()
    finish = datetime.datetime.now()
    assert (finish - start).seconds <= 3

    # Add a filler step
    actions2 = ActionBuilder(driver)
    key_action = actions2.pointer_action
    key_action.pause()
    actions2.perform()


def test_can_clear_actions(driver, pages):
    actions = ActionBuilder(driver)
    actions.clear_actions()


def test_move_and_click(driver, pages):
    pages.load("javascriptPage.html")
    toClick = driver.find_element(By.ID, "clickField")

    actions = ActionBuilder(driver)
    pointer = actions.pointer_action

    pointer.move_to(toClick).click()

    actions.perform()
    assert "Clicked" == toClick.get_attribute("value")


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
    actions = ActionBuilder(driver)
    pointer = actions.pointer_action
    pointer.click_and_hold(toDrag).move_to(dropInto).release()

    actions.perform()

    dropInto = driver.find_element(By.ID, "droppable")
    text = dropInto.find_element(By.TAG_NAME, "p").text
    assert "Dropped!" == text


def test_context_click(driver, pages):
    pages.load("javascriptPage.html")
    toContextClick = driver.find_element(By.ID, "doubleClickField")

    actions = ActionBuilder(driver)
    pointer = actions.pointer_action
    pointer.context_click(toContextClick)

    actions.perform()
    assert "ContextClicked" == toContextClick.get_attribute("value")


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote(reason="Fails on Travis")
@pytest.mark.xfail_chrome(reason="Fails on Travis")
def test_double_click(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("javascriptPage.html")
    toDoubleClick = driver.find_element(By.ID, "doubleClickField")

    actions = ActionBuilder(driver)
    pointer = actions.pointer_action

    pointer.double_click(toDoubleClick)

    actions.perform()
    assert "DoubleClicked" == toDoubleClick.get_attribute("value")


def test_dragging_element_with_mouse_moves_it_to_another_list(driver, pages):
    _perform_drag_and_drop_with_mouse(driver, pages)
    dragInto = driver.find_element(By.ID, "sortable1")
    assert 6 == len(dragInto.find_elements(By.TAG_NAME, "li"))


def test_dragging_element_with_mouse_fires_events(driver, pages):
    _perform_drag_and_drop_with_mouse(driver, pages)
    dragReporter = driver.find_element(By.ID, "dragging_reports")
    assert "Nothing happened. DragOut DropIn RightItem 3" == dragReporter.text


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_pen_pointer_properties(driver, pages):
    pages.load("pointerActionsPage.html")
    pointerArea = driver.find_element(By.CSS_SELECTOR, "#pointerArea")
    pointer_input = PointerInput(interaction.POINTER_PEN, "pen")
    actions = ActionBuilder(driver, mouse=pointer_input)
    center = _get_inview_center(pointerArea.rect, _get_viewport_rect(driver))
    actions.pointer_action.move_to(pointerArea).pointer_down(pressure=0.36, tilt_x=-72, tilt_y=9, twist=86).move_to(
        pointerArea, x=5, y=10
    ).pointer_up().move_to(pointerArea, x=5, y=10)
    actions.perform()
    events = _get_events(driver)
    assert events[3]["type"] == "pointerdown"
    assert events[3]["pageX"] == pytest.approx(center["x"], abs=1.0)
    assert events[3]["pageY"] == pytest.approx(center["y"], abs=1.0)
    assert events[3]["target"] == "pointerArea"
    assert events[3]["pointerType"] == "pen"
    # The default value of width and height for mouse and pen inputs is 1
    assert round(events[3]["width"], 2) == 1
    assert round(events[3]["height"], 2) == 1
    assert round(events[3]["pressure"], 2) == 0.36
    assert events[3]["tiltX"] == -72
    assert events[3]["tiltY"] == 9
    assert events[3]["twist"] == 86
    assert events[6]["type"] == "pointermove"
    assert events[6]["target"] == "pointerArea"
    assert events[6]["pointerType"] == "pen"
    assert round(events[6]["width"], 2) == 1
    assert round(events[6]["height"], 2) == 1
    # The default value of pressure for all inputs is 0.5, other properties are 0
    assert round(events[6]["pressure"], 2) == 0.5
    assert events[6]["tiltX"] == 0
    assert events[6]["tiltY"] == 0
    assert events[6]["twist"] == 0


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_touch_pointer_properties(driver, pages):
    pages.load("pointerActionsPage.html")
    pointerArea = driver.find_element(By.CSS_SELECTOR, "#pointerArea")
    center = _get_inview_center(pointerArea.rect, _get_viewport_rect(driver))
    touch_input = PointerInput(interaction.POINTER_TOUCH, "touch")
    touch_chain = ActionBuilder(driver, mouse=touch_input)
    touch_chain.pointer_action.move_to(pointerArea).pointer_down(
        width=23, height=31, pressure=0.78, tilt_x=21, tilt_y=-8, twist=355
    ).move_to(
        pointerArea, x=10, y=10, width=39, height=35, pressure=0.91, tilt_x=-19, tilt_y=62, twist=345
    ).pointer_up().move_to(
        pointerArea, x=15, y=15
    )
    touch_chain.perform()
    events = _get_events(driver)
    assert len(events) == 7
    event_types = [e["type"] for e in events]
    assert [
        "pointerover",
        "pointerenter",
        "pointerdown",
        "pointermove",
        "pointerup",
        "pointerout",
        "pointerleave",
    ] == event_types
    assert events[2]["type"] == "pointerdown"
    assert events[2]["pageX"] == pytest.approx(center["x"], abs=1.0)
    assert events[2]["pageY"] == pytest.approx(center["y"], abs=1.0)
    assert events[2]["target"] == "pointerArea"
    assert events[2]["pointerType"] == "touch"
    assert round(events[2]["width"], 2) == 23
    assert round(events[2]["height"], 2) == 31
    assert round(events[2]["pressure"], 2) == 0.78
    assert events[2]["tiltX"] == 21
    assert events[2]["tiltY"] == -8
    assert events[2]["twist"] == 355
    assert events[3]["type"] == "pointermove"
    assert events[3]["pageX"] == pytest.approx(center["x"] + 10, abs=1.0)
    assert events[3]["pageY"] == pytest.approx(center["y"] + 10, abs=1.0)
    assert events[3]["target"] == "pointerArea"
    assert events[3]["pointerType"] == "touch"
    assert round(events[3]["width"], 2) == 39
    assert round(events[3]["height"], 2) == 35
    assert round(events[3]["pressure"], 2) == 0.91
    assert events[3]["tiltX"] == -19
    assert events[3]["tiltY"] == 62
    assert events[3]["twist"] == 345


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_can_scroll_mouse_wheel(driver, pages):
    pages.load("scrollingPage.html")
    driver.execute_script("document.scrollingElement.scrollTop = 0")
    scrollable = driver.find_element(By.CSS_SELECTOR, "#scrollable")

    wheel_input = WheelInput("wheel")
    actions = ActionBuilder(driver, wheel=wheel_input)
    actions.wheel_action.scroll(0, 0, 5, 10, 0, scrollable)

    actions.perform()
    events = _get_events(driver)
    assert len(events) == 1
    assert events[0]["type"] == "wheel"
    assert events[0]["deltaX"] >= 5
    assert events[0]["deltaY"] >= 10
    assert events[0]["deltaZ"] == 0
    assert events[0]["target"] == "scrollContent"


def _perform_drag_and_drop_with_mouse(driver, pages):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    pages.load("draggableLists.html")
    dragReporter = driver.find_element(By.ID, "dragging_reports")
    toDrag = driver.find_element(By.ID, "rightitem-3")
    dragInto = driver.find_element(By.ID, "sortable1")

    actions = ActionBuilder(driver)
    pointer = actions.pointer_action
    pointer.click_and_hold(toDrag).move_to(driver.find_element(By.ID, "leftitem-4")).move_to(dragInto).release()

    assert "Nothing happened." == dragReporter.text

    actions.perform()
    assert "Nothing happened. DragOut" in dragReporter.text


def _is_element_available(driver, id):
    """Copied from org.openqa.selenium.interactions.TestBasicMouseInterface."""
    try:
        driver.find_element(By.ID, id)
        return True
    except Exception:
        return False


def _get_events(driver):
    """Return list of key events recorded in the test_keys_page fixture."""
    events = driver.execute_script("return allEvents.events;") or []
    # `key` values in `allEvents` may be escaped (see `escapeSurrogateHalf` in
    # test_keys_wdspec.html), so this converts them back into unicode literals.
    for e in events:
        # example: turn "U+d83d" (6 chars) into u"\ud83d" (1 char)
        if "key" in e and e["key"].startswith("U+"):
            key = e["key"]
            hex_suffix = key[key.index("+") + 1 :]
            e["key"] = chr(int(hex_suffix, 16))

        # WebKit sets code as 'Unidentified' for unidentified key codes, but
        # tests expect ''.
        if "code" in e and e["code"] == "Unidentified":
            e["code"] = ""
    return events


def _get_inview_center(elem_rect, viewport_rect):
    x = {
        "left": max(0, min(elem_rect["x"], elem_rect["x"] + elem_rect["width"])),
        "right": min(viewport_rect["width"], max(elem_rect["x"], elem_rect["x"] + elem_rect["width"])),
    }

    y = {
        "top": max(0, min(elem_rect["y"], elem_rect["y"] + elem_rect["height"])),
        "bottom": min(viewport_rect["height"], max(elem_rect["y"], elem_rect["y"] + elem_rect["height"])),
    }

    return {
        "x": (x["left"] + x["right"]) / 2,
        "y": (y["top"] + y["bottom"]) / 2,
    }


def _get_viewport_rect(driver):
    return driver.execute_script(
        """
        return {
          height: window.innerHeight || document.documentElement.clientHeight,
          width: window.innerWidth || document.documentElement.clientWidth,
        };
    """
    )
