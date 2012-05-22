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
import subprocess
from subprocess import PIPE
import time
import os
import signal
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common import utils

class Service(object):
    """
    Object that manages the starting and stopping of the IEDriver
    """

    def __init__(self, executable_path, port=0):
        """
        Creates a new instance of the Service
        
        :Args:
         - executable_path : Path to the IEDriver
         - port : Port the service is running on """

        self.port = port
        self.path = executable_path
        if self.port == 0:
            self.port = utils.free_port()

    def start(self):
        """
        Starts the IEDriver Service. 
        
        :Exceptions:
         - WebDriverException : Raised either when it can't start the service
           or when it can't connect to the service
        """
        try:
            self.process = subprocess.Popen([self.path, "--port=%d" % self.port],
                    stdout=PIPE, stderr=PIPE)
        except:
            raise WebDriverException(
                "IEDriver executable needs to be available in the path. \
                Please download from http://code.google.com/p/selenium/downloads/list\
                and read up at http://code.google.com/p/selenium/wiki/InternetExplorerDriver")
        count = 0
        while not utils.is_url_connectable(self.port):
            count += 1
            time.sleep(1)
            if count == 30:
                 raise WebDriverException("Can not connect to the IEDriver")
                
    def stop(self):
        """ 
        Tells the IEDriver to stop and cleans up the process
        """
        #If its dead dont worry
        if self.process is None:
            return

        #Tell the Server to die!
        import urllib2
        urllib2.urlopen("http://127.0.0.1:%d/shutdown" % self.port)
        count = 0
        while not utils.is_connectable(self.port):
            if count == 30:
               break 
            count += 1
            time.sleep(1)
        
        #Tell the Server to properly die in case
        try:
            if self.process:
                os.kill(self.process.pid, signal.SIGTERM)
                os.wait()
        except AttributeError:
            # kill may not be available under windows environment
            pass
