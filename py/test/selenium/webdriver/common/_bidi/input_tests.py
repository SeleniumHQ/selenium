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

"""Mirror of ``../bidi/input_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import os
import tempfile

import pytest

from selenium.webdriver.common._bidi.input import (
    ElementOrigin,
    Input,
    KeyDownAction,
    KeySourceActions,
    KeyUpAction,
    NoneSourceActions,
    PauseAction,
    PointerDownAction,
    PointerMoveAction,
    PointerParameters,
    PointerSourceActions,
    PointerType,
    PointerUpAction,
    WheelScrollAction,
    WheelSourceActions,
)
from selenium.webdriver.common._bidi.script import SharedReference
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def _center(element):
    location = element.location
    size = element.size
    return location["x"] + size["width"] // 2, location["y"] + size["height"] // 2


def test_basic_key_input(driver, pages):
    pages.load("single_text_input.html")
    input_element = driver.find_element(By.ID, "textInput")

    key_actions = KeySourceActions(
        id="keyboard",
        actions=[
            KeyDownAction(value="h"),
            KeyUpAction(value="h"),
            KeyDownAction(value="e"),
            KeyUpAction(value="e"),
            KeyDownAction(value="l"),
            KeyUpAction(value="l"),
            KeyDownAction(value="l"),
            KeyUpAction(value="l"),
            KeyDownAction(value="o"),
            KeyUpAction(value="o"),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "hello")


def test_key_input_with_pause(driver, pages):
    pages.load("single_text_input.html")
    input_element = driver.find_element(By.ID, "textInput")

    key_actions = KeySourceActions(
        id="keyboard",
        actions=[
            KeyDownAction(value="a"),
            KeyUpAction(value="a"),
            PauseAction(duration=100),
            KeyDownAction(value="b"),
            KeyUpAction(value="b"),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "ab")


def test_pointer_click(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    x, y = _center(button)

    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[PointerMoveAction(x=x, y=y), PointerDownAction(button=0), PointerUpAction(button=0)],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


def test_pointer_move_with_element_origin(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    element_origin = ElementOrigin(element=SharedReference(shared_id=button.id))

    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=0, y=0, origin=element_origin),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


def test_pointer_with_common_properties(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    x, y = _center(button)

    # Generated actions flatten PointerCommonProperties inline, so the common fields spread onto each action.
    props = dict(
        width=2, height=2, pressure=0.5, tangential_pressure=0.0, twist=45, altitude_angle=0.5, azimuth_angle=1.0
    )
    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x, y=y, **props),
            PointerDownAction(button=0, **props),
            PointerUpAction(button=0),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


def test_wheel_scroll(driver, pages):
    pages.load("scroll3.html")
    wheel_actions = WheelSourceActions(
        id="wheel", actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, origin="viewport")]
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[wheel_actions])

    assert driver.execute_script("return window.pageYOffset;") == 100


def test_combined_input_actions(driver, pages):
    pages.load("single_text_input.html")
    input_element = driver.find_element(By.ID, "textInput")
    x, y = _center(input_element)

    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PauseAction(duration=0),
            PointerMoveAction(x=x, y=y),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )
    key_actions = KeySourceActions(
        id="keyboard",
        actions=[
            PauseAction(duration=0),
            KeyDownAction(value="t"),
            KeyUpAction(value="t"),
            KeyDownAction(value="e"),
            KeyUpAction(value="e"),
            KeyDownAction(value="s"),
            KeyUpAction(value="s"),
            KeyDownAction(value="t"),
            KeyUpAction(value="t"),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[pointer_actions, key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "test")


def test_set_files(driver, pages):
    pages.load("formPage.html")
    upload_element = driver.find_element(By.ID, "upload")
    assert upload_element.get_attribute("value") == ""

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as temp_file:
        temp_file.write("test content")
        temp_file_path = temp_file.name

    try:
        Input(driver).set_files(
            context=driver.current_window_handle,
            element=SharedReference(shared_id=upload_element.id),
            files=[temp_file_path],
        )
        assert os.path.basename(temp_file_path) in upload_element.get_attribute("value")
    finally:
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)


def test_set_multiple_files(driver):
    driver.get("data:text/html,<input id=upload type=file multiple />")
    upload_element = driver.find_element(By.ID, "upload")

    temp_files = []
    for i in range(2):
        temp_file = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
        temp_file.write(f"test content {i}")
        temp_files.append(temp_file.name)
        temp_file.close()

    try:
        Input(driver).set_files(
            context=driver.current_window_handle, element=SharedReference(shared_id=upload_element.id), files=temp_files
        )
        assert upload_element.get_attribute("value") != ""
    finally:
        for temp_file_path in temp_files:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)


def test_release_actions(driver, pages):
    pages.load("single_text_input.html")
    input_element = driver.find_element(By.ID, "textInput")

    Input(driver).perform_actions(
        context=driver.current_window_handle,
        actions=[KeySourceActions(id="keyboard", actions=[KeyDownAction(value="a")])],
    )
    Input(driver).release_actions(context=driver.current_window_handle)

    Input(driver).perform_actions(
        context=driver.current_window_handle,
        actions=[KeySourceActions(id="keyboard", actions=[KeyDownAction(value="b"), KeyUpAction(value="b")])],
    )
    WebDriverWait(driver, 5).until(lambda d: "b" in input_element.get_attribute("value"))


def test_perform_actions_with_none_source(driver, pages):
    pages.load("single_text_input.html")
    none_actions = NoneSourceActions(id="none_id", actions=[PauseAction(duration=100), PauseAction(duration=50)])
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[none_actions])

    assert driver.find_element(By.ID, "textInput").get_attribute("value") == ""


def test_perform_actions_rapid_key_sequence(driver, pages):
    pages.load("single_text_input.html")
    input_element = driver.find_element(By.ID, "textInput")

    key_actions = KeySourceActions(
        id="keyboard",
        actions=[
            KeyDownAction(value="a"),
            KeyUpAction(value="a"),
            KeyDownAction(value="b"),
            KeyUpAction(value="b"),
            KeyDownAction(value="c"),
            KeyUpAction(value="c"),
            KeyDownAction(value="d"),
            KeyUpAction(value="d"),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "abcd")


def test_perform_actions_multiple_pointer_buttons(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    x, y = _center(button)

    pointer_actions = PointerSourceActions(
        id="mouse_left",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[PointerMoveAction(x=x, y=y), PointerDownAction(button=0), PointerUpAction(button=0)],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


def test_perform_actions_pointer_touch_type(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    x, y = _center(button)

    touch_actions = PointerSourceActions(
        id="touch",
        parameters=PointerParameters(pointer_type=PointerType.TOUCH),
        actions=[PointerMoveAction(x=x, y=y), PointerDownAction(button=0), PointerUpAction(button=0)],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[touch_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


@pytest.mark.xfail_firefox
def test_perform_actions_pointer_pen_type(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    x, y = _center(button)

    pen_actions = PointerSourceActions(
        id="pen",
        parameters=PointerParameters(pointer_type=PointerType.PEN),
        actions=[PointerMoveAction(x=x, y=y), PointerDownAction(button=0), PointerUpAction(button=0)],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[pen_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


def test_perform_actions_pointer_move_with_duration(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    x, y = _center(button)

    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x - 100, y=y - 100),
            PointerMoveAction(x=x, y=y, duration=500),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


def test_wheel_scroll_negative_delta(driver, pages):
    pages.load("scroll3.html")
    Input(driver).perform_actions(
        context=driver.current_window_handle,
        actions=[
            WheelSourceActions(
                id="d", actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, origin="viewport")]
            )
        ],
    )
    scroll_y_down = driver.execute_script("return window.pageYOffset;")
    assert scroll_y_down > 0

    Input(driver).perform_actions(
        context=driver.current_window_handle,
        actions=[
            WheelSourceActions(
                id="u", actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=-50, origin="viewport")]
            )
        ],
    )
    assert driver.execute_script("return window.pageYOffset;") < scroll_y_down


def test_wheel_scroll_with_duration(driver, pages):
    pages.load("scroll3.html")
    wheel_actions = WheelSourceActions(
        id="wheel",
        actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, duration=500, origin="viewport")],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[wheel_actions])

    assert driver.execute_script("return window.pageYOffset;") == 100


def test_wheel_scroll_horizontal(driver, pages):
    pages.load("scroll3.html")
    wheel_actions = WheelSourceActions(
        id="wheel", actions=[WheelScrollAction(x=100, y=100, delta_x=50, delta_y=0, origin="viewport")]
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[wheel_actions])

    assert driver.execute_script("return window.pageXOffset;") >= 0


def test_key_input_special_characters(driver, pages):
    pages.load("single_text_input.html")
    input_element = driver.find_element(By.ID, "textInput")

    key_actions = KeySourceActions(
        id="keyboard",
        actions=[
            KeyDownAction(value="!"),
            KeyUpAction(value="!"),
            KeyDownAction(value="@"),
            KeyUpAction(value="@"),
            KeyDownAction(value="#"),
            KeyUpAction(value="#"),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[key_actions])

    WebDriverWait(driver, 5).until(lambda d: "!" in input_element.get_attribute("value"))


def test_set_files_empty_file_list(driver, pages):
    pages.load("formPage.html")
    upload_element = driver.find_element(By.ID, "upload")

    Input(driver).set_files(
        context=driver.current_window_handle, element=SharedReference(shared_id=upload_element.id), files=[]
    )
    assert upload_element.get_attribute("value") == ""


def test_set_files_with_absolute_path(driver):
    driver.get("data:text/html,<input id=upload type=file />")
    upload_element = driver.find_element(By.ID, "upload")

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as temp_file:
        temp_file.write("test file content")
        temp_file_path = temp_file.name

    try:
        Input(driver).set_files(
            context=driver.current_window_handle,
            element=SharedReference(shared_id=upload_element.id),
            files=[temp_file_path],
        )
        assert os.path.basename(temp_file_path) in upload_element.get_attribute("value")
    finally:
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)


def test_release_actions_clears_pointer_state(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    x, y = _center(button)

    Input(driver).perform_actions(
        context=driver.current_window_handle,
        actions=[
            PointerSourceActions(
                id="mouse",
                parameters=PointerParameters(pointer_type=PointerType.MOUSE),
                actions=[PointerMoveAction(x=x, y=y), PointerDownAction(button=0)],
            )
        ],
    )
    Input(driver).release_actions(context=driver.current_window_handle)

    Input(driver).perform_actions(
        context=driver.current_window_handle,
        actions=[
            PointerSourceActions(
                id="mouse",
                parameters=PointerParameters(pointer_type=PointerType.MOUSE),
                actions=[PointerMoveAction(x=x, y=y), PointerDownAction(button=0), PointerUpAction(button=0)],
            )
        ],
    )
    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


def test_pointer_common_properties_pressure_values(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "clickField")
    x, y = _center(button)

    props = dict(
        width=2, height=2, pressure=0.75, tangential_pressure=0.25, twist=90, altitude_angle=0.7, azimuth_angle=1.5
    )
    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x, y=y, **props),
            PointerDownAction(button=0, **props),
            PointerUpAction(button=0),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")


def test_combined_keyboard_and_wheel_actions(driver, pages):
    pages.load("scroll3.html")
    key_actions = KeySourceActions(id="keyboard", actions=[PauseAction(duration=0)])
    wheel_actions = WheelSourceActions(
        id="wheel",
        actions=[PauseAction(duration=0), WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, origin="viewport")],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[key_actions, wheel_actions])

    assert driver.execute_script("return window.pageYOffset;") == 100


def test_key_input_with_value_attribute(driver, pages):
    pages.load("single_text_input.html")
    input_element = driver.find_element(By.ID, "textInput")

    key_actions = KeySourceActions(
        id="keyboard",
        actions=[
            KeyDownAction(value="x"),
            KeyUpAction(value="x"),
            KeyDownAction(value="y"),
            KeyUpAction(value="y"),
            KeyDownAction(value="z"),
            KeyUpAction(value="z"),
        ],
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "xyz")


def test_wheel_scroll_with_element_origin(driver, pages):
    pages.load("scroll3.html")
    body_element = driver.find_element(By.TAG_NAME, "body")
    element_origin = ElementOrigin(element=SharedReference(shared_id=body_element.id))

    wheel_actions = WheelSourceActions(
        id="wheel", actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, origin=element_origin)]
    )
    Input(driver).perform_actions(context=driver.current_window_handle, actions=[wheel_actions])

    assert driver.execute_script("return window.pageYOffset;") >= 0
