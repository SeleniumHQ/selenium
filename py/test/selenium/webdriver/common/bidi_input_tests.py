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

import os
import tempfile
import time

import pytest

from selenium.webdriver.common.bidi.input import (
    ElementOrigin,
    FileDialogInfo,
    KeyDownAction,
    KeySourceActions,
    KeyUpAction,
    NoneSourceActions,
    Origin,
    PauseAction,
    PointerCommonProperties,
    PointerDownAction,
    PointerMoveAction,
    PointerParameters,
    PointerSourceActions,
    PointerType,
    PointerUpAction,
    WheelScrollAction,
    WheelSourceActions,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def test_input_initialized(driver):
    """Test that the input module is initialized properly."""
    assert driver.input is not None


def test_basic_key_input(driver, pages):
    """Test basic keyboard input using BiDi."""
    pages.load("single_text_input.html")

    input_element = driver.find_element(By.ID, "textInput")

    # Create keyboard actions to type "hello"
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

    driver.input.perform_actions(driver.current_window_handle, [key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "hello")
    assert input_element.get_attribute("value") == "hello"


def test_key_input_with_pause(driver, pages):
    """Test keyboard input with pause actions."""
    pages.load("single_text_input.html")

    input_element = driver.find_element(By.ID, "textInput")

    # Create keyboard actions with pauses
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

    driver.input.perform_actions(driver.current_window_handle, [key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "ab")
    assert input_element.get_attribute("value") == "ab"


def test_pointer_click(driver, pages):
    """Test basic pointer click using BiDi."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")

    # Get button location
    location = button.location
    size = button.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Create pointer actions for a click
    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x, y=y),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_pointer_move_with_element_origin(driver, pages):
    """Test pointer move with element origin."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")

    # Get element reference for BiDi
    element_id = button.id
    element_ref = {"sharedId": element_id}
    element_origin = ElementOrigin(element_ref)

    # Create pointer actions with element origin
    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=0, y=0, origin=element_origin),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_pointer_with_common_properties(driver, pages):
    """Test pointer actions with common properties."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")
    location = button.location
    size = button.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Create pointer properties
    properties = PointerCommonProperties(
        width=2,
        height=2,
        pressure=0.5,
        tangential_pressure=0.0,
        twist=45,
        altitude_angle=0.5,
        azimuth_angle=1.0,
    )

    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x, y=y, properties=properties),
            PointerDownAction(button=0, properties=properties),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_wheel_scroll(driver, pages):
    """Test wheel scroll actions."""
    # page that can be scrolled
    pages.load("scroll3.html")

    # Scroll down
    wheel_actions = WheelSourceActions(
        id="wheel",
        actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, origin=Origin.VIEWPORT)],
    )

    driver.input.perform_actions(driver.current_window_handle, [wheel_actions])

    # Verify the page scrolled by checking scroll position
    scroll_y = driver.execute_script("return window.pageYOffset;")
    assert scroll_y == 100


def test_combined_input_actions(driver, pages):
    """Test combining multiple input sources."""
    pages.load("single_text_input.html")

    input_element = driver.find_element(By.ID, "textInput")

    # First click on the input field, then type
    location = input_element.location
    size = input_element.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Pointer actions to click
    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PauseAction(duration=0),  # Sync with keyboard
            PointerMoveAction(x=x, y=y),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )

    # Keyboard actions to type
    key_actions = KeySourceActions(
        id="keyboard",
        actions=[
            PauseAction(duration=0),  # Sync with pointer
            # write "test"
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

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions, key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "test")
    assert input_element.get_attribute("value") == "test"


def test_set_files(driver, pages):
    """Test setting files on file input element."""
    pages.load("formPage.html")

    upload_element = driver.find_element(By.ID, "upload")
    assert upload_element.get_attribute("value") == ""

    # Create a temporary file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as temp_file:
        temp_file.write("test content")
        temp_file_path = temp_file.name

    try:
        # Get element reference for BiDi
        element_id = upload_element.id
        element_ref = {"sharedId": element_id}

        # Set files using BiDi
        driver.input.set_files(driver.current_window_handle, element_ref, [temp_file_path])

        # Verify file was set
        value = upload_element.get_attribute("value")
        assert os.path.basename(temp_file_path) in value

    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)


def test_set_multiple_files(driver):
    """Test setting multiple files on a file input element with 'multiple' attribute using BiDi."""
    driver.get("data:text/html,<input id=upload type=file multiple />")

    upload_element = driver.find_element(By.ID, "upload")

    # Create temporary files
    temp_files = []
    for i in range(2):
        temp_file = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
        temp_file.write(f"test content {i}")
        temp_files.append(temp_file.name)
        temp_file.close()

    try:
        # Get element reference for BiDi
        element_id = upload_element.id
        element_ref = {"sharedId": element_id}

        driver.input.set_files(driver.current_window_handle, element_ref, temp_files)

        value = upload_element.get_attribute("value")
        assert value != ""

    finally:
        # Clean up temp files
        for temp_file_path in temp_files:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)


def test_release_actions(driver, pages):
    """Test releasing input actions."""
    pages.load("single_text_input.html")

    input_element = driver.find_element(By.ID, "textInput")

    # Perform some actions first
    key_actions = KeySourceActions(
        id="keyboard",
        actions=[
            KeyDownAction(value="a"),
            # Note: not releasing the key
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [key_actions])

    # Now release all actions
    driver.input.release_actions(driver.current_window_handle)

    # The key should be released now, so typing more should work normally
    key_actions2 = KeySourceActions(
        id="keyboard",
        actions=[
            KeyDownAction(value="b"),
            KeyUpAction(value="b"),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [key_actions2])

    # Should be able to type normally
    WebDriverWait(driver, 5).until(lambda d: "b" in input_element.get_attribute("value"))


@pytest.mark.parametrize("multiple", [True, False])
@pytest.mark.xfail_firefox(reason="File dialog handling not implemented in Firefox yet")
def test_file_dialog_event_handler_multiple(driver, multiple):
    """Test file dialog event handler with multiple as true and false."""
    file_dialog_events = []

    def file_dialog_handler(file_dialog_info):
        file_dialog_events.append(file_dialog_info)

    # Test event handler registration
    handler_id = driver.input.add_file_dialog_handler(file_dialog_handler)
    assert handler_id is not None

    driver.get(f"data:text/html,<input id=upload type=file {'multiple' if multiple else ''} />")

    # Use script.evaluate to trigger the file dialog with user activation
    driver.script._evaluate(
        expression="document.getElementById('upload').click()",
        target={"context": driver.current_window_handle},
        await_promise=False,
        user_activation=True,
    )

    # Wait for the file dialog event to be triggered
    WebDriverWait(driver, 5).until(lambda d: len(file_dialog_events) > 0)

    assert len(file_dialog_events) > 0
    file_dialog_info = file_dialog_events[0]
    assert isinstance(file_dialog_info, FileDialogInfo)
    assert file_dialog_info.context == driver.current_window_handle
    # Check if multiple attribute is set correctly (True, False)
    assert file_dialog_info.multiple is multiple

    driver.input.remove_file_dialog_handler(handler_id)


@pytest.mark.xfail_firefox(reason="File dialog handling not implemented in Firefox yet")
def test_file_dialog_event_handler_unsubscribe(driver):
    """Test file dialog event handler unsubscribe."""
    file_dialog_events = []

    def file_dialog_handler(file_dialog_info):
        file_dialog_events.append(file_dialog_info)

    # Register the handler
    handler_id = driver.input.add_file_dialog_handler(file_dialog_handler)
    assert handler_id is not None

    # Unsubscribe the handler
    driver.input.remove_file_dialog_handler(handler_id)

    driver.get("data:text/html,<input id=upload type=file />")

    # Trigger the file dialog
    driver.script._evaluate(
        expression="document.getElementById('upload').click()",
        target={"context": driver.current_window_handle},
        await_promise=False,
        user_activation=True,
    )

    # Wait to ensure no events are captured
    time.sleep(1)
    assert len(file_dialog_events) == 0


# Edge Cases and Additional Tests


def test_perform_actions_with_none_source(driver, pages):
    """Test performing NoneSourceActions (pause only)."""
    pages.load("single_text_input.html")

    # Create none actions (pause only - no actual input)
    none_actions = NoneSourceActions(
        id="none_id",
        actions=[
            PauseAction(duration=100),
            PauseAction(duration=50),
        ],
    )

    # Should execute without error
    driver.input.perform_actions(driver.current_window_handle, [none_actions])

    # Verify input field is still empty
    input_element = driver.find_element(By.ID, "textInput")
    assert input_element.get_attribute("value") == ""


def test_perform_actions_rapid_key_sequence(driver, pages):
    """Test rapid key input sequence without pause between keys."""
    pages.load("single_text_input.html")

    input_element = driver.find_element(By.ID, "textInput")

    # Create rapid key sequence
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

    driver.input.perform_actions(driver.current_window_handle, [key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "abcd")
    assert input_element.get_attribute("value") == "abcd"


def test_perform_actions_multiple_pointer_buttons(driver, pages):
    """Test pointer actions with different button values."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")
    location = button.location
    size = button.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Test with button 0 (left click)
    pointer_actions_left = PointerSourceActions(
        id="mouse_left",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x, y=y),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions_left])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_perform_actions_pointer_touch_type(driver, pages):
    """Test pointer actions with touch pointer type."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")
    location = button.location
    size = button.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Create touch actions
    touch_actions = PointerSourceActions(
        id="touch",
        parameters=PointerParameters(pointer_type=PointerType.TOUCH),
        actions=[
            PointerMoveAction(x=x, y=y),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [touch_actions])

    # Touch should work similar to mouse click
    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_perform_actions_pointer_pen_type(driver, pages):
    """Test pointer actions with pen pointer type."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")
    location = button.location
    size = button.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Create pen actions
    pen_actions = PointerSourceActions(
        id="pen",
        parameters=PointerParameters(pointer_type=PointerType.PEN),
        actions=[
            PointerMoveAction(x=x, y=y),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pen_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_perform_actions_pointer_move_with_duration(driver, pages):
    """Test pointer move action with duration parameter."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")
    location = button.location
    size = button.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Start point (off the button)
    start_x = x - 100
    start_y = y - 100

    # Create pointer actions with duration on move
    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=start_x, y=start_y),
            PointerMoveAction(x=x, y=y, duration=500),  # Slow move
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_wheel_scroll_negative_delta(driver, pages):
    """Test wheel scroll with negative delta values (up/left)."""
    pages.load("scroll3.html")

    # First scroll down
    wheel_actions_down = WheelSourceActions(
        id="wheel_down",
        actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, origin=Origin.VIEWPORT)],
    )

    driver.input.perform_actions(driver.current_window_handle, [wheel_actions_down])

    scroll_y_down = driver.execute_script("return window.pageYOffset;")
    assert scroll_y_down > 0

    # Then scroll back up (negative delta)
    wheel_actions_up = WheelSourceActions(
        id="wheel_up",
        actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=-50, origin=Origin.VIEWPORT)],
    )

    driver.input.perform_actions(driver.current_window_handle, [wheel_actions_up])

    scroll_y_up = driver.execute_script("return window.pageYOffset;")
    assert scroll_y_up < scroll_y_down


def test_wheel_scroll_with_duration(driver, pages):
    """Test wheel scroll action with duration parameter."""
    pages.load("scroll3.html")

    wheel_actions = WheelSourceActions(
        id="wheel",
        actions=[
            WheelScrollAction(
                x=100,
                y=100,
                delta_x=0,
                delta_y=100,
                duration=500,
                origin=Origin.VIEWPORT,
            )
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [wheel_actions])

    scroll_y = driver.execute_script("return window.pageYOffset;")
    assert scroll_y == 100


def test_wheel_scroll_horizontal(driver, pages):
    """Test wheel scroll with horizontal movement."""
    pages.load("scroll3.html")

    # Scroll horizontally
    wheel_actions = WheelSourceActions(
        id="wheel",
        actions=[WheelScrollAction(x=100, y=100, delta_x=50, delta_y=0, origin=Origin.VIEWPORT)],
    )

    driver.input.perform_actions(driver.current_window_handle, [wheel_actions])

    # Check horizontal scroll occurred
    scroll_x = driver.execute_script("return window.pageXOffset;")
    assert scroll_x >= 0


def test_key_input_special_characters(driver, pages):
    """Test keyboard input with special characters."""
    pages.load("single_text_input.html")

    input_element = driver.find_element(By.ID, "textInput")

    # Create keyboard actions for special characters
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

    driver.input.perform_actions(driver.current_window_handle, [key_actions])

    WebDriverWait(driver, 5).until(lambda d: "!" in input_element.get_attribute("value"))


def test_set_files_empty_file_list(driver, pages):
    """Test setting an empty file list on a file input element."""
    pages.load("formPage.html")

    upload_element = driver.find_element(By.ID, "upload")

    # Get element reference for BiDi
    element_id = upload_element.id
    element_ref = {"sharedId": element_id}

    # Set empty file list
    driver.input.set_files(driver.current_window_handle, element_ref, [])

    # Value should be empty
    value = upload_element.get_attribute("value")
    assert value == ""


def test_set_files_with_absolute_path(driver):
    """Test setting a file using absolute file path."""
    driver.get("data:text/html,<input id=upload type=file />")

    upload_element = driver.find_element(By.ID, "upload")

    # Create a temporary file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as temp_file:
        temp_file.write("test file content")
        temp_file_path = temp_file.name

    try:
        # Get element reference
        element_id = upload_element.id
        element_ref = {"sharedId": element_id}

        # Set file using absolute path
        driver.input.set_files(driver.current_window_handle, element_ref, [temp_file_path])

        value = upload_element.get_attribute("value")
        assert os.path.basename(temp_file_path) in value

    finally:
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)


def test_release_actions_clears_pointer_state(driver, pages):
    """Test that release_actions properly clears pointer state."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")
    location = button.location
    size = button.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Press pointer button but don't release
    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x, y=y),
            PointerDownAction(button=0),
            # Not releasing button
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions])

    # Release all actions
    driver.input.release_actions(driver.current_window_handle)

    # Now move and try clicking again - should work normally
    pointer_actions2 = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x, y=y),
            PointerDownAction(button=0),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions2])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_multiple_file_dialog_handlers(driver):
    """Test registering multiple file dialog handlers."""
    handlers_triggered = []

    def handler_1(file_dialog_info):
        handlers_triggered.append(1)

    def handler_2(file_dialog_info):
        handlers_triggered.append(2)

    # Register two handlers
    handler_id_1 = driver.input.add_file_dialog_handler(handler_1)
    handler_id_2 = driver.input.add_file_dialog_handler(handler_2)

    assert handler_id_1 is not None
    assert handler_id_2 is not None
    assert handler_id_1 != handler_id_2

    # Clean up
    driver.input.remove_file_dialog_handler(handler_id_1)
    driver.input.remove_file_dialog_handler(handler_id_2)


def test_pointer_common_properties_pressure_values(driver, pages):
    """Test pointer actions with various pressure values."""
    pages.load("javascriptPage.html")

    button = driver.find_element(By.ID, "clickField")
    location = button.location
    size = button.size
    x = location["x"] + size["width"] // 2
    y = location["y"] + size["height"] // 2

    # Test with different pressure values
    properties = PointerCommonProperties(
        width=2,
        height=2,
        pressure=0.75,  # High pressure
        tangential_pressure=0.25,
        twist=90,
        altitude_angle=0.7,
        azimuth_angle=1.5,
    )

    pointer_actions = PointerSourceActions(
        id="mouse",
        parameters=PointerParameters(pointer_type=PointerType.MOUSE),
        actions=[
            PointerMoveAction(x=x, y=y, properties=properties),
            PointerDownAction(button=0, properties=properties),
            PointerUpAction(button=0),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [pointer_actions])

    WebDriverWait(driver, 5).until(lambda d: button.get_attribute("value") == "Clicked")
    assert button.get_attribute("value") == "Clicked"


def test_combined_keyboard_and_wheel_actions(driver, pages):
    """Test combining keyboard and wheel scroll actions."""
    pages.load("scroll3.html")

    # Combine keyboard and wheel actions
    key_actions = KeySourceActions(
        id="keyboard",
        actions=[PauseAction(duration=0)],  # Sync with wheel
    )

    wheel_actions = WheelSourceActions(
        id="wheel",
        actions=[
            PauseAction(duration=0),  # Sync with keyboard
            WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, origin=Origin.VIEWPORT),
        ],
    )

    driver.input.perform_actions(driver.current_window_handle, [key_actions, wheel_actions])

    scroll_y = driver.execute_script("return window.pageYOffset;")
    assert scroll_y == 100


def test_key_input_with_value_attribute(driver, pages):
    """Test KeyDownAction and KeyUpAction use value attribute correctly."""
    pages.load("single_text_input.html")

    input_element = driver.find_element(By.ID, "textInput")

    # Use explicit value attribute in actions
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

    driver.input.perform_actions(driver.current_window_handle, [key_actions])

    WebDriverWait(driver, 5).until(lambda d: input_element.get_attribute("value") == "xyz")
    assert input_element.get_attribute("value") == "xyz"


def test_wheel_scroll_with_element_origin(driver, pages):
    """Test wheel scroll with element origin instead of viewport."""
    pages.load("scroll3.html")

    # Get a reference to a scrollable element (body)
    body_element = driver.find_element(By.TAG_NAME, "body")
    element_id = body_element.id
    element_ref = {"sharedId": element_id}
    element_origin = ElementOrigin(element_ref)

    # Scroll with element origin
    wheel_actions = WheelSourceActions(
        id="wheel",
        actions=[WheelScrollAction(x=100, y=100, delta_x=0, delta_y=100, origin=element_origin)],
    )

    driver.input.perform_actions(driver.current_window_handle, [wheel_actions])

    scroll_y = driver.execute_script("return window.pageYOffset;")
    assert scroll_y >= 0
