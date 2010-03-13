#!/usr/bin/python
# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
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


import logging
import os
import socket
import subprocess
import time
from selenium.common.webserver import SimpleWebServer
from webdriver.common_tests import api_examples
from webdriver.remote.webdriver import WebDriver

SERVER_ADDR = "localhost"
DEFAULT_PORT = 4444

def setup_module(module):
    _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_proc = None
    try:
        _socket.connect((SERVER_ADDR, DEFAULT_PORT))
        print ("The remote driver server is already running or something else"
               "is using port %d, continuing..." % DEFAULT_PORT)
    except:
        print ("Starting the remote driver server")
        RemoteApiExampleTest.server_proc = subprocess.Popen(
            "java -jar selenium-server-standalone.jar",
            shell=True)
        time.sleep(5)
        print "Server should be online"
    webserver = SimpleWebServer()
    webserver.start()
    RemoteApiExampleTest.webserver = webserver
    RemoteApiExampleTest.driver = WebDriver(url, "firefox", "ANY")

class RemoteApiExampleTest(api_examples.ApiExampleTest):
    pass

def teardown_module(module):
    RemoteApiExampleTest.driver.quit()
    RemoteApiExampleTest.webserver.stop()
    try:
        os.kill(RemoteApiExampleTest.server_proc.pid, 9)
    except:
        pass
