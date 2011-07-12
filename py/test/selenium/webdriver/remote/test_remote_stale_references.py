#!/usr/bin/env python
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
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer
from selenium.test.selenium.webdriver.common import stale_reference_tests 
from selenium import webdriver
from selenium.test.selenium.common import utils


def setup_module(module):
    utils.start_server(module)
    webserver = SimpleWebServer()
    webserver.start()
    RemoteStaleReferenceTests.webserver = webserver
    RemoteStaleReferenceTests.driver = webdriver.Remote(desired_capabilities = webdriver.DesiredCapabilities.FIREFOX)


class RemoteStaleReferenceTests(stale_reference_tests.StaleReferenceTests):
    pass


def teardown_module(module):
    try:
        RemoteStaleReferenceTests.driver.quit()
    except AttributeError:
        pass
    try:
        RemoteStaleReferenceTests.webserver.stop()
    except AttributeError:
        pass    
    utils.stop_server(module)
