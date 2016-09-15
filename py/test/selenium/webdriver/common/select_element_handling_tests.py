# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License") you may not use this file except in compliance
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

    def testShouldBePossibleToDeselectASingleOptionFromASelectWhichAllowsMultipleChoice(self):
        self._loadPage("formPage")

        multiSelect = self.driver.find_element(By.ID, "multi")
        options = multiSelect.find_elements(By.TAG_NAME, "option")

        option = options[0]
        self.assertTrue(option.is_selected())
        option.click()
        self.assertFalse(option.is_selected())
        option.click()
        self.assertTrue(option.is_selected())

        option = options[2]
        self.assertTrue(option.is_selected())

    def testShouldBeAbleToChangeTheSelectedOptionInASelec(self):
        self._loadPage("formPage")
        selectBox = self.driver.find_element(By.XPATH, "//select[@name='selectomatic']")
        options = selectBox.find_elements(By.TAG_NAME, "option")
        one = options[0]
        two = options[1]
        self.assertTrue(one.is_selected())
        self.assertFalse(two.is_selected())

        two.click()
        self.assertFalse(one.is_selected())
        self.assertTrue(two.is_selected())

    def testShouldBeAbleToSelectMoreThanOneOptionFromASelectWhichAllowsMultipleChoice(self):
        self._loadPage("formPage")

        multiSelect = self.driver.find_element(By.ID, "multi")
        options = multiSelect.find_elements(By.TAG_NAME, "option")
        for option in options:
            if not option.is_selected():
                option.click()

        for i in range(len(options)):
            option = options[i]
            self.assertTrue(option.is_selected(), "Option at index is not selected but should be: {0}".format(i))

    def testShouldSelectFirstOptionaultIfNoneIsSelecte(self):
        self._loadPage("formPage")
        selectBox = self.driver.find_element(By.XPATH, "//select[@name='select-default']")
        options = selectBox.find_elements(By.TAG_NAME, "option")
        one = options[0]
        two = options[1]
        self.assertTrue(one.is_selected())
        self.assertFalse(two.is_selected())

        two.click()
        self.assertFalse(one.is_selected())
        self.assertTrue(two.is_selected())

    def testCanSelectElementsInOptGroup(self):
        self._loadPage("selectPage")
        element = self.driver.find_element(By.ID, "two-in-group")
        element.click()
        self.assertTrue(element.is_selected(), "Expected to be selected")

    def testCanGetValueFromOptionViaAttributeWhenAttributeDoesntExis(self):
        self._loadPage("formPage")
        element = self.driver.find_element(By.CSS_SELECTOR, "select[name='select-default'] option")
        self.assertEqual(element.get_attribute("value"), "One")
        element = self.driver.find_element(By.ID, "blankOption")
        self.assertEqual(element.get_attribute("value"), "")

    def testCanGetValueFromOptionViaAttributeWhenAttributeIsEmptyString(self):
        self._loadPage("formPage")
        element = self.driver.find_element(By.ID, "optionEmptyValueSet")
        self.assertEqual(element.get_attribute("value"), "")

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        try:
            # just in case a previous test left open an alert
            self.driver.switch_to.alert().dismiss()
        except Exception:
            pass
        self.driver.get(self._pageURL(name))
