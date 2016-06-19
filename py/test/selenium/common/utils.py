# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import os
import socket
import time
import urllib
import subprocess
import signal


SERVER_ADDR = "localhost"
DEFAULT_PORT = 4444

SERVER_PATH = "build/java/server/src/org/openqa/grid/selenium/selenium-standalone.jar"


def start_server(module):
    _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    url = "http://%s:%d/wd/hub" % (SERVER_ADDR, DEFAULT_PORT)
    try:
        _socket.connect((SERVER_ADDR, DEFAULT_PORT))
        print("The remote driver server is already running or something else"
              "is using port %d, continuing..." % DEFAULT_PORT)
    except:
        print("Starting the remote driver server")
        module.server_proc = subprocess.Popen(
            "java -jar %s" % SERVER_PATH,
            shell=True)

        assert wait_for_server(url, 10), "can't connect"
        print("Server should be online")


def wait_for_server(url, timeout):
    start = time.time()
    while time.time() - start < timeout:
        try:
            urllib.urlopen(url)
            return 1
        except IOError:
            time.sleep(0.2)

    return 0


def stop_server(module):
    # FIXME: This does not seem to work, the server process lingers
    try:
        os.kill(module.server_proc.pid, signal.SIGTERM)
        time.sleep(5)
    except:
        pass
