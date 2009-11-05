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
import urllib
import utils
from ..common.exceptions import ErrorInResponseException
from ..common.exceptions import NoSuchElementException

class WebElement(object):
    """Represents an HTML element.
    
    Generally, all interesting operations to do with interacting with a page
    will be performed through this interface."""
    def __init__(self, parent, id_):
        self._parent = parent
        self._id = id_

    def get_text(self):
        """Gets the text of the element."""
        return self._get("text")

    def click(self):
        """Clicks the element."""
        self._post("click", {"id": self.id})

    def submit(self):
        """Submits a form."""
        self._post("submit", {"id": self.id})

    def get_value(self):
        """Gets the value of the element's value attribute."""
        return self._get("value")

    def clear(self):
        """Clears the text if it's a text entry element."""
        self._post("clear", {"id": self.id})

    def get_attribute(self, name):
        """Gets the attribute value."""
        return self._get("attribute/%s" % name)

    def toggle(self):
        """Toggles the element state."""
        self._post("toggle", {"id": self.id})

    def is_selected(self):
        """Whether the element is selected."""
        return self._get("selected")

    def set_selected(self):
        """Selects an elmeent."""
        self._post("selected", {"id": self.id})

    def is_enabled(self):
        """Whether the element is enabled."""
        return self._get("enabled")
        
    def is_displayed(self):
        """Whether the element would be visible to a user"""
        return self._get("displayed")

    def find_element_by_id(self, id_):
        """Finds element by id."""
        return self._get_elem_by("id", id_)

    def find_element_by_name(self, name):
        """Find element by name."""
        return self._get_elem_by("name", name)

    def find_element_by_link_text(self, link_text):
        """Finds element by link text."""
        return self._get_elem_by("link text", link_text)

    def find_element_by_xpath(self, xpath):
        """Finds element by xpath."""
        return self._get_elem_by("xpath", xpath)

    def find_elements_by_xpath(self, xpath):
        """Finds elements within the elements by xpath."""
        resp = self._post("elements/xpath",
                          {"using": "xpath", "value": xpath})
        elems = []
        for token in resp:
            elems.append(self._get_elem(token))
        return elems

    def send_keys(self, *value):
        """Simulates typing into the element."""
        self._post("value", {"id": self.id, "value":value})

    @property
    def parent(self):
        return self._parent

    @property
    def id(self):
        return self._id

    def _get(self, path, *params):
        """Sends the command using http GET method."""
        return utils.return_value_if_exists(
            utils.get_root_parent(self).conn.get(
                ("element/%s/" % self.id) + path, *params))

    def _post(self, path, *params):
        """Sends the command using http POST method."""
        return utils.return_value_if_exists(
            utils.get_root_parent(self).conn.post(
                ("element/%s/" % self.id) + path, *params))

    def _get_elem(self, resp_value):
        """Creates a WebElement from a response token."""
        return WebElement(self, resp_value.split("/")[1])

    def _get_elem_by(self, by, value):
        try:
            resp = self._post(urllib.quote("element/%s" % by),
                              {"using": by, "value": value})
            if not resp:
                raise NoSuchElementException()
            return self._get_elem(resp[0])
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)
