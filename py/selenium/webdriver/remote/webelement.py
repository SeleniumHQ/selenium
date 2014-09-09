# Copyright 2008-2014 Software freedom conservancy
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

import hashlib
import os
import zipfile
try:
    from StringIO import StringIO as IOStream
except ImportError:  # 3+
    from io import BytesIO as IOStream
import base64

from .command import Command
from selenium.common.exceptions import WebDriverException
from selenium.common.exceptions import InvalidSelectorException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys


try:
    str = basestring
except NameError:
    pass


class WebElement(object):
    """Represents a DOM element.

    Generally, all interesting operations to do with interacting with a
    document will be performed through this interface.

    All method calls will do a freshness check to ensure that the element
    reference is still valid.  This essentially determines whether or not the
    element is still attached to the DOM.  If this test fails, then an
    `StaleElementReferenceException` is thrown, and all future calls to this
    instance will fail."""

    def __init__(self, parent, id_):
        self._parent = parent
        self._id = id_

    @property
    def tag_name(self):
        """Gets this element's tagName property."""
        return self._execute(Command.GET_ELEMENT_TAG_NAME)['value']

    @property
    def text(self):
        """Gets the text of the element."""
        return self._execute(Command.GET_ELEMENT_TEXT)['value']

    def click(self):
        """Clicks the element."""
        self._execute(Command.CLICK_ELEMENT)

    def submit(self):
        """Submits a form."""
        self._execute(Command.SUBMIT_ELEMENT)

    def clear(self):
        """Clears the text if it's a text entry element."""
        self._execute(Command.CLEAR_ELEMENT)

    def get_attribute(self, name):
        """Gets the given attribute or property of the element.

        This method will return the value of the given property if this is set,
        otherwise it returns the value of the attribute with the same name if
        that exists, or None.

        Values which are considered truthy, that is equals "true" or "false",
        are returned as booleans.  All other non-None values are returned as
        strings.  For attributes or properties which does not exist, None is returned.

        :Args:
            - name - Name of the attribute/property to retrieve.

        Example::

            # Check if the "active" CSS class is applied to an element.
            is_active = "active" in target_element.get_attribute("class")"""
        resp = self._execute(Command.GET_ELEMENT_ATTRIBUTE, {'name': name})
        attributeValue = ''
        if resp['value'] is None:
            attributeValue = None
        else:
            attributeValue = resp['value']
            if name != 'value' and attributeValue.lower() in ('true', 'false'):
                attributeValue = attributeValue.lower()
        return attributeValue

    def is_selected(self):
        """Whether the element is selected.

        Can be used to check if a checkbox or radio button is selected.
        """
        return self._execute(Command.IS_ELEMENT_SELECTED)['value']

    def is_enabled(self):
        """Whether the element is enabled."""
        return self._execute(Command.IS_ELEMENT_ENABLED)['value']

    def find_element_by_id(self, id_):
        """Finds element within the child elements of this element.

        :Args:
            - id_ - ID of child element to locate.
        """
        return self.find_element(by=By.ID, value=id_)

    def find_elements_by_id(self, id_):
        """Finds a list of elements within the children of this element
        with the matching ID.

        :Args:
            - id_ - Id of child element to find.
        """
        return self.find_elements(by=By.ID, value=id_)

    def find_element_by_name(self, name):
        """Find element with in this element's children by name.
        :Args:
            - name - name property of the element to find.
        """
        return self.find_element(by=By.NAME, value=name)

    def find_elements_by_name(self, name):
        """Finds a list of elements with in this element's children by name.

        :Args:
            - name - name property to search for.
        """
        return self.find_elements(by=By.NAME, value=name)

    def find_element_by_link_text(self, link_text):
        """Finds element with in this element's children by visible link text.

        :Args:
            - link_text - Link text string to search for.
        """
        return self.find_element(by=By.LINK_TEXT, value=link_text)

    def find_elements_by_link_text(self, link_text):
        """Finds a list of elements with in this element's children by visible link text.

        :Args:
            - link_text - Link text string to search for.
        """
        return self.find_elements(by=By.LINK_TEXT, value=link_text)

    def find_element_by_partial_link_text(self, link_text):
        """Finds element with in this element's children by parial visible link text.

        :Args:
            - link_text - Link text string to search for.
        """
        return self.find_element(by=By.PARTIAL_LINK_TEXT, value=link_text)

    def find_elements_by_partial_link_text(self, link_text):
        """Finds a list of elements with in this element's children by link text.

        :Args:
            - link_text - Link text string to search for.
        """
        return self.find_elements(by=By.PARTIAL_LINK_TEXT, value=link_text)

    def find_element_by_tag_name(self, name):
        """Finds element with in this element's children by tag name.

        :Args:
            - name - name of html tag (eg: h1, a, span)
        """
        return self.find_element(by=By.TAG_NAME, value=name)

    def find_elements_by_tag_name(self, name):
        """Finds a list of elements with in this element's children by tag name.

        :Args:
            - name - name of html tag (eg: h1, a, span)
        """
        return self.find_elements(by=By.TAG_NAME, value=name)

    def find_element_by_xpath(self, xpath):
        """Finds element by xpath.

        :Args:
            xpath - xpath of element to locate.  "//input[@class='myelement']"

        Note: The base path will be relative to this element's location.

        This will select the first link under this element.::

            myelement.find_elements_by_xpath(".//a")

        However, this will select the first link on the page.

            myelement.find_elements_by_xpath("//a")

        """
        return self.find_element(by=By.XPATH, value=xpath)

    def find_elements_by_xpath(self, xpath):
        """Finds elements within the elements by xpath.

        :Args:
            - xpath - xpath locator string.

        Note: The base path will be relative to this element's location.

        This will select all links under this element.::

            myelement.find_elements_by_xpath(".//a")

        However, this will select all links in the page itself.

            myelement.find_elements_by_xpath("//a")
        """
        return self.find_elements(by=By.XPATH, value=xpath)

    def find_element_by_class_name(self, name):
        """Finds an element within this element's children by their class name.

        :Args:
            - name - class name to search on.
        """
        return self.find_element(by=By.CLASS_NAME, value=name)

    def find_elements_by_class_name(self, name):
        """Finds a list of elements within children of this element by their class name.

        :Args:
            - name - class name to search on.
        """
        return self.find_elements(by=By.CLASS_NAME, value=name)

    def find_element_by_css_selector(self, css_selector):
        """Find and return an element that's a child of this element by CSS selector.

        :Args:
            - css_selector - CSS selctor string, ex: 'a.nav#home'
        """
        return self.find_element(by=By.CSS_SELECTOR, value=css_selector)

    def find_elements_by_css_selector(self, css_selector):
        """Find and return list of multiple elements within the children of this
        element by CSS selector.

        :Args:
            - css_selector - CSS selctor string, ex: 'a.nav#home'
        """
        return self.find_elements(by=By.CSS_SELECTOR, value=css_selector)

    def send_keys(self, *value):
        """Simulates typing into the element.

        :Args:
            - value - A string for typing, or setting form fields.  For setting
            file inputs, this could be a local file path.

        Use this to send simple key events or to fill out form fields::

            form_textfield = driver.find_element_by_name('username')
            form_textfield.send_keys("admin")

        This can also be used to set file inputs.::

            file_input = driver.find_element_by_name('profilePic')
            file_input.send_keys("path/to/profilepic.gif")
            # Generally it's better to wrap the file path in one of the methods
            # in os.path to return the actual path to support cross OS testing.
            # file_input.send_keys(os.path.abspath("path/to/profilepic.gif"))

        """
        # transfer file to another machine only if remote driver is used
        # the same behaviour as for java binding
        if self.parent._is_remote:
            local_file = LocalFileDetector.is_local_file(*value)
            if local_file is not None:
                value = self._upload(local_file)

        typing = []
        for val in value:
            if isinstance(val, Keys):
                typing.append(val)
            elif isinstance(val, int):
                val = val.__str__()
                for i in range(len(val)):
                    typing.append(val[i])
            else:
                for i in range(len(val)):
                    typing.append(val[i])
        self._execute(Command.SEND_KEYS_TO_ELEMENT, {'value': typing})

    # RenderedWebElement Items
    def is_displayed(self):
        """Whether the element would be visible to a user
        """
        return self._execute(Command.IS_ELEMENT_DISPLAYED)['value']

    @property
    def location_once_scrolled_into_view(self):
        """CONSIDERED LIABLE TO CHANGE WITHOUT WARNING. Use this to discover where on the screen an
        element is so that we can click it. This method should cause the element to be scrolled
        into view.

        Returns the top lefthand corner location on the screen, or None if the element is not visible"""
        return self._execute(Command.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW)['value']

    @property
    def size(self):
        """ Returns the size of the element """
        size = self._execute(Command.GET_ELEMENT_SIZE)['value']
        new_size = {}
        new_size["height"] = size["height"]
        new_size["width"] = size["width"]
        return new_size

    def value_of_css_property(self, property_name):
        """ Returns the value of a CSS property """
        return self._execute(Command.GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
                        {'propertyName': property_name})['value']

    @property
    def location(self):
        """ Returns the location of the element in the renderable canvas"""
        old_loc = self._execute(Command.GET_ELEMENT_LOCATION)['value']
        new_loc = {"x": old_loc['x'],
                   "y": old_loc['y']}
        return new_loc

    @property
    def rect(self):
        """ Returns a dictionary with the size and location of the element"""
        return self._execute(Command.GET_ELEMENT_RECT)['value']

    @property
    def parent(self):
        """ Returns parent element is available. """
        return self._parent

    @property
    def id(self):
        """ Returns internal id used by selenium.

        This is mainly for internal use.  Simple use cases such as checking if 2 webelements
        refer to the same element, can be done using '=='::

            if element1 == element2:
                print("These 2 are equal")

        """
        return self._id

    def __eq__(self, element):
        if self._id == element.id:
            return True
        else:
            return self._execute(Command.ELEMENT_EQUALS, {'other': element.id})['value']

    # Private Methods
    def _execute(self, command, params=None):
        """Executes a command against the underlying HTML element.

        Args:
          command: The name of the command to _execute as a string.
          params: A dictionary of named parameters to send with the command.

        Returns:
          The command's JSON response loaded into a dictionary object.
        """
        if not params:
            params = {}
        params['id'] = self._id
        return self._parent.execute(command, params)

    def find_element(self, by=By.ID, value=None):
        if not By.is_valid(by) or not isinstance(value, str):
            raise InvalidSelectorException("Invalid locator values passed in")

        return self._execute(Command.FIND_CHILD_ELEMENT,
                             {"using": by, "value": value})['value']

    def find_elements(self, by=By.ID, value=None):
        if not By.is_valid(by) or not isinstance(value, str):
            raise InvalidSelectorException("Invalid locator values passed in")

        return self._execute(Command.FIND_CHILD_ELEMENTS,
                             {"using": by, "value": value})['value']

    def __hash__(self):
        return int(hashlib.md5(self._id.encode('utf-8')).hexdigest(), 16)

    def _upload(self, filename):
        fp = IOStream()
        zipped = zipfile.ZipFile(fp, 'w', zipfile.ZIP_DEFLATED)
        zipped.write(filename, os.path.split(filename)[1])
        zipped.close()
        content = base64.encodestring(fp.getvalue())
        if not isinstance(content, str):
            content = content.decode('utf-8')
        try:
            return self._execute(Command.UPLOAD_FILE,
                            {'file': content})['value']
        except WebDriverException as e:
            if "Unrecognized command: POST" in e.__str__():
                return filename
            elif "Command not found: POST " in e.__str__():
                return filename
            elif '{"status":405,"value":["GET","HEAD","DELETE"]}' in e.__str__():
                return filename
            else:
                raise e

class LocalFileDetector(object):

    @classmethod
    def is_local_file(cls, *keys):
        file_path = ''
        typing = []
        for val in keys:
            if isinstance(val, Keys):
                typing.append(val)
            elif isinstance(val, int):
                val = val.__str__()
                for i in range(len(val)):
                    typing.append(val[i])
            else:
                for i in range(len(val)):
                    typing.append(val[i])
        file_path = ''.join(typing)

        if file_path is '':
            return None

        try:
            if os.path.isfile(file_path):
                return file_path
        except:
            pass
        return None

