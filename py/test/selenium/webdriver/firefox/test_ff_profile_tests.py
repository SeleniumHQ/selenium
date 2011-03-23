#!/usr/bin/python
#
# Copyright 2008-2010 WebDriver committers
# Copyright 2008-2010 Google Inc.
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

import unittest
from selenium import webdriver
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer

def setup_module(module):
    webserver = SimpleWebServer()
    webserver.start()
    FirefoxProfileTest.webserver = webserver
    FirefoxProfileTest.driver = webdriver.Firefox()


class FirefoxProfileTest(unittest.TestCase):
    
    def setUp(self):
        webserver = SimpleWebServer()
        webserver.start()
        self.webserver = webserver

    def test_that_we_can_accept_a_profile(self):
        self.profile1 = webdriver.FirefoxProfile()
        self.profile1.set_preference("startup.homepage_welcome_url", 
            "%s" % "\"http://localhost:%d/%s.html\"" % (self.webserver.port, "simpleTest"))
        self.profile1.update_preferences()

        self.profile2 = webdriver.FirefoxProfile(self.profile1.path)
        self.driver = webdriver.Firefox(firefox_profile=self.profile2)
        title = self.driver.title
        self.assertEquals("Hello WebDriver", title)

    def tearDown(self):
        self.driver.quit()

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

def teardown_module(module):
    FirefoxProfileTest.driver.quit()
    FirefoxProfileTest.webserver.stop()
