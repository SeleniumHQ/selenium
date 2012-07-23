#!/usr/bin/python

# Copyright 2008-2012 WebDriver committers
# Copyright 2008-2012 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License")
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

from selenium.webdriver.common.by import By


class ElementEqualityTests(unittest.TestCase):

    def testSameElementLookedUpDifferentWaysShouldBeEqual(self):
        self._loadSimplePage()
        body = self.driver.find_element(By.TAG_NAME, "body")
        xbody = self.driver.find_elements(By.XPATH, "//body")[0]

        self.assertEqual(body, xbody)
    
    def testDifferentElementsAreNotEqual(self):
        self._loadSimplePage()
        body = self.driver.find_element(By.TAG_NAME, "body")
        div = self.driver.find_element(By.TAG_NAME, "div")

        self.assertNotEqual(body, div)


    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
