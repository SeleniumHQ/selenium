#!/usr/bin/python
#
# Copyright 2011 Software Freedom Conservancy.
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


from selenium import webdriver
from selenium.test.selenium.webdriver.support import select_class_tests 
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer

def setup_module(module):
    webserver = SimpleWebServer()
    webserver.start()
    FirefoxSelectElementHandlingTests.webserver = webserver
    FirefoxSelectElementHandlingTests.driver = webdriver.Firefox()


class FirefoxSelectElementHandlingTests(select_class_tests.WebDriverSelectSupportTests):
    pass


def teardown_module(module):
    FirefoxSelectElementHandlingTests.driver.quit()
    FirefoxSelectElementHandlingTests.webserver.stop()

