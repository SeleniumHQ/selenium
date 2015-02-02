"""
The Touch Actions implementation
"""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

from selenium.webdriver.common.actions_base import TouchActionsBase


class TouchActions(TouchActionsBase):
    """
    Generate touch actions. Works like ActionChains; actions are stored in the
    TouchActions object and are fired with perform().
    """

    def __init__(self, driver):
        """
        Creates a new TouchActions object.

        :Args:
         - driver: The WebDriver instance which performs user actions.
           It should be with touchscreen enabled.
        """
        self._driver = driver
        self._actions = []

    def perform(self):
        """
        Performs all stored actions.
        """
        for action in self._actions:
            action()

    def execute(self, command, kwargs):
        self._actions.append(lambda: self._driver.execute(command, kwargs))

    # Context manager so TouchActions can be used in a 'with .. as' statements.
    def __enter__(self):
        return self # Return created instance of self.

    def __exit__(self, _type, _value, _traceback):
        pass