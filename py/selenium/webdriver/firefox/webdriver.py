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

import base64
import httplib
from selenium.webdriver.common.exceptions import ErrorInResponseException
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.firefox.firefoxlauncher import FirefoxLauncher
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
from selenium.webdriver.firefox.extensionconnection import ExtensionConnection
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities 
import urllib2
import socket


class WebDriver(RemoteWebDriver):
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
        port = self._free_port()
        self.browser = FirefoxLauncher()
        if type(profile) == str:
            # This is to be Backward compatible because we used to take a
            # profile name
            profile = FirefoxProfile(name=profile, port=port)
        if not profile:
            profile = FirefoxProfile(port=port)
        self.browser.launch_browser(profile)
        RemoteWebDriver.__init__(self,
            command_executor=ExtensionConnection(timeout),
            desired_capabilities=DesiredCapabilities.FIREFOX)

    def _free_port(self):
        port = 0
        free_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        free_socket.bind((socket.gethostname(), 0))
        port = free_socket.getsockname()[1]
        free_socket.close()
        return port

    def _execute(self, command, params=None):
        try:
            return RemoteWebDriver.execute(self, command, params)
        except ErrorInResponseException, e:
            # Legacy behavior: calling close() multiple times should not raise
            # an error
            if command != Command.CLOSE and command != Command.QUIT:
                raise e
        except urllib2.URLError, e:
            # Legacy behavior: calling quit() multiple times should not raise
            # an error
            if command != Command.QUIT:
                raise e
    
    def create_web_element(self, element_id):
        """Override from RemoteWebDriver to use firefox.WebElement."""
        return WebElement(self, element_id)

    def quit(self):
        """Quits the driver and close every associated window."""
        try:
            RemoteWebDriver.quit(self)
        except httplib.BadStatusLine:
            # Happens if Firefox shutsdown before we've read the response from
            # the socket.
            pass
        self.browser.kill()

    def save_screenshot(self, filename):
        """
        Gets the screenshot of the current window. Returns False if there is
        any IOError, else returns True. Use full paths in your filename.
        """
        png = self._execute(Command.SCREENSHOT)['value']
        try:
            f = open(filename, 'w')
            f.write(base64.decodestring(png))
            f.close()
        except IOError:
            return False
        finally:
            del png
        return True
