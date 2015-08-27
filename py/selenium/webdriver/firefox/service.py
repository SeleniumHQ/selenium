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
import os
import subprocess
from subprocess import PIPE
import time

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common import utils

class Service(object):
    """
    Object that manages the starting and stopping of the GeckoDriver
    """

    def __init__(self, executable_path, firefox_binary=None, port=0, service_args=None,
                 log_path=None, env=None):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the GeckoDriver
         - port : Port the service is running on
         - service_args : List of args to pass to the Geckodriver service
         - log_path : Path for the GeckoDriver service to log to"""

        self.port = port
        self.path = executable_path
        self.firefox_binary = firefox_binary
        self.service_args = service_args or []

        if self.port == 0:
            self.port = utils.free_port()
        self.env = env

    def start(self):
        """
        Starts the GeckoDriver "wires" Service.

        :Exceptions:
         - WebDriverException : Raised either when it can't start the service
           or when it can't connect to the service
        """
        env = self.env or os.environ
        self.log_file = file("geckodriver.log", "w")
        try:
            #import pdb; pdb.set_trace()
            self.process = subprocess.Popen([
              self.path,
              "-b", self.firefox_binary, '--webdriver-port', "%d" % self.port],
              env=env, stdout=self.log_file, stderr=self.log_file)
        except Exception as e:
            raise WebDriverException(
                "'" + os.path.basename(self.path) + "' executable needs to be \
                available in the path.\n %s" % str(e))
        count = 0
        while not utils.is_connectable(self.port):
            count += 1
            time.sleep(1)
            if count == 30:
                raise WebDriverException("Can not connect to the '" +
                                         os.path.basename(self.path) + "'")

    @property
    def service_url(self):
        """
        Gets the url of the GeckoDriver Service
        """
        return "http://localhost:%d" % self.port

    def stop(self):
        """
        Tells the GeckoDriver to stop and cleans up the process
        """
        #If its dead dont worry
        if self.process is None:
            return

        #Tell the Server to die!
        '''try:
            from urllib import request as url_request
        except ImportError:
            import urllib2 as url_request

        url_request.urlopen("http://127.0.0.1:%d/shutdown" % self.port)
        count = 0
        while utils.is_connectable(self.port):
            if count == 30:
               break
            count += 1
            time.sleep(1)
        '''
        #Tell the Server to properly die in case
        try:
            if self.process:
                self.process.kill()
                self.process.wait()
        except OSError:
            # kill may not be available under windows environment
            pass
