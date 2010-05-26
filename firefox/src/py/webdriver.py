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
from selenium.common.exceptions import ErrorInResponseException
from selenium.remote.command import Command
from selenium.remote.webdriver import WebDriver as RemoteWebDriver
from webelement import WebElement
from firefoxlauncher import FirefoxLauncher
from firefox_profile import FirefoxProfile
from extensionconnection import ExtensionConnection
import urllib2


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
        self.browser = FirefoxLauncher()
        if type(profile) == str:
            # This is to be Backward compatible because we used to take a
            # profile name
            profile = FirefoxProfile(name=profile)
        if not profile:
            profile = FirefoxProfile()
        self.browser.launch_browser(profile)
        RemoteWebDriver.__init__(self,
            command_executor=ExtensionConnection(timeout),
            browser_name='firefox', platform='ANY', version='',
            javascript_enabled=True)

    def _execute(self, command, params=None):
        try:
            return RemoteWebDriver._execute(self, command, params)
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

    def save_screenshot(self, png_file):
        """Saves a screenshot of the current page into the given
        file."""
        png_data = self._execute(Command.SCREENSHOT)['value']
        fp = open(png_file, 'wb')
        fp.write(base64.decodestring(png_data))
        fp.close()
