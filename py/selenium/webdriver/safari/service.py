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
import subprocess
from subprocess import PIPE
import time
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common import utils

class Service(object):
    """
    Object that manages the starting and stopping of the SafariDriver
    """

    def __init__(self, executable_path, port=0):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the SafariDriver
         - port : Port the service is running on """

        self.port = port
        self.path = executable_path
        if self.port == 0:
            self.port = utils.free_port()

    def start(self):
        """
        Starts the SafariDriver Service.

        :Exceptions:
         - WebDriverException : Raised either when it can't start the service
           or when it can't connect to the service
        """
        try:
            self.process = subprocess.Popen(["java", "-jar", self.path, "-port", "%s" % self.port])
        except:
            raise WebDriverException(
                "SafariDriver executable needs to be available in the path.")
        time.sleep(10)
        count = 0
        while not utils.is_connectable(self.port):
            count += 1
            time.sleep(1)
            if count == 30:
                 raise WebDriverException("Can not connect to the SafariDriver")

    @property
    def service_url(self):
        """
        Gets the url of the SafariDriver Service
        """
        return "http://localhost:%d/wd/hub" % self.port

    def stop(self):
        """
        Tells the SafariDriver to stop and cleans up the process
        """
        # If it's dead don't worry
        if self.process is None:
            return

        self.process.kill()
        self.process.wait()

