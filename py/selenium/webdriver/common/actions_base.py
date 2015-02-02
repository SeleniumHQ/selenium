"""
Contains the actions bases for both touch screens and desktop/laptop
style devices.
"""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import abc
import six
from selenium.webdriver.remote.command import Command
from selenium.webdriver.common.keys import keys_to_typing


@six.add_metaclass(abc.ABCMeta)
class ActionsBase(object):
    @abc.abstractmethod
    def execute(self, command, kwargs):
        """
        This abstract method needs to be implemented to actually,
        execute the desired commands.

        :param command: The command to run.
        :type command: unicode
        :param kwargs: A dictionary of arguments
        :type kwargs: dict
        """
        pass

    @abc.abstractmethod
    def send_keys_to_element(self, element, *keys_to_send):
        """
        Sends keys to an element.

        :Args:
         - element: The element to send keys.
         - keys_to_send: The keys to send.  Modifier keys constants can be found in the
         'Keys' class.
        """
        return self

    def click(self, on_element=None):
        """
        Clicks an element.

        :Args:
         - on_element: The element to click.
           If None, clicks on current mouse position.
        """
        if on_element:
            self.move_to_element(on_element)
        self.execute(Command.CLICK, {'button': 0})
        return self

    def click_and_hold(self, on_element=None):
        """
        Holds down the left mouse button on an element.

        :Args:
         - on_element: The element to mouse down.
           If None, clicks on current mouse position.
        """
        if on_element:
            self.move_to_element(on_element)
        self.execute(Command.MOUSE_DOWN, {})
        return self

    def context_click(self, on_element=None):
        """
        Performs a context-click (right click) on an element.

        :Args:
         - on_element: The element to context-click.
           If None, clicks on current mouse position.
        """
        if on_element:
            self.move_to_element(on_element)
        self.execute(Command.CLICK, {'button': 2})
        return self

    def double_click(self, on_element=None):
        """
        Double-clicks an element.

        :Args:
         - on_element: The element to double-click.
           If None, clicks on current mouse position.
        """
        if on_element:
            self.move_to_element(on_element)
        self.execute(Command.DOUBLE_CLICK, {})
        return self

    def drag_and_drop(self, source, target):
        """
        Holds down the left mouse button on the source element,
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
           then moves to the target offset and releases the mouse button.

        :Args:
         - source: The element to mouse down.
         - xoffset: X offset to move to.
         - yoffset: Y offset to move to.
        """
        self.click_and_hold(source)
        self.move_by_offset(xoffset, yoffset)
        self.release()
        return self

    def key_down(self, value, element=None):
        """
        Sends a key press only, without releasing it.
           Should only be used with modifier keys (Control, Alt and Shift).

        :Args:
         - value: The modifier key to send. Values are defined in `Keys` class.
         - element: The element to send keys.
           If None, sends a key to current focused element.

        Example, pressing ctrl+c::

            ActionsChains(driver).key_down(Keys.CONTROL).send_keys('c').key_up(Keys.CONTROL).perform()

        """
        if element:
            self.click(element)
        self.execute(Command.SEND_KEYS_TO_ACTIVE_ELEMENT, { "value": keys_to_typing(value)})
        return self

    def key_up(self, value, element=None):
        """
        Releases a modifier key.

        :Args:
         - value: The modifier key to send. Values are defined in Keys class.
         - element: The element to send keys.
           If None, sends a key to current focused element.

        Example, pressing ctrl+c::

            ActionsChains(driver).key_down(Keys.CONTROL).send_keys('c').key_up(Keys.CONTROL).perform()

        """
        if element:
            self.click(element)
        self.execute(Command.SEND_KEYS_TO_ACTIVE_ELEMENT, {"value": keys_to_typing(value)})
        return self

    def move_by_offset(self, xoffset, yoffset):
        """
        Moving the mouse to an offset from current mouse position.

        :Args:
         - xoffset: X offset to move to, as a positive or negative integer.
         - yoffset: Y offset to move to, as a positive or negative integer.
        """
        self.execute(Command.MOVE_TO, {
            'xoffset': int(xoffset),
            'yoffset': int(yoffset)
        })
        return self

    def move_to_element(self, to_element):
        """
        Moving the mouse to the middle of an element.

        :Args:
         - to_element: The WebElement to move to.
        """
        self.execute(Command.MOVE_TO, {'element': to_element.id})
        return self

    def move_to_element_with_offset(self, to_element, xoffset, yoffset):
        """
        Move the mouse by an offset of the specified element.
           Offsets are relative to the top-left corner of the element.

        :Args:
         - to_element: The WebElement to move to.
         - xoffset: X offset to move to.
         - yoffset: Y offset to move to.
        """
        self.execute(Command.MOVE_TO, {
            'element': to_element.id,
            'xoffset': int(xoffset),
            'yoffset': int(yoffset)
        })
        return self

    def release(self, on_element=None):
        """
        Releasing a held mouse button on an element.

        :Args:
         - on_element: The element to mouse up.
           If None, releases on current mouse position.
        """
        if on_element:
            self.move_to_element(on_element)
        self.execute(Command.MOUSE_UP, {})
        return self

    def send_keys(self, *keys_to_send):
        """
        Sends keys to current focused element.

        :Args:
         - keys_to_send: The keys to send.  Modifier keys constants can be found in the
         'Keys' class.
        """
        self.execute(Command.SEND_KEYS_TO_ACTIVE_ELEMENT, {
            'value': keys_to_typing(keys_to_send)
        })
        return self

@six.add_metaclass(abc.ABCMeta)
class TouchActionsBase(object):
    @abc.abstractmethod
    def execute(self, command, kwargs):
        """
        This abstract method needs to be implemented to actually,
        execute the desired commands.

        :param command: The command to run.
        :type command: unicode
        :param kwargs: A dictionary of arguments
        :type kwargs: dict
        """
        pass

    def tap(self, on_element):
        """
        Taps on a given element.

        :Args:
         - on_element: The element to tap.
        """
        self.execute(Command.SINGLE_TAP, {'element': on_element.id})
        return self

    def double_tap(self, on_element):
        """
        Double taps on a given element.

        :Args:
         - on_element: The element to tap.
        """
        self.execute(Command.DOUBLE_TAP, {'element': on_element.id})
        return self

    def tap_and_hold(self, xcoord, ycoord):
        """
        Touch down at given coordinates.

        :Args:
         - xcoord: X Coordinate to touch down.
         - ycoord: Y Coordinate to touch down.
        """
        self.execute(Command.TOUCH_DOWN, {
            'x': int(xcoord),
            'y': int(ycoord)
        })
        return self

    def move(self, xcoord, ycoord):
        """
        Move held tap to specified location.

        :Args:
         - xcoord: X Coordinate to move.
         - ycoord: Y Coordinate to move.
        """
        self.execute(Command.TOUCH_MOVE, {
            'x': int(xcoord),
            'y': int(ycoord)
        })
        return self

    def release(self, xcoord, ycoord):
        """
        Release previously issued tap 'and hold' command at specified location.

        :Args:
         - xcoord: X Coordinate to release.
         - ycoord: Y Coordinate to release.
        """
        self.execute(Command.TOUCH_UP, {
            'x': int(xcoord),
            'y': int(ycoord)
        })
        return self

    def scroll(self, xoffset, yoffset):
        """
        Touch and scroll, moving by xoffset and yoffset.

        :Args:
         - xoffset: X offset to scroll to.
         - yoffset: Y offset to scroll to.
        """
        self.execute(Command.TOUCH_SCROLL, {
            'xoffset': int(xoffset),
            'yoffset': int(yoffset)
        })
        return self

    def scroll_from_element(self, on_element, xoffset, yoffset):
        """
        Touch and scroll starting at on_element, moving by xoffset and yoffset.

        :Args:
         - on_element: The element where scroll starts.
         - xoffset: X offset to scroll to.
         - yoffset: Y offset to scroll to.
        """
        self.execute(Command.TOUCH_SCROLL, {
            'element': on_element.id,
            'xoffset': int(xoffset),
            'yoffset': int(yoffset)
        })
        return self

    def long_press(self, on_element):
        """
        Long press on an element.

        :Args:
         - on_element: The element to long press.
        """
        self.execute(Command.LONG_PRESS, {'element': on_element.id})
        return self

    def flick(self, xspeed, yspeed):
        """
        Flicks, starting anywhere on the screen.

        :Args:
         - xspeed: The X speed in pixels per second.
         - yspeed: The Y speed in pixels per second.
        """
        self.execute(Command.FLICK, {
            'xspeed': int(xspeed),
            'yspeed': int(yspeed)
        })
        return self

    def flick_element(self, on_element, xoffset, yoffset, speed):
        """
        Flick starting at on_element, and moving by the xoffset and yoffset
        with specified speed.

        :Args:
         - on_element: Flick will start at center of element.
         - xoffset: X offset to flick to.
         - yoffset: Y offset to flick to.
         - speed: Pixels per second to flick.
        """
        self.execute(Command.FLICK, {
            'element': on_element.id,
            'xoffset': int(xoffset),
            'yoffset': int(yoffset),
            'speed': int(speed)
        })
        return self
