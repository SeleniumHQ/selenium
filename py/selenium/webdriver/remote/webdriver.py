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

import base64
from command import Command
from webelement import WebElement
from remote_connection import RemoteConnection
from errorhandler import ErrorHandler
from selenium.webdriver.common.by import By
from selenium.webdriver.common.alert import Alert

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

    def __init__(self, command_executor='http://localhost:4444/wd/hub',
                 desired_capabilities = None,
                 browser_profile=None):
        """Create a new driver that will issue commands using the wire protocol.

        Args:
          command_executor - Either a command.CommandExecutor object or a string
              that specifies the URL of a remote server to send commands to.
          desired_capabilities - Dictionary holding predefined values for starting 
              a browser    
          browser_profile: A browser profile directory as a Base64-encoded
              zip file.  Only used if Firefox is requested.
        """
        if desired_capabilities is None:
            raise WebDriverException(" Desired Capabilities can't be None")

        self.command_executor = command_executor
        if type(self.command_executor) is str:
            self.command_executor = RemoteConnection(command_executor)

        self.session_id = None
        self.capabilities = {}
        self.error_handler = ErrorHandler()

        self.start_client()
        self.start_session(desired_capabilities, browser_profile)
        
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

    def start_session(self, desired_capabilities, browser_profile=None):
        """Creates a new session with the desired capabilities.

        Args:
          browser_name: The name of the browser to request.
          version: Which browser version to request.
          platform: Which platform to request the browser on.
          javascript_enabled: Whether the new session should support JavaScript.
          browser_profile: A browser profile directory as a Base64-encoded
              zip file.  Only used if Firefox is requested.
        """
        if browser_profile:
          desired_capabilities['firefox_profile'] = browser_profile.encoded

        response =  self.execute(Command.NEW_SESSION, {
           'desiredCapabilities': desired_capabilities
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

    def execute(self, driver_command, params=None):
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
        self.execute(Command.GET, {'url': url})

    @property
    def title(self):
        """Gets the title of the current page."""
        resp = self.execute(Command.GET_TITLE)
        return resp['value'] if resp['value'] is not None else ""

    def find_element_by_id(self, id_):
        """Finds element by id."""
        return self.find_element(by=By.ID, value=id_)

    def find_elements_by_id(self, id_):
        """Finds element by id."""
        return self.find_elements(by=By.ID, value=id_)

    def find_elements_by_xpath(self, xpath):
        """Finds multiple elements by xpath."""
        return self.find_elements(by=By.XPATH, value=xpath)

    def find_element_by_xpath(self, xpath):
        """Finds an element by xpath."""
        return self.find_element(by=By.XPATH, value=xpath)

    def find_element_by_link_text(self, link_text):
        """Finds an element by its link text."""
        return self.find_element(by=By.LINK_TEXT, value=link_text)

    def find_elements_by_link_text(self, link_text):
        """Finds elements by their link text."""
        return self.find_elements(by=By.LINK_TEXT, value=link_text)

    def find_element_by_partial_link_text(self, link_text):
        """Finds an element by a partial match of its link text."""
        return self.find_element(by=By.PARTIAL_LINK_TEXT, value=link_text)

    def find_elements_by_partial_link_text(self, link_text):
        """Finds elements by a partial match of their link text."""
        return self.find_elements(by=By.PARTIAL_LINK_TEXT, value=link_text)

    def find_element_by_name(self, name):
        """Finds an element by its name."""
        return self.find_element(by=By.NAME, value=name)

    def find_elements_by_name(self, name):
        """Finds elements by their name."""
        return self.find_elements(by=By.NAME, value=name)

    def find_element_by_tag_name(self, name):
        """Finds an element by its tag name."""
        return self.find_element(by=By.TAG_NAME, value=name)

    def find_elements_by_tag_name(self, name):
        """Finds elements by their tag name."""
        return self.find_elements(by=By.TAG_NAME, value=name)

    def find_element_by_class_name(self, name):
        """Finds an element by their class name."""
        return self.find_element(by=By.CLASS_NAME, value=name)

    def find_elements_by_class_name(self, name):
        """Finds elements by their class name."""
        return self.find_elements(by=By.CLASS_NAME, value=name)

    def find_element_by_css_selector(self, css_selector):
        """Find and return an element by CSS selector."""
        return self.find_element(by=By.CSS_SELECTOR, value=css_selector)
    
    def find_elements_by_css_selector(self, css_selector):
        """Find and return list of multiple elements by CSS selector."""
        return self.find_elements(by=By.CSS_SELECTOR, value=css_selector)

    def execute_script(self, script, *args):
        if len(args) == 1:
            converted_args = args[0]
        else:
            converted_args = list(args)
        converted_args = list(args)
        return self.execute(
            Command.EXECUTE_SCRIPT,
            {'script': script, 'args':converted_args})['value']

    def execute_async_script(self, script, *args):
        if len(args) == 1:
            converted_args = args[0]
        else:
            converted_args = list(args)
        converted_args = list(args)
        return self.execute(
            Command.EXECUTE_ASYNC_SCRIPT,
            {'script': script, 'args':converted_args})['value']

    @property
    def current_url(self):
        """Gets the current url."""
        return self.execute(Command.GET_CURRENT_URL)['value']

    def get_page_source(self):
        """Gets the page source."""
        return self.execute(Command.GET_PAGE_SOURCE)['value']

    def close(self):
        """Closes the current window."""
        self.execute(Command.CLOSE)

    def quit(self):
        """Quits the driver and close every associated window."""
        try:
            self.execute(Command.QUIT)
        finally:
            self.stop_client()
        
    def get_current_window_handle(self):
        return self.execute(Command.GET_CURRENT_WINDOW_HANDLE)['value']

    def get_window_handles(self):
        return self.execute(Command.GET_WINDOW_HANDLES)['value']
    
    #Target Locators
    def switch_to_active_element(self):
        """Returns the element with focus, or BODY if nothing has focus."""
        return self.execute(Command.GET_ACTIVE_ELEMENT)['value']

    def switch_to_window(self, window_name):
        """Switches focus to a window."""
        self.execute(Command.SWITCH_TO_WINDOW, {'name': window_name})

    def switch_to_frame(self, index_or_name):
        """Switches focus to a frame by index or name."""
        self.execute(Command.SWITCH_TO_FRAME, {'id': index_or_name})

    def switch_to_default_content(self):
        """Switch to the default frame"""
        self.execute(Command.SWITCH_TO_FRAME, {'id': None})

    def switch_to_alert(self):
        """ Switch to the alert on the page """
        return Alert(self) 
    
    #Navigation 
    def back(self):
        """Goes back in browser history."""
        self.execute(Command.GO_BACK)

    def forward(self):
        """Goes forward in browser history."""
        self.execute(Command.GO_FORWARD)

    def refresh(self):
        """Refreshes the current page."""
        self.execute(Command.REFRESH)

    # Options
    def get_cookies(self):
        """Gets all the cookies. Return a set of dicts."""
        return self.execute(Command.GET_ALL_COOKIES)['value']
        
    def get_cookie(self, name):
        """Get a single cookie.  Returns the desired cookie dict or None."""
        cookies = self.get_cookies()
        for cookie in cookies:
            if cookie['name'] == name:
                return cookie
        return None

    def delete_cookie(self, name):
        """Delete a cookie with the given name."""
        self.execute(Command.DELETE_COOKIE, {'name': name})

    def delete_all_cookies(self):
        """Delete all the cookies."""
        self.execute(Command.DELETE_ALL_COOKIES)

    def add_cookie(self, cookie_dict):
        self.execute(Command.ADD_COOKIE, {'cookie': cookie_dict})
    
    # Timeouts
    def implicitly_wait(self, time_to_wait):
        """Set the implicit time out for use by later actions """
        self.execute(Command.IMPLICIT_WAIT, {'ms': time_to_wait*1000})

    def set_script_timeout(self, time_to_wait):
        """Set the timeout that the script should wait before throwing an
           error"""
        self.execute(Command.SET_SCRIPT_TIMEOUT, {'ms': time_to_wait*1000})

    def find_element(self, by=By.ID, value=None):
        return self.execute(Command.FIND_ELEMENT,
                             {'using': by, 'value': value})['value']

    def find_elements(self, by=By.ID, value=None):
        return self.execute(Command.FIND_ELEMENTS,
                             {'using': by, 'value': value})['value']

    def get_screenshot_as_file(self, filename):
        """Gets the screenshot of the current window. Returns False if there is 
        any IOError, else returns True. Use full paths in your filename."""
        png = self.execute(Command.SCREENSHOT)['value']
        try:
            f = open(filename, 'wb')
            f.write(base64.decodestring(png))
            f.close()
        except IOError:
            return False

        finally:
            del png

        return True

    def get_screenshot_as_base64(self):
        """Gets the screenshot of the current window as a base64 encoded string which 
        is useful in embedded images in HTML."""
        return self.execute(Command.SCREENSHOT)['value']

