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
from __future__ import absolute_import
import os
import subprocess
from subprocess import PIPE
import time

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.baseservice import BaseService
from selenium.webdriver.common import utils


class Service(BaseService):
    """
    Object that manages the starting and stopping of the ChromeDriver
    """

    def __init__(self, executable_path, port=0, service_args=None,
                 log_path=None, env=None):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the ChromeDriver
         - port : Port the service is running on
         - service_args : List of args to pass to the chromedriver service
         - log_path : Path for the chromedriver service to log to
        """
        super(Service, self).__init__(executable_path, port=port)
        self.service_args = service_args or []
        if log_path:
            self.service_args.append('--log-path=%s' % log_path)
        self.env = env

    def start(self):
        """
        Starts the ChromeDriver Service.

        :Exceptions:
         - WebDriverException : Raised either when it can't start the service
           or when it can't connect to the service
        """
        env = self.env or os.environ
        try:
            self.process = subprocess.Popen([
              self.path,
              "--port=%d" % self.port] +
              self.service_args, env=env, stdout=PIPE, stderr=PIPE)
        except:
            raise WebDriverException(
                "'" + os.path.basename(self.path) + "' executable needs to be \
                available in the path. Please look at \
                http://docs.seleniumhq.org/download/#thirdPartyDrivers \
                and read up at \
                http://code.google.com/p/selenium/wiki/ChromeDriver")
        self.wait_for_open_port()

    @property
    def service_url(self):
        """
        Gets the url of the ChromeDriver Service
        """
        return "http://localhost:%d" % self.port

    def stop(self):
        """
        Tells the ChromeDriver to stop and cleans up the process
        """
        #If its dead dont worry
        if self.process is None:
            return

        #Tell the Server to die!
        try:
            from urllib import request as url_request
        except ImportError:
            import urllib2 as url_request

        url_request.urlopen("http://127.0.0.1:%d/shutdown" % self.port)
        try:
            self.wait_for_open_port(wait_open=False)
        except WebDriverException:
            pass  # emulating the original behavior.  I feel like this should return if it doesn't hit this.

        #Tell the Server to properly die in case
        try:
            if self.process:
                self.process.kill()
                self.process.wait()
        except OSError:
            # kill may not be available under windows environment
            pass
