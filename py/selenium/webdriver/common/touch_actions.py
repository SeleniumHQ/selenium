""""
Touch Actions implementation
"""

from selenium.webdriver.remote.command import Command

class TouchActions(object):
    """
    Generate touch actions. Works like ActionChains; actions are stored in the
    TouchActions object and are fired with perform().
    """

    def __init__(self, driver):
        """
        Creates a new TouchActions object.

        Args:
            -driver: The WebDriver instance, which must be touchscreen enabled.
        """
        self._driver = driver
        self._actions = []

    def perform(self):
        """
        Performs all stored actions.
        """
        for action in self._actions:
            action()

    def tap(self, on_element):
        """
        Taps on a given element.

        Args:
            -element: The element to tap.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.SINGLE_TAP, {'element': on_element.id}))
        return self

    def double_tap(self, on_element):
        """
        Double taps on a given element.

        Args:
            -element: The element to tap.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.DOUBLE_TAP, {'element': on_element.id}))
        return self

    def tap_and_hold(self, xcoord, ycoord):
        """
        Tap and hold a given element.

        Args:
            -xcoord: X Coordinates.
            -ycoord: Y Coordinates.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.TOUCH_DOWN, {
                'x': xcoord,
                'y': ycoord}))
        return self

    def move(self, xcoord, ycoord):
        """
        Move held tap to specified location.

        Args:
            -xcoord: X Coordinates.
            -ycoord: Y Coordinates.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.TOUCH_MOVE, {
                'x': xcoord,
                'y': ycoord}))
        return self

    def release(self, xcoord, ycoord):
        """
        Release previously issued tap and hold command, at specified location.

        Args:
            -xcoord: X Coordinates.
            -ycoord: Y Coordinates.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.TOUCH_UP, {
                'x': xcoord,
                'y': ycoord}))
        return self

    def scroll(self, xoffset, yoffset):
        """
        Touch and scroll, moving by xoffset and yoffset.

        Args:
            -xoffset: X offset to move to.
            -yoffset: Y offset to move to.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.TOUCH_SCROLL, {
                'xoffset': xoffset,
                'yoffset': yoffset}))
        return self

    def scroll_from_element(self, on_element, xoffset, yoffset):
        """
        Touch and scroll starting at on_element, moving by xoffset and yoffset.

        Args:
            -on_element: Element where scroll starts.
            -xoffset: X offset to move to.
            -yoffset: Y offset to move to.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.TOUCH_SCROLL, {
                'element': on_element.id,
                'xoffset': xoffset,
                'yoffset': yoffset}))
        return self

    def long_press(self, on_element):
        """
        Long press on an element.

        Args:
            -on_element: The element to long press.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.LONG_PRESS, {'element': on_element.id}))
        return self

    def flick(self, xspeed, yspeed):
        """
        Flicks, starting anywhere on the screen.

        Args:
            -xspeed: The X speed in pixels per second.
            -yspeed: The Y speed in pixels per second.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.FLICK, {
                'xSpeed': xspeed,
                'ySpeed': yspeed}))
        return self

    def flick_element(self, on_element, xoffset, yoffset, speed):
        """
        Flick starting at on_element, and moving by the xoffset and yoffset.

        Args:
            -on_element: Flick will start at center of element.
            -xoffset: X offset to flick to.
            -yoffset: Y offset to flick to.
            -speed: Pixels per second to flick.
        """
        self._actions.append(lambda:
            self._driver.execute(Command.FLICK, {
                'element': on_element.id,
                'xoffset': xoffset,
                'yoffset': yoffset,
                'speed': speed}))
        return self
