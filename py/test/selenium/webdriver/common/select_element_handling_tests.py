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


class SelectElementHandlingTests(unittest.TestCase):

    def testShouldBeAbleToChangeTheSelectedOptionInASelect(self):
        self._loadPage("formPage")
        selectBox = self.driver.find_element(by=By.XPATH, value="//select[@name='selectomatic']")
        options = selectBox.find_elements(by=By.TAG_NAME, value="option")
        one = options[0]
        two = options[1]
        self.assertTrue(one.is_selected())
        self.assertFalse(two.is_selected())

        two.click()
        self.assertFalse(one.is_selected())
        self.assertTrue(two.is_selected())

    def testShouldBeAbleToSelectMoreThanOneOptionFromASelectWhichAllowsMultipleChoices(self):
        self._loadPage("formPage")

        multiSelect = self.driver.find_element(by=By.ID, value="multi")
        options = multiSelect.find_elements(by=By.TAG_NAME, value="option")
        for option in options:
            if not option.is_selected():
                option.click()

        for i in range(len(options)):
            option = options[i]
            self.assertTrue(option.is_selected(), "Option at index is not selected but should be: " + str(i))

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
