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

import base64
import httplib
from selenium.webdriver.common.exceptions import ErrorInResponseException
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import urllib2
from ctypes import *
import socket
import time
import os

DEFAULT_TIMEOUT = 30
DEFAULT_PORT = 0

class WebDriver(RemoteWebDriver):

    def __init__(self, port=DEFAULT_PORT, timeout=DEFAULT_TIMEOUT):
        self.port = port
        if self.port == 0:
            free_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            free_socket.bind((socket.gethostname(), 0))
            self.port = free_socket.getsockname()[1]
            free_socket.close()
        
        # Create IE Driver instance of the unmanaged code
        self.iedriver = CDLL(os.path.join(os.path.dirname(__file__), "IEDriver.dll"))
        self.ptr = self.iedriver.StartServer(self.port)

        seconds = 0
        while not self._is_connectable():
	    seconds += 1
	    if seconds > DEFAULT_TIMEOUT:
                raise RuntimeError("Unable to connect to IE")
            time.sleep(1)

        RemoteWebDriver.__init__(self,
			    command_executor='http://localhost:%d' % self.port,
			    desired_capabilities=DesiredCapabilities.INTERNETEXPLORER) 
    
    def _is_connectable(self):
        """Trys to connect to the server to see if it is running."""
        try:
            socket_ = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            socket_.settimeout(1)
            socket_.connect(("localhost", self.port))
            socket_.close()
            return True
        except socket.error:
            return False

    def quit(self):
        RemoteWebDriver.quit(self)
        self.iedriver.StopServer(self.ptr)
        del self.iedriver
        del self.ptr
      
