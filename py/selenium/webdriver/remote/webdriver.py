# Copyright 2008-2011 WebDriver committers
# Copyright 2008-2011 Google Inc.
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
The WebDriver implementation.
"""
import base64
from command import Command
from webelement import WebElement
from remote_connection import RemoteConnection
from errorhandler import ErrorHandler
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.alert import Alert


class WebDriver(object):
    """
    Controls a browser by sending commands to a remote server.
    This server is expected to be running the WebDriver wire protocol as defined
    here: http://code.google.com/p/selenium/wiki/JsonWireProtocol

    :Attributes:
     - command_executor - The command.CommandExecutor object used to execute commands.
     - error_handler - errorhandler.ErrorHandler object used to verify that the server did not return an error.
     - session_id - The session ID to send with every command.
     - capabilities - A dictionary of capabilities of the underlying browser for this instance's session.
    """

    def __init__(self, command_executor='http://127.0.0.1:4444/wd/hub',
        desired_capabilities=None, browser_profile=None):
        """
        Create a new driver that will issue commands using the wire protocol.

        :Args:
         - command_executor - Either a command.CommandExecutor object or a string that specifies the URL of a remote server to send commands to.
         - desired_capabilities - Dictionary holding predefined values for starting a browser
         - browser_profile - A selenium.webdriver.firefox.firefox_profile.FirefoxProfile object.  Only used if Firefox is requested.
        """
        if desired_capabilities is None:
            raise WebDriverException("Desired Capabilities can't be None")
        if not isinstance(desired_capabilities, dict):
            raise WebDriverException("Desired Capabilities must be a dictionary")
        self.command_executor = command_executor
        if type(self.command_executor) is str or type(self.command_executor) is unicode:
            self.command_executor = RemoteConnection(command_executor)
        self.session_id = None
        self.capabilities = {}
        self.error_handler = ErrorHandler()
        self.start_client()
        self.start_session(desired_capabilities, browser_profile)

    @property
    def name(self):
        """Returns the name of the underlying browser for this instance.

        :Usage:
         - driver.name
        """
        if 'browserName' in self.capabilities:
            return self.capabilities['browserName']
        else:
            raise KeyError('browserName not specified in session capabilities')

    def start_client(self):
        """
        Called before starting a new session. This method may be overridden
        to define custom startup behavior.
        """
        pass

    def stop_client(self):
        """
        Called after executing a quit command. This method may be overridden
        to define custom shutdown behavior.
        """
        pass

    def start_session(self, desired_capabilities, browser_profile=None):
        """
        Creates a new session with the desired capabilities.

        :Args:
         - browser_name - The name of the browser to request.
         - version - Which browser version to request.
         - platform - Which platform to request the browser on.
         - javascript_enabled - Whether the new session should support JavaScript.
         - browser_profile - A selenium.webdriver.firefox.firefox_profile.FirefoxProfile object. Only used if Firefox is requested.
        """
        if browser_profile:
            desired_capabilities['firefox_profile'] = browser_profile.encoded
        response = self.execute(Command.NEW_SESSION, {
            'desiredCapabilities': desired_capabilities,
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
        """
        Creates a web element with the specified element_id.
        """
        return WebElement(self, element_id)

    def _unwrap_value(self, value):
        if isinstance(value, dict) and 'ELEMENT' in value:
            return self.create_web_element(value['ELEMENT'])
        elif isinstance(value, list):
            return list(self._unwrap_value(item) for item in value)
        else:
            return value

    def execute(self, driver_command, params=None):
        """
        Sends a command to be executed by a command.CommandExecutor.

        :Args:
         - driver_command: The name of the command to execute as a string.
         - params: A dictionary of named parameters to send with the command.

        :Returns:
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
        return {'success': 0, 'value': None, 'sessionId': self.session_id}

    def get(self, url):
        """
        Loads a web page in the current browser session.
        """
        self.execute(Command.GET, {'url': url})

    @property
    def title(self):
        """Returns the title of the current page.

        :Usage:
            driver.title
        """
        resp = self.execute(Command.GET_TITLE)
        return resp['value'] if resp['value'] is not None else ""

    def find_element_by_id(self, id_):
        """Finds an element by id.

        :Args:
         - id\_ - The id of the element to be found.

        :Usage:
            driver.find_element_by_id('foo')
        """
        return self.find_element(by=By.ID, value=id_)

    def find_elements_by_id(self, id_):
        """
        Finds multiple elements by id.

        :Args:
         - id\_ - The id of the elements to be found.

        :Usage:
            driver.find_element_by_id('foo')
        """
        return self.find_elements(by=By.ID, value=id_)

    def find_element_by_xpath(self, xpath):
        """
        Finds an element by xpath.

        :Args:
         - xpath - The xpath locator of the element to find.

        :Usage:
            driver.find_element_by_xpath('//div/td[1]')
        """
        return self.find_element(by=By.XPATH, value=xpath)

    def find_elements_by_xpath(self, xpath):
        """
        Finds multiple elements by xpath.

        :Args:
         - xpath - The xpath locator of the elements to be found.

        :Usage:
            driver.find_elements_by_xpath("//div[contains(@class, 'foo')]")
        """
        return self.find_elements(by=By.XPATH, value=xpath)

    def find_element_by_link_text(self, link_text):
        """
        Finds an element by link text.

        :Args:
         - link_text: The text of the element to be found.

        :Usage:
            driver.find_element_by_link_text('Sign In')
        """
        return self.find_element(by=By.LINK_TEXT, value=link_text)

    def find_elements_by_link_text(self, text):
        """
        Finds elements by link text.

        :Args:
         - link_text: The text of the elements to be found.

        :Usage:
            driver.find_elements_by_link_text('Sign In')
        """
        return self.find_elements(by=By.LINK_TEXT, value=text)

    def find_element_by_partial_link_text(self, link_text):
        """
        Finds an element by a partial match of its link text.

        :Args:
         - link_text: The text of the element to partially match on.

        :Usage:
            driver.find_element_by_partial_link_text('Sign')
        """
        return self.find_element(by=By.PARTIAL_LINK_TEXT, value=link_text)

    def find_elements_by_partial_link_text(self, link_text):
        """
        Finds elements by a partial match of their link text.

        :Args:
         - link_text: The text of the element to partial match on.

        :Usage:
            driver.find_element_by_partial_link_text('Sign')
        """
        return self.find_elements(by=By.PARTIAL_LINK_TEXT, value=link_text)

    def find_element_by_name(self, name):
        """
        Finds an element by name.

        :Args:
         - name: The name of the element to find.

        :Usage:
            driver.find_element_by_name('foo')
        """
        return self.find_element(by=By.NAME, value=name)

    def find_elements_by_name(self, name):
        """
        Finds elements by name.

        :Args:
         - name: The name of the elements to find.

        :Usage:
            driver.find_elements_by_name('foo')
        """
        return self.find_elements(by=By.NAME, value=name)

    def find_element_by_tag_name(self, name):
        """
        Finds an element by tag name.

        :Args:
         - name: The tag name of the element to find.

        :Usage:
            driver.find_element_by_tag_name('foo')
        """
        return self.find_element(by=By.TAG_NAME, value=name)

    def find_elements_by_tag_name(self, name):
        """
        Finds elements by tag name.

        :Args:
         - name: The tag name the use when finding elements.

        :Usage:
            driver.find_elements_by_tag_name('foo')
        """
        return self.find_elements(by=By.TAG_NAME, value=name)

    def find_element_by_class_name(self, name):
        """
        Finds an element by class name.

        :Args:
         - name: The class name of the element to find.

        :Usage:
            driver.find_element_by_class_name('foo')
        """
        return self.find_element(by=By.CLASS_NAME, value=name)

    def find_elements_by_class_name(self, name):
        """
        Finds elements by class name.

        :Args:
         - name: The class name of the elements to find.

        :Usage:
            driver.find_elements_by_class_name('foo')
        """
        return self.find_elements(by=By.CLASS_NAME, value=name)

    def find_element_by_css_selector(self, css_selector):
        """
        Finds an element by css selector.

        :Args:
         - css_selector: The css selector to use when finding elements.

        :Usage:
            driver.find_element_by_css_selector('#foo')
        """
        return self.find_element(by=By.CSS_SELECTOR, value=css_selector)

    def find_elements_by_css_selector(self, css_selector):
        """
        Finds elements by css selector.

        :Args:
         - css_selector: The css selector to use when finding elements.

        :Usage:
            driver.find_element_by_css_selector('#foo')
        """
        return self.find_elements(by=By.CSS_SELECTOR, value=css_selector)

    def execute_script(self, script, *args):
        """
        Synchronously Executes JavaScript in the current window/frame.

        :Args:
         - script: The JavaScript to execute.
         - \*args: Any applicable arguments for your JavaScript.

        :Usage:
            driver.execute_script('document.title')
        """
        if len(args) == 1:
            converted_args = args[0]
        else:
            converted_args = list(args)
        converted_args = list(args)
        return self.execute(Command.EXECUTE_SCRIPT,
            {'script': script, 'args':converted_args})['value']

    def execute_async_script(self, script, *args):
        """
        Asynchronously Executes JavaScript in the current window/frame.

        :Args:
         - script: The JavaScript to execute.
         - \*args: Any applicable arguments for your JavaScript.

        :Usage:
            driver.execute_async_script('document.title')
        """
        if len(args) == 1:
            converted_args = args[0]
        else:
            converted_args = list(args)
        converted_args = list(args)
        return self.execute(Command.EXECUTE_ASYNC_SCRIPT,
            {'script': script, 'args':converted_args})['value']

    @property
    def current_url(self):
        """
        Gets the URL of the current page.

        :Usage:
            driver.current_url
        """
        return self.execute(Command.GET_CURRENT_URL)['value']

    @property
    def page_source(self):
        """
        Gets the source of the current page.

        :Usage:
            driver.page_source
        """
        return self.execute(Command.GET_PAGE_SOURCE)['value']

    def close(self):
        """
        Closes the current window.

        :Usage:
            driver.close()
        """
        self.execute(Command.CLOSE)

    def quit(self):
        """
        Quits the driver and closes every associated window.

        :Usage:
            driver.quit()
        """
        try:
            self.execute(Command.QUIT)
        finally:
            self.stop_client()

    @property
    def current_window_handle(self):
        """
        Returns the handle of the current window.

        :Usage:
            driver.current_window_handle
        """
        return self.execute(Command.GET_CURRENT_WINDOW_HANDLE)['value']

    @property
    def window_handles(self):
        """
        Returns the handles of all windows within the current session.

        :Usage:
            driver.window_handles
        """
        return self.execute(Command.GET_WINDOW_HANDLES)['value']

    def maximize_window(self):
        """
        Maximizes the current window that webdriver is using
        """
        self.execute(Command.MAXIMIZE_WINDOW, {"windowHandle": "current"})

    #Target Locators
    def switch_to_active_element(self):
        """
        Returns the element with focus, or BODY if nothing has focus.

        :Usage:
            driver.switch_to_active_element()
        """
        return self.execute(Command.GET_ACTIVE_ELEMENT)['value']

    def switch_to_window(self, window_name):
        """
        Switches focus to the specified window.

        :Args:
         - window_name: The name or window handle of the window to switch to.

        :Usage:
            driver.switch_to_window('main')
        """
        self.execute(Command.SWITCH_TO_WINDOW, {'name': window_name})

    def switch_to_frame(self, frame_reference):
        """
        Switches focus to the specified frame, by index, name, or webelement.

        :Args:
         - frame_reference: The name of the window to switch to, an integer representing the index,
                            or a webelement that is an (i)frame to switch to.

        :Usage:
            driver.switch_to_frame('frame_name')
            driver.switch_to_frame(1)
            driver.switch_to_frame(driver.find_elements_by_tag_name("iframe")[0])
        """
        self.execute(Command.SWITCH_TO_FRAME, {'id': frame_reference})

    def switch_to_default_content(self):
        """
        Switch focus to the default frame.

        :Usage:
            driver.switch_to_default_content()
        """
        self.execute(Command.SWITCH_TO_FRAME, {'id': None})

    def switch_to_alert(self):
        """
        Switches focus to an alert on the page.

        :Usage:
            driver.switch_to_alert()
        """
        return Alert(self)

    #Navigation
    def back(self):
        """
        Goes one step backward in the browser history.

        :Usage:
            driver.back()
        """
        self.execute(Command.GO_BACK)

    def forward(self):
        """
        Goes one step forward in the browser history.

        :Usage:
            driver.forward()
        """
        self.execute(Command.GO_FORWARD)

    def refresh(self):
        """
        Refreshes the current page.

        :Usage:
            driver.refresh()
        """
        self.execute(Command.REFRESH)

    # Options
    def get_cookies(self):
        """
        Returns a set of dictionaries, corresponding to cookies visible in the current session.

        :Usage:
            driver.get_cookies()
        """
        return self.execute(Command.GET_ALL_COOKIES)['value']

    def get_cookie(self, name):
        """
        Get a single cookie by name. Returns the cookie if found, None if not.

        :Usage:
            driver.get_cookie('my_cookie')
        """
        cookies = self.get_cookies()
        for cookie in cookies:
            if cookie['name'] == name:
                return cookie
        return None

    def delete_cookie(self, name):
        """
        Deletes a single cookie with the given name.

        :Usage:
            driver.delete_cookie('my_cookie')
        """
        self.execute(Command.DELETE_COOKIE, {'name': name})

    def delete_all_cookies(self):
        """
        Delete all cookies in the scope of the session.

        :Usage:
            driver.delete_all_cookies()
        """
        self.execute(Command.DELETE_ALL_COOKIES)

    def add_cookie(self, cookie_dict):
        """
        Adds a cookie to your current session.

        :Args:
         - cookie_dict: A dictionary object, with required keys - "name" and "value";
            optional keys - "path", "domain", "secure", "expiry"

        Usage:
            driver.add_cookie({'name' : 'foo', 'value' : 'bar'})
            driver.add_cookie({'name' : 'foo', 'value' : 'bar', 'path' : '/'})
            driver.add_cookie({'name' : 'foo', 'value' : 'bar', 'path' : '/', 'secure':True})

        """
        self.execute(Command.ADD_COOKIE, {'cookie': cookie_dict})

    # Timeouts
    def implicitly_wait(self, time_to_wait):
        """
        Sets a sticky timeout to implicitly wait for an element to be found,
           or a command to complete. This method only needs to be called one
           time per session. To set the timeout for calls to
           execute_async_script, see set_script_timeout.

        :Args:
         - time_to_wait: Amount of time to wait (in seconds)

        :Usage:
            driver.implicitly_wait(30)
        """
        self.execute(Command.IMPLICIT_WAIT, {'ms': float(time_to_wait) * 1000})

    def set_script_timeout(self, time_to_wait):
        """
        Set the amount of time that the script should wait during an
           execute_async_script call before throwing an error.

        :Args:
         - time_to_wait: The amount of time to wait

        :Usage:
            driver.set_script_timeout(30)
        """
        self.execute(Command.SET_SCRIPT_TIMEOUT,
            {'ms': float(time_to_wait) * 1000})

    def find_element(self, by=By.ID, value=None):
        """
        'Private' method used by the find_element_by_* methods.

        :Usage:
            Use the corresponding find_element_by_* instead of this.
        """
        return self.execute(Command.FIND_ELEMENT,
                             {'using': by, 'value': value})['value']

    def find_elements(self, by=By.ID, value=None):
        """
        'Private' method used by the find_elements_by_* methods.

        :Usage:
            Use the corresponding find_elements_by_* instead of this.
        """
        return self.execute(Command.FIND_ELEMENTS,
                             {'using': by, 'value': value})['value']
    @property
    def desired_capabilities(self):
        """
        returns the drivers current desired capabilities being used
        """
        return self.capabilities

    def get_screenshot_as_file(self, filename):
        """
        Gets the screenshot of the current window. Returns False if there is
           any IOError, else returns True. Use full paths in your filename.

        :Args:
         - filename: The full path you wish to save your screenshot to.

        :Usage:
            driver.get_screenshot_as_file('/Screenshots/foo.png')
        """
        png = self.execute(Command.SCREENSHOT)['value']
        try:
            with open(filename, 'wb') as f:
                f.write(base64.decodestring(png))
        except IOError:
            return False
        del png
        return True

    def get_screenshot_as_base64(self):
        """
        Gets the screenshot of the current window as a base64 encoded string
           which is useful in embedded images in HTML.

        :Usage:
            driver.get_screenshot_as_base64()
        """
        return self.execute(Command.SCREENSHOT)['value']

    def set_window_size(self, width, height, windowHandle='current'):
        """
        Sets the width and height of the current window. (window.resizeTo)

        :Args:
         - width: the width in pixels to set the window to
         - height: the height in pixels to set the window to

        :Usage:
            driver.set_window_size(800,600)
        """
        self.execute(Command.SET_WINDOW_SIZE, {'width': width, 'height': height,
          'windowHandle': windowHandle})

    def get_window_size(self, windowHandle='current'):
        """
        Gets the width and height of the current window.

        :Usage:
            driver.get_window_size()
        """
        return self.execute(Command.GET_WINDOW_SIZE,
            {'windowHandle': windowHandle})['value']

    def set_window_position(self, x, y, windowHandle='current'):
        """
        Sets the x,y position of the current window. (window.moveTo)

        :Args:
         - x: the x-coordinate in pixels to set the window position
         - y: the y-coordinate in pixels to set the window position

        :Usage:
            driver.set_window_position(0,0)
        """
        self.execute(Command.SET_WINDOW_POSITION, {'x': x, 'y': y,
          'windowHandle': windowHandle})

    def get_window_position(self, windowHandle='current'):
        """
        Gets the x,y position of the current window.

        :Usage:
            driver.get_window_position()
        """
        return self.execute(Command.GET_WINDOW_POSITION,
            {'windowHandle': windowHandle})['value']

    @property
    def orientation(self):
        """
        Gets the current orientation of the device

        :Usage:
            orientation = driver.orientation
        """
        return self.execute(Command.GET_SCREEN_ORIENTATION)['value']

    @orientation.setter
    def orientation(self, value):
        """
        Sets the current orientation of the device

        :Args:
         - value: orientation to set it to.

        :Usage:
            driver.orientation = 'landscape'
        """
        allowed_values = ['LANDSCAPE', 'PORTRAIT']
        if value.upper() in allowed_values:
            self.execute(Command.SET_SCREEN_ORIENTATION, {'orientation': value})['value']
        else:
            raise WebDriverException("You can only set the orientation to 'LANDSCAPE' and 'PORTRAIT'")
