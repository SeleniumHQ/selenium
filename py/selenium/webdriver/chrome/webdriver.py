#!/usr/bin/python
#
# Copyright 2011 Webdriver_name committers
# Copyright 2011 Google Inc.
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
import warnings
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from service import Service
from options import Options

class WebDriver(RemoteWebDriver):
    """
    Controls the ChromeDriver and allows you to drive the browser.
    
    You will need to download the ChromeDriver executable from
    http://code.google.com/p/chromedriver/downloads/list
    """

    def __init__(self, executable_path="chromedriver", port=0,
                 desired_capabilities=None, chrome_options=None):
        """
        Creates a new instance of the chrome driver.

        Starts the service and then creates new instance of chrome driver.

        :Args:
         - executable_path - path to the executable. If the default is used it assumes the executable is in the $PATH
         - port - port you would like the service to run, if left as 0, a free port will be found.
         - desired_capabilities: Dictionary object with desired capabilities (Can be used to provide various chrome
           switches). This is being deprecated, please use chrome_options
         - chrome_options: this takes an instance of ChromeOptions
        """
        if chrome_options is None:
            options = Options()
        else:
            options = chrome_options

        if desired_capabilities is not None:
            warnings.warn("Desired Capabilities has been deprecated, please user chrome_options.", DeprecationWarning)
            desired_capabilities.update(options.to_capabilities())
        else:
            desired_capabilities = options.to_capabilities()

        self.service = Service(executable_path, port=port)
        self.service.start()

        RemoteWebDriver.__init__(self,
            command_executor=self.service.service_url,
            desired_capabilities=desired_capabilities)

    def quit(self):
        """
        Closes the browser and shuts down the ChromeDriver executable
        that is started when starting the ChromeDriver
        """
        try:
            RemoteWebDriver.quit(self)
        except httplib.BadStatusLine:
            pass
        finally:
            self.service.stop()

    def save_screenshot(self, filename):
        """
        Gets the screenshot of the current window. Returns False if there is
        any IOError, else returns True. Use full paths in your filename.
        """
        png = RemoteWebDriver.execute(self, Command.SCREENSHOT)['value']
        try:
            f = open(filename, 'wb')
            f.write(base64.decodestring(png))
            f.close()
        except IOError:
            return False
        finally:
            del png
        return True
