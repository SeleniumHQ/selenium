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

import logging
import time
from webdriver_common.exceptions import ErrorInResponseException
from webdriver_common.exceptions import InvalidSwitchToTargetException
from webdriver_firefox.webelement import WebElement
from webdriver_firefox.firefoxlauncher import FirefoxLauncher
from webdriver_firefox.extensionconnection import ExtensionConnection
from webdriver_firefox import utils


class WebDriver(object):
    """The main interface to use for testing,
    which represents an idealised web browser."""
    def __init__(self, profile_name="WebDriver"):
        FirefoxLauncher().launch_browser(profile_name)
        self._conn = ExtensionConnection()
        self._conn.connect()

    def execute_script(self, script, *args):
        """Executes arbitrary javascript.
        For WebElement argument, the format is:
        execute_script("argument[0].value='cheese'", elem)
        """
        converted_args = []
        for arg in args:
            if type(arg) == WebElement:
                converted_args.append({"type": "ELEMENT", "value": arg.id})
            else:
                converted_args.append({"type": "STRING", "value": arg})
        resp = self._conn.driver_command("executeScript", script,
                                         converted_args)

        if "NULL" == resp["resultType"]:
            pass
        elif "ELEMENT" == resp["resultType"]:
            return WebElement(self, resp["response"])
        else:
            return resp["response"]

    def get(self, url):
        """Loads a web page in the current browser."""
        self._command("get", url)

    def get_current_url(self):
        """Gets the current url."""
        return self._command("getCurrentUrl")

    def get_title(self):
        """Gets the title of the current page."""
        return self._command("title")

    def find_element_by_xpath(self, xpath):
        """Finds an element by xpath."""
        try:
            elem_id = self._command("selectElementUsingXPath", xpath)
            elem = WebElement(self, elem_id)
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)
        return elem

    def find_element_by_link_text(self, link):
        """Finds an element by its link text.

        throws NoSuchElementException when no element is found 
        with the link text.
        """
        try:
            elem_id = self._command("selectElementUsingLink", link)
            elem = WebElement(self, elem_id)
            return elem
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def find_elements_by_link_text(self, link):
        """Finds all elements with the same link text.

        throws NoSuchElementException when no element is found 
        with the link text.
        """
        try:
            elem_id_list = self._command("selectElementsUsingLink", link)
            elem_list = []
            for elem_id in elem_id_list.split(","):
                elem = WebElement(self, elem_id)
                elem_list.append(elem)
            return elem_list
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def find_element_by_id(self, id_):
        """Finds an element by its id."""
        try:
            return self.find_element_by_xpath("//*[@id=\"%s\"]" % id_)
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def find_element_by_name(self, name):
        """Finds and element by its name."""
        try:
            return self.find_element_by_xpath("//*[@name=\"%s\"]" % name)
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def find_elements_by_xpath(self, xpath):
        """Finds all the elements for the given xpath query."""
        try:
            elem_ids = self._command("selectElementsUsingXPath", xpath)
            elems = []
            if len(elem_ids):
                for elem_id in elem_ids.split(","):
                    elem = WebElement(self, elem_id)
                    elems.append(elem)
            return elems
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def get_page_source(self):
        """Gets the page source."""
        return self._command("getPageSource")

    def close(self):
        """Closes the current window.
        Quit the browser if it's the last window open.
        """
        if self._conn.is_connectable():
            self._conn.driver_command("close")

    def quit(self):
        """Quits the driver and close every associated window."""
        if self._conn.is_connectable():
            self._conn.driver_command("quit")
            while self._conn.is_connectable():
                logging.debug("waiting to quit")
                time.sleep(1)

    def switch_to_window(self, window_name):
        """Switches focus to a window."""
        resp = self._command("switchToWindow", window_name)
        if not resp or "No window found" in resp:
            raise InvalidSwitchToTargetException(
                "Window %s not found" % window_name)
        self._conn.context = resp
        
    def get_current_window_handle(self):
        handle = self._command("getCurrentWindowHandle")
        assert "," not in handle, "there should be only one current handle"

    def get_window_handles(self):
        return filter(lambda handle: handle,
                      self._command("getAllWindowHandles").split(","))

    def switch_to_frame(self, index_or_name):
        """Switches focus to a frame by index or name."""
        self._command("switchToFrame", str(index_or_name))

    def back(self):
        """Goes back in browser history."""
        self._command("goBack")

    def forward(self):
        """Goes forward in browser history."""
        self._command("goForward")

    def _command(self, cmd, *args):
        """Forward command on to the extension connection."""
        return self._conn.driver_command(cmd, *args)["response"]

    @property
    def conn(self):
        return self._conn
