#!/usr/bin/python
#
# Copyright 2012 Webdriver_name committers
# Copyright 2012 Google Inc.
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
import six
import subprocess
from subprocess import PIPE
import time
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.baseservice import BaseService
from selenium.webdriver.common import utils


class Service(BaseService):
    """
    Object that manages the starting and stopping of the IEDriver
    """

    def __init__(self, executable_path, port=0, host=None, log_level=None, log_file=None):
        """
        Creates a new instance of the Service
        
        :Args:
         - executable_path : Path to the IEDriver
         - port : Port the service is running on
         - host : IP address the service port is bound
         - log_level : Level of logging of service, may be "FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE".
           Default is "FATAL".
         - log_file : Target of logging of service, may be "stdout", "stderr" or file path.
           Default is "stdout".
        """
        super(Service, self).__init__(executable_path, port=port)
        self.host = host
        self.log_level = log_level
        self.log_file = log_file

    @property
    def _start_args(self):
        cmd = [self.path, "--port=%d" % self.port]
        if self.host is not None:
            cmd.append("--host=%s" % self.host)
        if self.log_level is not None:
            cmd.append("--log-level=%s" % self.log_level)
        if self.log_file is not None:
            cmd.append("--log-file=%s" % self.log_file)
        return cmd

    @property
    def _start_kwargs(self):
        return dict(stdout=PIPE, stderr=PIPE)

    def start(self):
        """
        Starts the IEDriver Service. 
        
        :Exceptions:
         - WebDriverException : Raised either when it can't start the service
           or when it can't connect to the service
        """
        try:

            self.process = subprocess.Popen(self._start_args, **self._start_kwargs)
        except TypeError:
            raise
        except:
            raise WebDriverException(
                "IEDriver executable needs to be available in the path. "
                "Please download from http://selenium-release.storage.googleapis.com/index.html "
                "and read up at http://code.google.com/p/selenium/wiki/InternetExplorerDriver")
        self.wait_for_open_url()  # TODO: Why use a url instead of port?
                
    def stop(self):
        """ 
        Tells the IEDriver to stop and cleans up the process
        """
        #If its dead dont worry
        if self.process is None:
            return

        #Tell the Server to die!

        six.moves.urllib.request.urlopen("http://127.0.0.1:%d/shutdown" % self.port)
        self.wait_for_close_or_force()

    def wait_for_open_url(self):
        count = 0
        while not utils.is_url_connectable(self.port):
            count += 1
            time.sleep(1)
            if count == self.port_retries:
                raise WebDriverException("Can not connect to the IEDriver")
