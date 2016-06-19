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

import unittest
from selenium.webdriver.common.by import By


class ClickTest(unittest.TestCase):

    def setUp(self):
        self._loadPage("clicks")

    def tearDown(self):
        self.driver.delete_all_cookies()

    def testAddingACookieThatExpiredInThePast(self):
        self.driver.find_element(By.ID, "overflowLink").click()
        self.assertEqual(self.driver.title, "XHTML Test Page")

    def testClickingALinkMadeUpOfNumbersIsHandledCorrectly(self):
        self.driver.find_element(By.LINK_TEXT, "333333").click()
        self.assertEqual(self.driver.title, "XHTML Test Page")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')
