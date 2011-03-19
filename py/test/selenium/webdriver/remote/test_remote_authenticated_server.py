#!/usr/bin/env python
# Copyright 2011 WebDriver committers
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
import socket
import subprocess
import time
import unittest
import urllib
import signal
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer
from selenium.test.selenium.webdriver.common import api_examples
from selenium import webdriver

SERVER_ADDR = "localhost"
DEFAULT_PORT = 4444


def wait_for_server(url, timeout):
  start = time.time()
  while time.time() - start < timeout:
    try:
      urllib.urlopen(url)
      return 1
    except IOError:
      time.sleep(0.2)
  return 0


def setup_module(module):
  _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  url = "http://%s:%d/wd/hub" % (SERVER_ADDR, DEFAULT_PORT)
  try:
    _socket.connect((SERVER_ADDR, DEFAULT_PORT))
    print ("The remote driver server is already running or something else"
           "is using port %d, continuing..." % DEFAULT_PORT)
  except:
    print ("Starting the remote driver server")
    AuthenticatedServerTest.server_proc = subprocess.Popen(
        "java -jar build/java/server/test/org/openqa/selenium/remote/server/auth/server-standalone.jar",
        shell=True)
    assert wait_for_server(url, 10), "can't connect"
    print "Server should be online"
  
  webserver = SimpleWebServer()
  webserver.start()
  AuthenticatedServerTest.webserver = webserver


def teardown_module(module):
  try:
    AuthenticatedServerTest.webserver.stop()
  except AttributeError:
      pass
  # FIXME: This does not seem to work, the server process lingers
  try:
    os.kill(AuthenticatedServerTest.server_proc.pid, signal.SIGTERM)
    time.sleep(5)
  except:
    pass


class AuthenticatedServerTest(unittest.TestCase):
  def setUp(self):
    self.driver = None
  
  def tearDown(self):
    if self.driver is not None:
      self.driver.quit()
  
  def testShouldBeAbleToCreateAndUseASessionOnAnAuthenticatedServer(self):
    self.driver = webdriver.Remote(
        command_executor='http://fluffy:bunny@localhost:4444/wd/hub',
        desired_capabilities=webdriver.DesiredCapabilities.FIREFOX)
    self.driver.get('http://localhost:%d/simpleTest.html' %
                    AuthenticatedServerTest.webserver.port)
    self.assertEquals('Hello WebDriver', self.driver.title)
