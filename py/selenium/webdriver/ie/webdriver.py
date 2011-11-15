#!/usr/bin/python
#
# Copyright 2008-2010 WebDriver committers
# Copyright 2008-2010 Google Inc.
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

from selenium.webdriver.common import utils
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.remote.command import Command
from selenium.common.exceptions import WebDriverException
from ctypes import *
import time
import os
import base64

DEFAULT_TIMEOUT = 30
DEFAULT_PORT = 0

class WebDriver(RemoteWebDriver):

    def __init__(self, port=DEFAULT_PORT, timeout=DEFAULT_TIMEOUT):
        self.port = port
        if self.port == 0:
            self.port = utils.free_port()

        # Create IE Driver instance of the unmanaged code
        try:
            self.iedriver = CDLL(os.path.join(os.path.dirname(__file__),"win32", "IEDriver.dll"))
        except WindowsError:
            try:
                self.iedriver = CDLL(os.path.join(os.path.dirname(__file__),"x64", "IEDriver.dll"))
            except WindowsError:
                raise WebDriverException("Unable to load the IEDriver.dll component")
        self.ptr = self.iedriver.StartServer(self.port)

        seconds = 0
        while not utils.is_connectable(self.port):
            seconds += 1
            if seconds > DEFAULT_TIMEOUT:
                raise RuntimeError("Unable to connect to IE")
            time.sleep(1)

        RemoteWebDriver.__init__(
            self,
            command_executor='http://localhost:%d' % self.port,
            desired_capabilities=DesiredCapabilities.INTERNETEXPLORER)

    def quit(self):
        RemoteWebDriver.quit(self)
        self.iedriver.StopServer(self.ptr)
        del self.iedriver
        del self.ptr

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
