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
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer
from selenium.test.selenium.webdriver.common import interactions_tests
from selenium import webdriver
import pytest
import sys

def setup_module(module):
    webserver = SimpleWebServer()
    webserver.start()
    FirefoxAdvancedUserInteractionTest.webserver = webserver
    FirefoxAdvancedUserInteractionTest.driver = webdriver.Firefox()

@pytest.mark.skipif('sys.platform == "darwin"')
class FirefoxAdvancedUserInteractionTest(interactions_tests.AdvancedUserInteractionTest):
    pass


def teardown_module(module):
    FirefoxAdvancedUserInteractionTest.driver.quit()
    FirefoxAdvancedUserInteractionTest.webserver.stop()
