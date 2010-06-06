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

from command import Command
from selenium.common.exceptions import ErrorInResponseException
from selenium.common.exceptions import InvalidSwitchToTargetException
from selenium.common.exceptions import NoSuchElementException
from errorhandler import ErrorHandler
import logging
import utils
from webelement import WebElement
from remote_connection import RemoteConnection

class WebDriver(object):
    """Controls a browser by sending commands to a remote server.

    This server is expected to be running the WebDriver wire protocol as defined
    here:
      http://code.google.com/p/selenium/wiki/JsonWireProtocol

    Attributes:
      command_executor - The command.CommandExecutor object used to execute
          commands.
      error_handler - errorhandler.ErrorHandler object used to verify that the
          server did not return an error.
      session_id - The session ID to send with every command.
      capabilities - A dictionary of capabilities of the underlying browser for
          this instance's session.
    """

    def __init__(self, command_executor, browser_name, platform, version='',
                 javascript_enabled=True):
        """Create a new driver that will issue commands using the wire protocol.

        Args:
          command_executor - Either a command.CommandExecutor object or a string
              that specifies the URL of a remote server to send commands to.
          browser_name - A string indicating which browser to request a new
              session for from the remote server.  Should be one of
              {mobile safari|firefox|internet explorer|htmlunit|chrome}.
          platform - A string indicating the desired platform to request from
              the remote server. Should be one of
              {WINDOWS|XP|VISTA|MAC|LINUX|UNIX|ANY}.
          version - A string indicating a specific browser version to request,
              or an empty string ot use any available browser. Defaults to the
              empty string.
          javascript_enabled - Whether the requested browser should support
              JavaScript.  Defaults to True.
        """
        self.command_executor = command_executor
        if type(self.command_executor) is str:
            self.command_executor = RemoteConnection(command_executor)

        self.session_id = None
        self.capabilities = {}
        self.error_handler = ErrorHandler()

        self.start_client()
        self.start_session(browser_name=browser_name,
                           platform=platform,
                           version=version,
                           javascript_enabled=javascript_enabled)
        
    @property
    def name(self):
        """Returns the name of the underlying browser for this instance."""
        if 'browserName' in self.capabilities:
            return self.capabilities['browserName']
        else:
            raise KeyError('browserName not specified in session capabilities')

    def start_client(self):
        """Called before starting a new session.

        This method may be overridden to define custom startup behavior.
        """
        pass

    def stop_client(self):
        """Called after executing a quit command.

        This method may be overridden to define custom shutdown behavior.
        """
        pass

    def start_session(self, browser_name, platform=None, version=None,
                      javascript_enabled=False):
        """Creates a new session with the desired capabilities.

        Args:
          browser_name: The name of the browser to request.
          version: Which browser version to request.
          platform: Which platform to request the browser on.
          javascript_enabled: Whether the new session should support JavaScript.
        """
        response =  self._execute(Command.NEW_SESSION, {
            'desiredCapabilities': {
                'browserName': browser_name,
                'platform': platform or 'ANY',
                'version': version or '',
                'javascriptEnabled': javascript_enabled
            }
        })
        self.session_id = response['sessionId']
        self.capabilities = response['value']

    def _wrap_value(self, value):
        if isinstance(value, dict):
            converted = {}
            for key, val in value.items():
              converted[key] = self._wrap_value(val)
            return converted
        elif isinstance(value, WebElement):
            return {'ELEMENT': value.id}
        elif isinstance(value, list):
            return list(self._wrap_value(item) for item in value)
        else:
            return value
            
    def create_web_element(self, element_id):
        return WebElement(self, element_id)

    def _unwrap_value(self, value):
        if isinstance(value, dict) and 'ELEMENT' in value:
            return self.create_web_element(value['ELEMENT'])
        elif isinstance(value, list):
            return list(self._unwrap_value(item) for item in value)
        else:
            return value

    def _execute(self, driver_command, params=None):
        """Sends a command to be executed by a command.CommandExecutor.

        Args:
          driver_command: The name of the command to execute as a string.
          params: A dictionary of named parameters to send with the command.

        Returns:
          The command's JSON response loaded into a dictionary object.
        """
        if not params:
            params = {'sessionId': self.session_id}
        elif 'sessionId' not in params:
            params['sessionId'] = self.session_id

        params = self._wrap_value(params)
        response = self.command_executor.execute(driver_command, params)
        if response:
            self.error_handler.check_response(response)
            response['value'] = self._unwrap_value(
                response.get('value', None))
            return response
        # If the server doesn't send a response, assume the command was
        # a success
        return {'success': 0, 'value': None}

    def get(self, url):
        """Loads a web page in the current browser."""
        self._execute(Command.GET, {'url': url})

    def get_title(self):
        """Gets the title of the current page."""
        resp = self._execute(Command.GET_TITLE)
        return resp['value']

    def find_element_by_id(self, id_):
        """Finds element by id."""
        return self._find_element_by("id", id_)

    def find_elements_by_xpath(self, xpath):
        """Finds multiple elements by xpath."""
        return self._find_elements_by("xpath", xpath)

    def find_element_by_xpath(self, xpath):
        """Finds an element by xpath."""
        return self._find_element_by("xpath", xpath)

    def find_element_by_link_text(self, link_text):
        """Finds an element by its link text."""
        return self._find_element_by("link text", link_text)
        
    def find_element_by_partial_link_text(self, link_text):
        """Finds an element by a partial match of its link text."""
        return self._find_element_by("partial link text", link_text)

    def find_elements_by_partial_link_text(self, link_text):
        """Finds elements by a partial match of their link text."""
        return self._find_elements_by("partial link text", link_text)

    def find_element_by_name(self, name):
        """Finds an element by its name."""
        return self._find_element_by("name", name)

    def find_elements_by_name(self, name):
        """Finds elements by their name."""
        return self._find_elements_by("name", name)
        
    def find_element_by_tag_name(self, name):
        """Finds an element by its tag name."""
        return self._find_element_by("tag name", name)
        
    def find_elements_by_tag_name(self, name):
        """Finds elements by their tag name."""
        return self._find_elements_by("tag name", name)

    def execute_script(self, script, *args):
        if len(args) == 1:
            converted_args = args[0]
        else:
            converted_args = list(args)
        converted_args = list(args)
        return self._execute(
            Command.EXECUTE_SCRIPT,
            {'script': script, 'args':converted_args})['value']

    def get_current_url(self):
        """Gets the current url."""
        return self._execute(Command.GET_CURRENT_URL)['value']

    def get_page_source(self):
        """Gets the page source."""
        return self._execute(Command.GET_PAGE_SOURCE)['value']

    def close(self):
        """Closes the current window."""
        self._execute(Command.CLOSE)

    def quit(self):
        """Quits the driver and close every associated window."""
        try:
            self._execute(Command.QUIT)
        finally:
            self.stop_client()
        
    def get_current_window_handle(self):
        return self._execute(Command.GET_CURRENT_WINDOW_HANDLE)['value']

    def get_window_handles(self):
        return self._execute(Command.GET_WINDOW_HANDLES)['value']
        
    def switch_to_active_element(self):
        """Returns the element with focus, or BODY if nothing has focus."""
        return self._execute(Command.GET_ACTIVE_ELEMENT)['value']

    def switch_to_window(self, window_name):
        """Switches focus to a window."""
        self._execute(Command.SWITCH_TO_WINDOW, {'name': window_name})

    def switch_to_frame(self, index_or_name):
        """Switches focus to a frame by index or name."""
        self._execute(Command.SWITCH_TO_FRAME, {'id': index_or_name})

    def back(self):
        """Goes back in browser history."""
        self._execute(Command.GO_BACK)

    def forward(self):
        """Goes forward in browser history."""
        self._execute(Command.GO_FORWARD)
    # Options
    def get_cookies(self):
        """Gets all the cookies. Return a set of dicts."""
        return self._execute(Command.GET_ALL_COOKIES)['value']
        
    def get_cookie(self, name):
        """Get a single cookie.  Returns the desired cookie dict or None."""
        cookies = self.get_cookies()
        for cookie in cookies:
            if cookie['name'] == name:
                return cookie
        return None

    def delete_cookie(self, name):
        """Delete a cookie with the given name."""
        self._execute(Command.DELETE_COOKIE, {'name': name})

    def delete_all_cookies(self):
        """Delete all the cookies."""
        self._execute(Command.DELETE_ALL_COOKIES)

    def add_cookie(self, cookie_dict):
        self._execute(Command.ADD_COOKIE, {'cookie': cookie_dict})

    def _find_element_by(self, by, value):
        return self._execute(Command.FIND_ELEMENT,
                             {'using': by, 'value': value})['value']

    def _find_elements_by(self, by, value):
        return self._execute(Command.FIND_ELEMENTS,
                             {'using': by, 'value': value})['value']


def connect(name, version="", server="http://localhost:4444", platform=None,
            javascript_enabled=True, path="/wd/hub"):
    """Convenience function to connect to a server
       Args:
           name - A string indicating which browser to request a new
               session for from the remote server.  Should be one of
               {mobile safari|firefox|internet explorer|htmlunit|chrome}.
           version - A string indicating a specific browser version to request,
               or an empty string ot use any available browser. Defaults to the
               empty string.
           server - Server location (without path). Defaults to
               "http://localhost:4444".
           platform - A string indicating the desired platform to request from
               the remote server. Should be one of
               {WINDOWS|XP|VISTA|MAC|LINUX|UNIX|ANY} or None. Defaults to None.
           javascript_enabled - Whether the requested browser should support
               JavaScript.  Defaults to True.
           path - path in server url. Defaults to "/wd/hub/"
    """
    if not path.startswith("/"):
        path = "/" + path
    url = "%s%s" % (server, path)
    wd = WebDriver(url, name, platform, version, javascript_enabled)

    return wd
