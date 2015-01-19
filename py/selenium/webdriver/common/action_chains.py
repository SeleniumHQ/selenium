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
The ActionChains implementation,
"""
from __future__ import absolute_import


class ActionChains(object):
    """
    ActionChains are a way to automate low level interactions such as 
    mouse movements, mouse button actions, key press, and context menu interactions.
    This is useful for doing more complex actions like hover over and drag and drop. 

    Generate user actions.
       When you call methods for actions on the ActionChains object, 
       the actions are stored in a queue in the ActionChains object. 
       When you call perform(), the events are fired in the order they 
       are queued up.

    ActionChains can be used in a chain pattern::

        menu = driver.find_element_by_css_selector(".nav")
        hidden_submenu = driver.find_element_by_css_selector(".nav #submenu1")

        ActionChains(driver).move_to_element(menu).click(hidden_submenu).perform()

    Or actions can be queued up one by one, then performed.::

        menu = driver.find_element_by_css_selector(".nav")
        hidden_submenu = driver.find_element_by_css_selector(".nav #submenu1")

        actions = ActionChains(driver)
        actions.move_to_element(menu)
        actions.click(hidden_submenu)
        actions.perform()

    Either way, the actions are performed in the order they are called, one after 
    another.
    """

    def __init__(self, driver):
        """
        Creates a new ActionChains.

        :Args:
         - driver: The WebDriver instance which performs user actions.
        """
        self._driver = driver
        self._actions = []

    def execute(self, command, kwargs):
        self._actions.append(lambda: self._driver.execute(command, kwargs))

    def perform(self):
        """
        Performs all stored actions.
        """
        for action in self._actions:
            action()

    def send_keys_to_element(self, element, *keys_to_send):
        """
        Sends keys to an element.

        :Args:
         - element: The element to send keys.
         - keys_to_send: The keys to send.  Modifier keys constants can be found in the
         'Keys' class.
        """
        self._actions.append(lambda: element.send_keys(*keys_to_send))
        return self


    # Context manager so ActionChains can be used in a 'with .. as' statements.
    def __enter__(self):
        return self # Return created instance of self.

    def __exit__(self, _type, _value, _traceback):
        pass
