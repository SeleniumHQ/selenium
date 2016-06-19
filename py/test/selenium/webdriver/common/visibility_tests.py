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

import pytest
import unittest
from selenium.common.exceptions import ElementNotVisibleException
from selenium.webdriver.common.by import By


class VisibilityTests(unittest.TestCase):

    def testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot(self):
        self._loadPage("javascriptPage")

        self.assertTrue(self.driver.find_element(by=By.ID, value="displayed").is_displayed())
        self.assertFalse(self.driver.find_element(by=By.ID, value="none").is_displayed())
        self.assertFalse(self.driver.find_element(by=By.ID, value="suppressedParagraph").is_displayed())
        self.assertFalse(self.driver.find_element(by=By.ID, value="hidden").is_displayed())

    def testVisibilityShouldTakeIntoAccountParentVisibility(self):
        self._loadPage("javascriptPage")

        childDiv = self.driver.find_element(by=By.ID, value="hiddenchild")
        hiddenLink = self.driver.find_element(by=By.ID, value="hiddenlink")

        self.assertFalse(childDiv.is_displayed())
        self.assertFalse(hiddenLink.is_displayed())

    def testShouldCountElementsAsVisibleIfStylePropertyHasBeenSet(self):
        self._loadPage("javascriptPage")
        shown = self.driver.find_element(by=By.ID, value="visibleSubElement")
        self.assertTrue(shown.is_displayed())

    def testShouldModifyTheVisibilityOfAnElementDynamically(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="hideMe")
        self.assertTrue(element.is_displayed())
        element.click()
        self.assertFalse(element.is_displayed())

    def testHiddenInputElementsAreNeverVisible(self):
        self._loadPage("javascriptPage")

        shown = self.driver.find_element(by=By.NAME, value="hidden")

        self.assertFalse(shown.is_displayed())

    def testShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="unclickable")

        try:
            element.click()
            self.fail("You should not be able to click on an invisible element")
        except ElementNotVisibleException:
            pass

    def testShouldNotBeAbleToToggleAnElementThatIsNotDisplayed(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="untogglable")

        try:
            element.click()
            self.fail("You should not be able to click an invisible element")
        except ElementNotVisibleException:
            pass

    def testShouldNotBeAbleToSelectAnElementThatIsNotDisplayed(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="untogglable")

        try:
            element.click()
            self.fail("You should not be able to click an invisible element")
        except ElementNotVisibleException:
            pass

    def testShouldNotBeAbleToTypeAnElementThatIsNotDisplayed(self):
        if self.driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver throws the wrong exception")
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="unclickable")

        try:
            element.send_keys("You don't see me")
            self.fail("You should not be able to send keyboard input to an invisible element")
        except ElementNotVisibleException:
            pass

        self.assertTrue(element.get_attribute("value") is not "You don't see me")

    def testShouldSayElementsWithNegativeTransformAreNotDisplayed(self):
        self._loadPage('cssTransform')
        elementX = self.driver.find_element(By.ID, value='parentX')
        self.assertFalse(elementX.is_displayed())
        elementY = self.driver.find_element(By.ID, value='parentY')
        self.assertFalse(elementY.is_displayed())

    def testShouldSayElementsWithParentWithNegativeTransformAreNotDisplayed(self):
        self._loadPage('cssTransform')
        elementX = self.driver.find_element(By.ID, value='childX')
        self.assertFalse(elementX.is_displayed())
        elementY = self.driver.find_element(By.ID, value='childY')
        self.assertFalse(elementY.is_displayed())

    def testShouldSayElementWithZeroTransformIsVisible(self):
        self._loadPage('cssTransform')
        zero_tranform = self.driver.find_element(By.ID, 'zero-tranform')
        self.assertTrue(zero_tranform.is_displayed())

    def testShouldSayElementIsVisibleWhenItHasNegativeTransformButElementisntInANegativeSpace(self):
        self._loadPage('cssTransform2')
        zero_tranform = self.driver.find_element(By.ID, 'negative-percentage-transformY')
        self.assertTrue(zero_tranform.is_displayed())

    def testShouldShowElementNotVisibleWithHiddenAttribute(self):
        self._loadPage('hidden')
        singleHidden = self.driver.find_element(By.ID, 'singleHidden')
        self.assertFalse(singleHidden.is_displayed())

    def testShouldShowElementNotVisibleWhenParentElementHasHiddenAttribute(self):
        self._loadPage('hidden')
        child = self.driver.find_element(By.ID, 'child')
        self.assertFalse(child.is_displayed())

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
