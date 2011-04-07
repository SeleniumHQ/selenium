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
import socket
import subprocess
from subprocess import PIPE
import time
import os
import signal
from selenium.common.exceptions import WebDriverException

class Service(object):

    def __init__(self, executable_path, port=0):
        self.port = port
        self.path = executable_path
        if self.port == 0:
            self.port = self._free_port()

    def start(self):
        try:
            self.process = subprocess.Popen([self.path, "--port=%d" % self.port],
                    stdout=PIPE, stderr=PIPE)
        except:
            raise WebDriverException(
                "ChromeDriver executable needs to be available in the path")
        count = 0
        while not self.is_connectable():
            count += 1
            time.sleep(1)
            if count == 30:
                 raise WebDriverException("Can not connect to the ChromeDriver")
                
    @property
    def service_url(self):
        return "http://localhost:%d" % self.port

    def stop(self):
        #If its dead dont worry
        if self.process is None:
            return

        #Tell the Server to die!
        import urllib2
        urllib2.urlopen("http://127.0.0.1:%d/shutdown" % self.port)
        count = 0
        while not self.is_connectable():
            if count == 30:
               break 
            count += 1
            time.sleep(1)
        
        #Tell the Server to properly die in case
        try:
            if self.process:
                os.kill(self.process.pid, signal.SIGTERM)
        except AttributeError:
            # kill may not be available under windows environment
            pass

    def is_connectable(self):
        """Trys to connect to the extension but do not retrieve context."""
        try:
            socket_ = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            socket_.settimeout(1)
            socket_.connect(("127.0.0.1", self.port))
            socket_.close()
            return True
        except socket.error:
            return False

    def _free_port(self):
        free_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        free_socket.bind((socket.gethostname(), 0))
        port = free_socket.getsockname()[1]
        free_socket.close()
        return port

