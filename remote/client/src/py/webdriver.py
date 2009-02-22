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

"""The WebDriver implementation."""

from webdriver_common.exceptions import ErrorInResponseException
from webdriver_common.exceptions import InvalidSwitchToTargetException
from webdriver_remote import utils
from webdriver_remote.webelement import WebElement
from webdriver_remote.remote_connection import RemoteConnection


class WebDriver(object):
    def __init__(self, remote_server_addr, browser_name, platform):
        self._conn = RemoteConnection(
            remote_server_addr, browser_name, platform)

    def get(self, url):
        """Loads a web page in the current browser."""
        self._post("url", url)

    def get_title(self):
        """Gets the title of the current page."""
        resp = self._get("title")
        return resp

    def find_element_by_id(self, id_):
        """Finds element by id."""
        try:
            resp = self._post("element", "id", id_)
            return self._get_elem(resp[0])
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def find_elements_by_xpath(self, xpath):
        """Finds multiple elements by xpath."""
        resp = self._post("elements", "xpath", xpath)
        elems = []
        for token in resp:
            elems.append(self._get_elem(token))
        return elems

    def execute_script(self, script, *args):
        converted_args = []
        for arg in args:
            if type(arg) == WebElement:
                converted_args.append({"type": "ELEMENT", "value": arg.id})
            else:
                converted_args.append({"type": "STRING", "value": arg})
        resp = self._post("execute", script, converted_args)

        if "NULL" == resp["type"]:
            pass
        elif "ELEMENT" == resp["type"]:
            return self._get_elem(resp["value"])
        else:
            return resp["value"]

    def get_current_url(self):
        """Gets the current url."""
        return self._get("url")

    def find_element_by_xpath(self, xpath):
        """Finds an element by xpath."""
        try:
            return self._get_elem(self._post("element", "xpath", xpath)[0])
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def find_element_by_link_text(self, link):
        """Finds an element by its link text.

        Returns None if the element is not a link.
        """
        try:
            return self._get_elem(self._post("element", "link text", link)[0])
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def find_element_by_name(self, name):
        """Finds and element by its name."""
        try:
            return self._get_elem(self._post("element", "name", name)[0])
        except ErrorInResponseException, ex:
            utils.handle_find_element_exception(ex)

    def get_page_source(self):
        """Gets the page source."""
        return self._get("source")

    def close(self):
        """Closes the current window.

        Quit the browser if it's the last window open.
        """
        self._delete("window")

    def quit(self):
        """Quits the driver and close every associated window."""
        self._conn.quit()

    def switch_to_window(self, window_name):
        """Switches focus to a window."""
        resp = self._post("window/%s" % window_name)
        if resp and "No window found" in resp:
            raise InvalidSwitchToTargetException(
                "Window %s not found" % window_name)

    def switch_to_frame(self, index_or_name):
        """Switches focus to a frame by index or name."""
        self._post("frame/%s" % str(index_or_name))

    def back(self):
        """Goes back in browser history."""
        self._post("back")

    def forward(self):
        """Goes forward in browser history."""
        self._post("forward")
    
    @property
    def conn(self):
        return self._conn

    def _get_elem(self, resp_value):
        """Creates a WebElement from a response token."""
        return WebElement(self, resp_value.split("/")[1])

    def _get(self, path, *params):
        """Sends a command to the server using http GET method."""
        return utils.return_value_if_exists(
            self._conn.get(path, *params))

    def _post(self, path, *params):
        """Sends a command to the server using http POST method."""
        return utils.return_value_if_exists(
            self._conn.post(path, *params))

    def _delete(self, path):
        """Sends a command to the server using http DELETE method."""
        self._conn.request("DELETE", path)
