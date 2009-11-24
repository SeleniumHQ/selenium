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

from datetime import datetime
from ..common.exceptions import ErrorInResponseException
from ..common.exceptions import InvalidSwitchToTargetException
from webelement import WebElement
from firefoxlauncher import FirefoxLauncher
from firefox_profile import FirefoxProfile
from extensionconnection import ExtensionConnection
import utils


class WebDriver(object):
    """The main interface to use for testing,
    which represents an idealised web browser."""
    def __init__(self, profile=None, timeout=30):
        """Creates a webdriver instance.
        
        Args:
          profile: a FirefoxProfile object (it can also be a profile name,
                   but the support for that may be removed in future, it is
                   recommended to pass in a FirefoxProfile object)
          timeout: the amount of time to wait for extension socket
        """
        self.browser = FirefoxLauncher()
        if type(profile) == str:
            # This is to be Backward compatible because we used to take a
            # profile name
            profile = FirefoxProfile(name=profile)
        if not profile:
            profile = FirefoxProfile()
        self.browser.launch_browser(profile)
        self._conn = ExtensionConnection(timeout)
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
        resp = self._command("executeScript", script, converted_args)
        if "ELEMENT" == resp["type"]:
            return WebElement(self, resp["value"])
        else:
            return resp["value"]

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
        return self._find_element_by("xpath", xpath)

    def find_element_by_link_text(self, link):
        """Finds an element by its link text.

        throws NoSuchElementException when no element is found 
        with the link text.
        """
        return self._find_element_by("link text", link)

    def find_elements_by_link_text(self, link):
        """Finds all elements with the same link text.

        throws NoSuchElementException when no element is found 
        with the link text.
        """
        return self._find_elements_by("link text", link)

    def find_element_by_partial_link_text(self, text):
        """Finds an element by a segment of its link text

        throws NoSuchElementException when no element is found 
        with the link text.
        """
        return self._find_element_by("partial link text", text)

    def find_elements_by_partial_link_text(self, text):
        """Finds all elements by a segment of the link text.

        throws NoSuchElementException when no element is found 
        with the link text.
        """
        return self._find_elements_by("partial link text", text)

    def find_element_by_id(self, id_):
        """Finds an element by its id."""
        return self._find_element_by("id", id_)

    def find_element_by_name(self, name):
        """Finds and element by its name."""
        return self._find_element_by("name", name)

    def find_elements_by_xpath(self, xpath):
        """Finds all the elements for the given xpath query."""
        return self._find_elements_by("xpath", xpath)

    def find_element_by_tag_name(self, tag_name):
        """Finds and element by its tag name."""
        return self._find_element_by("tag name", tag_name)
    
    def find_elements_by_tag_name(self, tag_name):
        """Finds all the elements with the given tag"""
        return self._find_elements_by("tag name", tag_name)

    def get_page_source(self):
        """Gets the page source."""
        return self._command("getPageSource")

    def close(self):
        """Closes the current window.
        Quit the browser if it's the last window open.
        """
        if self._conn.is_connectable():
            self._conn.driver_command("close")
        self.browser.kill()

    def quit(self):
        """Quits the driver and close every associated window."""
        self._conn.quit()
        self.browser.kill()
            

    def switch_to_active_element(self):
        """Returns the element with focus, or BODY if nothing has focus"""
        return WebElement(self, self._command("switchToActiveElement"))

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
        return handle

    def get_window_handles(self):
        return self._command("getWindowHandles")

    def switch_to_frame(self, index_or_name):
        """Switches focus to a frame by index or name."""
        self._command("switchToFrame", str(index_or_name))

    def back(self):
        """Goes back in browser history."""
        self._command("goBack")

    def forward(self):
        """Goes forward in browser history."""
        self._command("goForward")

    def get_cookies(self):
        """Gets all the cookies."""
        try:
            cookie_response = self._command("getCookie")
        except ErrorInResponseException:
            return []

        #cookie_response is a list of cookies of type unicode
        cookies = []
        for cookie_unicode in cookie_response:
            cookie = self.get_cookie_in_dict(cookie_unicode)
            if cookie:
                cookies.append(cookie)
        return cookies

    def delete_all_cookies(self):
        """Gets the current url."""
        cookies = self.get_cookies()
        for cookie in cookies:
            self.delete_cookie(cookie['name'])

    def delete_cookie(self, cookie_name):
        """Delete a cookie."""
        cookie_arg = "{\"name\" : \"%s\"}" % cookie_name
        self._command("deleteCookie", cookie_arg)

    def get_cookie_in_dict(self, cookie_str):          
        """Convert a cookie in unicode (returned by self._command('getCookie'))
        to a dictionary representation.
        """
        tokens = cookie_str.split(";")
        if len(tokens) > 1:
            name, value = tuple(tokens[0].split("=", 1))
            cookie_dict = dict([tuple(token.split("=", 1))
                                for token in tokens[1:] if token])
            cookie_dict["name"] = name
            cookie_dict["value"] = value
            return cookie_dict

    def add_cookie(self, cookie_dict):
        self._command("addCookie", cookie_dict)

    def save_screenshot(self, png_file):
        """Saves a screenshot of the current page into the given
        file."""
        self._command("saveScreenshot", png_file)

    def _command(self, cmd, *args):
        """Forward command on to the extension connection."""
        return self._conn.driver_command(cmd, *args)["response"]

    @property
    def conn(self):
        return self._conn

    def _find_element_by(self, selector, key):
        try:
          elem_id = self._command("findElement", selector, key)
          return WebElement(self, elem_id)
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def _find_elements_by(self, selector, key):
        try:
            elem_ids = self._command("findElements", selector, key)
            elems = []
            if elem_ids:
                for elem_id in elem_ids:
                    elem = WebElement(self, elem_id)
                    elems.append(elem)
            return elems
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)
