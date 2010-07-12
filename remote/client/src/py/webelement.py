# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
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

"""WebElement implementation."""
from command import Command

from selenium.common.exceptions import NoSuchAttributeException

class WebElement(object):
    """Represents an HTML element.

    Generally, all interesting operations to do with interacting with a page
    will be performed through this interface."""
    def __init__(self, parent, id_):
        self._parent = parent
        self._id = id_

    def get_text(self):
        """Gets the text of the element."""
        return self._execute(Command.GET_ELEMENT_TEXT)['value']

    def click(self):
        """Clicks the element."""
        self._execute(Command.CLICK_ELEMENT)

    def submit(self):
        """Submits a form."""
        self._execute(Command.SUBMIT_ELEMENT)

    def get_value(self):
        """Gets the value of the element's value attribute."""
        return self._execute(Command.GET_ELEMENT_VALUE)['value']

    def clear(self):
        """Clears the text if it's a text entry element."""
        self._execute(Command.CLEAR_ELEMENT)

    def get_attribute(self, name):
        """Gets the attribute value."""
        try:
            resp = self._execute(Command.GET_ELEMENT_ATTRIBUTE, {'name':name})
            return str(resp['value'])
        # FIXME: This is a hack around selenium server bad response, remove this
        #        code when it's fixed
        except AssertionError, e:
            raise NoSuchAttributeException(name)

    def toggle(self):
        """Toggles the element state."""
        self._execute(Command.TOGGLE_ELEMENT)

    def is_selected(self):
        """Whether the element is selected."""
        return self._execute(Command.IS_ELEMENT_SELECTED)['value']

    def set_selected(self):
        """Selects an elmeent."""
        self._execute(Command.SET_ELEMENT_SELECTED)

    def is_enabled(self):
        """Whether the element is enabled."""
        return self._execute(Command.IS_ELEMENT_ENABLED)['value']

    def is_displayed(self):
        """Whether the element would be visible to a user"""
        return self._execute(Command.IS_ELEMENT_DISPLAYED)['value']

    def find_element_by_id(self, id_):
        """Finds element by id."""
        return self._get_elem_by("id", id_)

    def find_elements_by_id(self, id_):
        return self._get_elems_by("id", id_)

    def find_element_by_name(self, name):
        """Find element by name."""
        return self._get_elem_by("name", name)

    def find_elements_by_name(self, name):
        return self._get_elems_by("name", name)

    def find_element_by_link_text(self, link_text):
        """Finds element by link text."""
        return self._get_elem_by("link text", link_text)

    def find_elements_by_link_text(self, link_text):
        return self._get_elems_by("link text", link_text)

    def find_element_by_partial_link_text(self, link_text):
        return self._get_elem_by("partial link text", link_text)

    def find_elements_by_partial_link_text(self, link_text):
        return self._get_elems_by("partial link text", link_text)

    def find_element_by_tag_name(self, name):
        return self._get_elem_by("tag name", name)

    def find_elements_by_tag_name(self, name):
        return self._get_elems_by("tag name", name)

    def find_element_by_xpath(self, xpath):
        """Finds element by xpath."""
        return self._get_elem_by("xpath", xpath)

    def find_elements_by_xpath(self, xpath):
        """Finds elements within the elements by xpath."""
        return self._get_elems_by("xpath", xpath)

    def find_element_by_class_name(self, name):
        """Finds an element by their class name."""
        return self._get_elem_by("class name", name)

    def find_elements_by_class_name(self, name):
        """Finds elements by their class name."""
        return self._get_elems_by("class name", name)

    def send_keys(self, *value):
        """Simulates typing into the element."""
        self._execute(Command.SEND_KEYS_TO_ELEMENT, {'value':value})

    @property
    def parent(self):
        return self._parent

    @property
    def id(self):
        return self._id

    def _execute(self, command, params=None):
        """Executes a command against the underlying HTML element.

        Args:
          command: The name of the command to execute as a string.
          params: A dictionary of named parameters to send with the command.

        Returns:
          The command's JSON response loaded into a dictionary object.
        """
        if not params:
            params = {}
        params['id'] = self._id
        return self._parent._execute(command, params)

    def _get_elem_by(self, by, value):
        return self._execute(Command.FIND_CHILD_ELEMENT,
                             {"using": by, "value": value})['value']

    def _get_elems_by(self, by, value):
        return self._execute(Command.FIND_CHILD_ELEMENTS,
                             {"using": by, "value": value})['value']
