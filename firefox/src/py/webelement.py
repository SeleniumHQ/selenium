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

from ..common.exceptions import ErrorInResponseException
from ..common.exceptions import NoSuchElementException
from extensionconnection import ExtensionConnection
import utils
from ..remote import utils as remote_utils

class WebElement(object):
    """Represents an HTML element.

    Generally, all interesting operations to do with
    interacting with a page will be performed through this interface.
    """
    
    def __init__(self, parent, id_):
        self._parent = parent
        self._conn = ExtensionConnection()
        self._id = id_

    def get_text(self):
        """Gets the inner text of the element."""
        return self._command("getText")

    def click(self):
        """Clicks the element."""
        self._command("click")

    def submit(self):
        """Submits a form."""
        self._command("submit")

    def get_value(self):
        """Gets the value of the element's value attribute."""
        return self._command("getValue")

    def clear(self):
        """Clears the text if it's a text entry element."""
        self._command("clear")

    def get_attribute(self, name):
        """Gets the attribute value."""
        return self._command("getAttribute", name)

    def toggle(self):
        """Toggles the element state."""
        self._command("toggle")

    def is_selected(self):
        """Whether the element is selected."""
        return self._command("isSelected")

    def set_selected(self):
        """Selects an elmeent."""
        self._command("setSelected")

    def is_enabled(self):
        """Whether the element is enabled."""
        if self.get_attribute("disabled"):
            return False
        else:
            # The "disabled" attribute may not exist
            return True
            
    def is_displayed(self):
        """Whether the element would be visible to a user"""
        return self._command("isDisplayed")

    def find_element_by_id(self, id_):
        """Finds element by id."""
        return self._find_element_by("id", id_)

    def find_elements_by_id(self, id_):
        """Finds elements within this element by id."""
        return self._find_elements_by("id", id_)

    def find_element_by_name(self, name):
        """Find element by name."""
        return self._find_element_by("name", name)

    def find_elements_by_name(self, name):
        """Finds all elements by name."""
        return self._find_elements_by("name", name)

    def find_element_by_link_text(self, link_text):
        """Finds element by link text."""
        return self._find_element_by("link text", link_text)

    def find_elements_by_link_text(self, link_text):
        """Finds all elements by link text."""
        return self._find_elements_by("link text", link_text)

    def find_element_by_xpath(self, xpath):
        """Finds element by xpath."""
        return self._find_element_by("xpath", xpath)

    def find_elements_by_xpath(self, xpath):
        """Finds elements within the elements by xpath."""
        return self._find_elements_by("xpath", xpath)

    def find_element_by_tag_name(self, tag_name):
        """Finds the first  element within the elements by tag name."""
        return self._find_element_by("tag name", tag_name)

    def find_elements_by_tag_name(self, tag_name):
        """Finds elements within the elements by tag name."""
        return self._find_elements_by("tag name", tag_name)
    
    def send_keys(self, keys_characters):
        """Simulates typing into the element."""
        self._command("sendKeys", keys_characters)

    @property
    def id(self):
        return self._id

    @property
    def parent(self):
        return self._parent

    def _command(self, cmd, *args):
        return remote_utils.get_root_parent(self).conn.element_command(
            cmd, self._id, *args)['response']

    def _find_element_by(self, selector, key):
        try:
          elem_id = self._command("findChildElement", {
              "id": self._id,
              "using": selector,
              "value": key
          })
          return WebElement(self._parent, elem_id)
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def _find_elements_by(self, selector, key):
        try:
            resp = self._command("findChildElements", {
                "id": self._id,
                "using": selector,
                "value": key
            })
            if not resp:
                raise NoSuchElementException(
                    "Unable to locate element for %s" % key)
            elems = []
            for elem_id in resp:
                elem = WebElement(self._parent, elem_id)
                elems.append(elem)
            return elems
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)
