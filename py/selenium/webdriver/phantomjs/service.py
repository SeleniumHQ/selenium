#!/usr/bin/python
#
# Copyright 2012 Software Freedom Conservancy
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
import time
import signal

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common import utils

class Service(object):
    """
    Object that manages the starting and stopping of PhantomJS / Ghostdriver
    """

    def __init__(self, executable_path, port=0, service_args=None, log_path=None):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to PhantomJS binary
         - port : Port the service is running on
         - service_args : A List of other command line options to pass to PhantomJS
         - log_path: Path for PhantomJS service to log to
        """

        self.port = port
        self.path = executable_path
        self.service_args= service_args
        if self.port == 0:
            self.port = utils.free_port()
        if self.service_args is None:
            self.service_args = []
        self.service_args.insert(0, self.path)
        self.service_args.append("--webdriver=%d" % self.port)
        if not log_path:
            log_path = "ghostdriver.log"
        self._log = open(log_path, 'w')

    def start(self):
        """
        Starts PhantomJS with GhostDriver.

        :Exceptions:
         - WebDriverException : Raised either when it can't start the service
           or when it can't connect to the service
        """
        try:
            self.process = subprocess.Popen(self.service_args, stdin=subprocess.PIPE,
                                            close_fds=True, stdout=self._log,
                                            stderr=self._log)

        except Exception as e:
            raise WebDriverException("Unable to start phantomjs with ghostdriver.", e)
        count = 0
        while not utils.is_connectable(self.port):
            count += 1
            time.sleep(1)
            if count == 30:
                 raise WebDriverException("Can not connect to GhostDriver")

    @property
    def service_url(self):
        """
        Gets the url of the GhostDriver Service
        """
        return "http://localhost:%d/wd/hub" % self.port

    def stop(self):
        """
        Cleans up the process
        """
        if self._log:
            self._log.close()
            self._log = None
        #If its dead dont worry
        if self.process is None:
            return

        #Tell the Server to properly die in case
        try:
            if self.process:
                self.process.send_signal(signal.SIGTERM)
                self.process.wait()
        except OSError:
            # kill may not be available under windows environment
            pass
