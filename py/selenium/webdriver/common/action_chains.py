# Copyright 2011 WebDriver committers
# Copyright 2011 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
The ActionChains implementation
"""
from selenium.webdriver.remote.command import Command
from selenium.webdriver.common.keys import Keys

class ActionChains(object):
    """
    Generate user actions.
    All actions are stored in the ActionChains object. Call perform() to fire
    stored actions.
    """

    def __init__(self, driver):
        """
        Creates a new ActionChains.

        :Args:
         - driver: The WebDriver instance which performs user actions.
        """
        self._driver = driver
        self._actions = []

    def perform(self):
        """
        Performs all stored actions.
        """
        for action in self._actions:
            action()

    def click(self, on_element=None):
        """
        Clicks an element.

        :Args:
         - on_element: The element to click.
           If None, clicks on current mouse position.
        """
        if on_element: self.move_to_element(on_element)
        self._actions.append(lambda:
            self._driver.execute(Command.CLICK, {'button': 0}))
        return self

    def click_and_hold(self, on_element=None):
        """
        Holds down the left mouse button on an element.

        :Args:
         - on_element: The element to mouse down.
           If None, clicks on current mouse position.
        """
        if on_element: self.move_to_element(on_element)
        self._actions.append(lambda:
            self._driver.execute(Command.MOUSE_DOWN, {}))
        return self

    def context_click(self, on_element=None):
        """
        Performs a context-click (right click) on an element.

        :Args:
         - on_element: The element to context-click.
           If None, clicks on current mouse position.
        """
        if on_element: self.move_to_element(on_element)
        self._actions.append(lambda:
            self._driver.execute(Command.CLICK, {'button': 2}))
        return self

    def double_click(self, on_element=None):
        """
        Double-clicks an element.

        :Args:
         - on_element: The element to double-click.
           If None, clicks on current mouse position.
        """
        if on_element: self.move_to_element(on_element)
        self._actions.append(lambda:
            self._driver.execute(Command.DOUBLE_CLICK, {}))
        return self

    def drag_and_drop(self, source, target):
        """Holds down the left mouse button on the source element,
           then moves to the target element and releases the mouse button.

        :Args:
         - source: The element to mouse down.
         - target: The element to mouse up.
        """
        self.click_and_hold(source)
        self.release(target)
        return self

    def drag_and_drop_by_offset(self, source, xoffset, yoffset):
        """
        Holds down the left mouse button on the source element,
           then moves to the target element and releases the mouse button.

        :Args:
         - source: The element to mouse down.
         - xoffset: X offset to move to.
         - yoffset: Y offset to move to.
        """
        self.click_and_hold(source)
        self.move_by_offset(xoffset, yoffset)
        self.release(source)
        return self

    def key_down(self, value, element=None):
        """Sends a key press only, without releasing it.
        Should only be used with modifier keys (Control, Alt and Shift).

        :Args:
         - key: The modifier key to send. Values are defined in Keys class.
         - target: The element to send keys.
           If None, sends a key to current focused element.
        """
        typing = []
        for val in value:
            if isinstance(val, Keys):
                typing.append(val)
            elif isinstance(val, int):
                val = str(val)
                for i in range(len(val)):
                    typing.append(val[i])
            else:
                for i in range(len(val)):
                    typing.append(val[i])

        if element: self.click(element)
        self._actions.append(lambda:
            self._driver.execute(Command.SEND_KEYS_TO_ACTIVE_ELEMENT, {
                "value": typing }))
        return self

    def key_up(self, value, element=None):
        """
        Releases a modifier key.

        :Args:
         - key: The modifier key to send. Values are defined in Keys class.
         - target: The element to send keys.
           If None, sends a key to current focused element.
        """
        typing = []
        for val in value:
            if isinstance(val, Keys):
                typing.append(val)
            elif isinstance(val, int):
                val = str(val)
                for i in range(len(val)):
                    typing.append(val[i])
            else:
                for i in range(len(val)):
                    typing.append(val[i])

        if element: self.click(element)
        self._actions.append(lambda:
            self._driver.execute(Command.SEND_KEYS_TO_ACTIVE_ELEMENT, {
                "value": typing }))
        return self

    def move_by_offset(self, xoffset, yoffset):
        """
        Moving the mouse to an offset from current mouse position.

        :Args:
         - xoffset: X offset to move to.
         - yoffset: Y offset to move to.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.MOVE_TO, {
                'xoffset': xoffset,
                'yoffset': yoffset}))
        return self

    def move_to_element(self, to_element):
        """
        Moving the mouse to the middle of an element.

        :Args:
         - to_element: The element to move to.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.MOVE_TO, {'element': to_element.id}))
        return self

    def move_to_element_with_offset(self, to_element, xoffset, yoffset):
        """
        Move the mouse by an offset of the specificed element.
        Offsets are relative to the top-left corner of the element.

        :Args:
         - to_element: The element to move to.
         - xoffset: X offset to move to.
         - yoffset: Y offset to move to.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.MOVE_TO, {
                'element': to_element.id,
                'xoffset': xoffset,
                'yoffset': yoffset}))
        return self

    def release(self, on_element=None):
        """
        Releasing a held mouse button.

        :Args:
         - on_element: The element to mouse up.
        """
        if on_element: self.move_to_element(on_element)
        self._actions.append(lambda:
            self._driver.execute(Command.MOUSE_UP, {}))
        return self

    def send_keys(self, *keys_to_send):
        """Sends keys to current focused element.

        :Args:
         - keys_to_send: The keys to send.
        """
        self._actions.append(lambda:
            self._driver.switch_to_active_element().send_keys(*keys_to_send))
        return self

    def send_keys_to_element(self, element, *keys_to_send):
        """
        Sends keys to an element.

        :Args:
         - element: The element to send keys.
         - keys_to_send: The keys to send.
        """
        self._actions.append(lambda:
            element.send_keys(*keys_to_send))
        return self
