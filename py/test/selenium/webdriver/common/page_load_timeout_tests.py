#!/usr/bin/python

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
from selenium.common.exceptions import TimeoutException


def not_available_on_remote(func):
    def testMethod(self):
        print self.driver
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod

class PageLoadTimeoutTest(unittest.TestCase):

    def testShouldTimeoutOnPageLoadTakingTooLong(self):
        self.driver.set_page_load_timeout(0.01)
        try:
            self._loadSimplePage()
            self.fail("Expected a timeout on page load")
        except TimeoutException, e:
            pass

    def testClickShouldTimeout(self):
        self._loadSimplePage()
        self.driver.set_page_load_timeout(0.01)
        try:
            self.driver.find_element_by_id("multilinelink").click()
            self.fail("Expected a timeout on page load after clicking")
        except TimeoutException, e:
            pass

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)
    
    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
