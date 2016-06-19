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
import time
import unittest
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import WebDriverException
from selenium.common.exceptions import InvalidElementStateException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def not_available_on_remote(func):
    def testMethod(self):
        print(self.driver)
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod


def throwSERE(driver):
    raise StaleElementReferenceException("test")


class WebDriverWaitTest(unittest.TestCase):

    def testShouldExplicitlyWaitForASingleElement(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")
        add.click()
        WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "box0")))  # All is well if this doesn't throw.

    def testShouldStillFailToFindAnElementWithExplicitWait(self):
        self._loadPage("dynamic")
        try:
            WebDriverWait(self.driver, 0.7).until(EC.presence_of_element_located((By.ID, "box0")))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        except Exception as e:
            self.fail("Expected TimeoutException but got " + str(e))

    def testShouldExplicitlyWaituntilAtLeastOneElementIsFoundWhenSearchingForMany(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")

        add.click()
        add.click()

        elements = WebDriverWait(self.driver, 2).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "redbox")))
        self.assertTrue(len(elements) >= 1)

    def testShouldFailToFindElementsWhenExplicitWaiting(self):
        self._loadPage("dynamic")
        with self.assertRaises(TimeoutException):
            WebDriverWait(self.driver, 0.7).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "redbox")))

    def testShouldWaitUntilAtLeastOneVisibleElementsIsFoundWhenSearchingForMany(self):
        self._loadPage("hidden_partially")
        add_visible = self.driver.find_element_by_id("addVisible")
        add_hidden = self.driver.find_element_by_id("addHidden")

        add_visible.click()
        add_visible.click()
        add_hidden.click()

        elements = WebDriverWait(self.driver, 2).until(EC.visibility_of_any_elements_located((By.CLASS_NAME, "redbox")))
        self.assertTrue(len(elements) == 2)

    def testShouldFailToFindVisibleElementsWhenExplicitWaiting(self):
        self._loadPage("hidden_partially")
        with self.assertRaises(TimeoutException):
            WebDriverWait(self.driver, 0.7).until(EC.visibility_of_any_elements_located((By.CLASS_NAME, "redbox")))

    def testShouldWaitOnlyAsLongAsTimeoutSpecifiedWhenImplicitWaitsAreSet(self):
        self._loadPage("dynamic")
        self.driver.implicitly_wait(0.5)
        try:
            start = time.time()
            try:
                WebDriverWait(self.driver, 1).until(EC.presence_of_element_located((By.ID, "box0")))
                self.fail("Expected TimeoutException to have been thrown")
            except TimeoutException:
                pass
            self.assertTrue(time.time() - start < 1.5,
                            "Expected to take just over 1 second to execute, but took %f" %
                            (time.time() - start))
        finally:
            self.driver.implicitly_wait(0)

    def testShouldWaitAtLeastOnce(self):
        self._loadPage("simpleTest")
        elements = WebDriverWait(self.driver, 0).until(lambda d: d.find_elements_by_tag_name('h1'))
        self.assertTrue(len(elements) >= 1)

    def testWaitUntilNotReturnsIfEvaluatesToFalse(self):
        self.assertFalse(WebDriverWait(self.driver, 1).until_not(lambda d: False))

    def testWaitShouldStillFailIfProduceIgnoredException(self):
        ignored = (InvalidElementStateException, StaleElementReferenceException)
        try:
            WebDriverWait(self.driver, 1, 0.7, ignored_exceptions=ignored).until(throwSERE)
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass

    def testWaitShouldStillFailIfProduceChildOfIgnoredException(self):
        ignored = (WebDriverException)
        try:
            WebDriverWait(self.driver, 1, 0.7, ignored_exceptions=ignored).until(throwSERE)
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass

    def testWaitUntilNotShouldNotFailIfProduceIgnoredException(self):
        ignored = (InvalidElementStateException, StaleElementReferenceException)
        self.assertTrue(WebDriverWait(self.driver, 1, 0.7, ignored_exceptions=ignored).until_not(throwSERE))

    def testExpectedConditionTitleIs(self):
        self._loadPage("blank")
        WebDriverWait(self.driver, 1).until(EC.title_is("blank"))
        self.driver.execute_script("setTimeout(function(){document.title='not blank'}, 200)")
        WebDriverWait(self.driver, 1).until(EC.title_is("not blank"))
        self.assertEqual(self.driver.title, 'not blank')
        try:
            WebDriverWait(self.driver, 0.7).until(EC.title_is("blank"))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass

    def testExpectedConditionTitleContains(self):
        self._loadPage("blank")
        self.driver.execute_script("setTimeout(function(){document.title='not blank'}, 200)")
        WebDriverWait(self.driver, 1).until(EC.title_contains("not"))
        self.assertEqual(self.driver.title, 'not blank')
        try:
            WebDriverWait(self.driver, 0.7).until(EC.title_contains("blanket"))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass

    def testExpectedConditionVisibilityOfElementLocated(self):
        self._loadPage("javascriptPage")
        try:
            WebDriverWait(self.driver, 0.7).until(EC.visibility_of_element_located((By.ID, 'clickToHide')))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.find_element_by_id('clickToShow').click()
        element = WebDriverWait(self.driver, 5).until(EC.visibility_of_element_located((By.ID, 'clickToHide')))
        self.assertTrue(element.is_displayed())

    def testExpectedConditionVisibilityOf(self):
        self._loadPage("javascriptPage")
        hidden = self.driver.find_element_by_id('clickToHide')
        try:
            WebDriverWait(self.driver, 0.7).until(EC.visibility_of(hidden))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.find_element_by_id('clickToShow').click()
        element = WebDriverWait(self.driver, 5).until(EC.visibility_of(hidden))
        self.assertTrue(element.is_displayed())

    def testExpectedConditionTextToBePresentInElement(self):
        self._loadPage('booleanAttributes')
        try:
            WebDriverWait(self.driver, 0.7).until(EC.text_to_be_present_in_element((By.ID, 'unwrappable'), 'Expected'))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){var el = document.getElementById('unwrappable'); el.textContent = el.innerText = 'Unwrappable Expected text'}, 200)")
        WebDriverWait(self.driver, 1).until(EC.text_to_be_present_in_element((By.ID, 'unwrappable'), 'Expected'))
        self.assertEqual('Unwrappable Expected text', self.driver.find_element_by_id('unwrappable').text)

    def testExpectedConditionTextToBePresentInElementValue(self):
        self._loadPage('booleanAttributes')
        try:
            WebDriverWait(self.driver, 1).until(EC.text_to_be_present_in_element_value((By.ID, 'inputRequired'), 'Expected'))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){document.getElementById('inputRequired').value = 'Example Expected text'}, 200)")
        WebDriverWait(self.driver, 1).until(EC.text_to_be_present_in_element_value((By.ID, 'inputRequired'), 'Expected'))
        self.assertEqual('Example Expected text', self.driver.find_element_by_id('inputRequired').get_attribute('value'))

    def testExpectedConditionFrameToBeAvailableAndSwitchToItByName(self):
        self._loadPage("blank")
        try:
            WebDriverWait(self.driver, 1).until(EC.frame_to_be_available_and_switch_to_it('myFrame'))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){var f = document.createElement('iframe'); f.id='myFrame'; f.src = '" + self._pageURL('iframeWithAlert') + "'; document.body.appendChild(f)}, 200)")
        WebDriverWait(self.driver, 1).until(EC.frame_to_be_available_and_switch_to_it('myFrame'))
        self.assertEqual('click me', self.driver.find_element_by_id('alertInFrame').text)

    def testExpectedConditionFrameToBeAvailableAndSwitchToItByLocator(self):
        self._loadPage("blank")
        try:
            WebDriverWait(self.driver, 1).until(EC.frame_to_be_available_and_switch_to_it((By.ID, 'myFrame')))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){var f = document.createElement('iframe'); f.id='myFrame'; f.src = '" + self._pageURL('iframeWithAlert') + "'; document.body.appendChild(f)}, 200)")
        WebDriverWait(self.driver, 1).until(EC.frame_to_be_available_and_switch_to_it((By.ID, 'myFrame')))
        self.assertEqual('click me', self.driver.find_element_by_id('alertInFrame').text)

    def testExpectedConditionInvisiblityOfElementLocated(self):
        self._loadPage("javascriptPage")
        self.driver.execute_script("delayedShowHide(0, true)")
        try:
            WebDriverWait(self.driver, 0.7).until(EC.invisibility_of_element_located((By.ID, 'clickToHide')))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("delayedShowHide(200, false)")
        element = WebDriverWait(self.driver, 0.7).until(EC.invisibility_of_element_located((By.ID, 'clickToHide')))
        self.assertFalse(element.is_displayed())

    def testExpectedConditionElementToBeClickable(self):
        self._loadPage("javascriptPage")
        try:
            WebDriverWait(self.driver, 0.7).until(EC.element_to_be_clickable((By.ID, 'clickToHide')))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("delayedShowHide(200, true)")
        WebDriverWait(self.driver, 0.7).until(EC.element_to_be_clickable((By.ID, 'clickToHide')))
        element = self.driver.find_element_by_id('clickToHide')
        element.click()
        WebDriverWait(self.driver, 3.5).until(EC.invisibility_of_element_located((By.ID, 'clickToHide')))
        self.assertFalse(element.is_displayed())

    def testExpectedConditionStalenessOf(self):
        self._loadPage('dynamicallyModifiedPage')
        element = self.driver.find_element_by_id('element-to-remove')
        try:
            WebDriverWait(self.driver, 0.7).until(EC.staleness_of(element))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.find_element_by_id('buttonDelete').click()
        self.assertEqual('element', element.text)
        WebDriverWait(self.driver, 0.7).until(EC.staleness_of(element))
        try:
            element.text
            self.fail("Expected StaleReferenceException to have been thrown")
        except StaleElementReferenceException:
            pass

    def testExpectedConditionElementToBeSelected(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_id('checky')
        try:
            WebDriverWait(self.driver, 0.7).until(EC.element_to_be_selected(element))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
        WebDriverWait(self.driver, 0.7).until(EC.element_to_be_selected(element))
        self.assertTrue(element.is_selected())

    def testExpectedConditionElementLocatedToBeSelected(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_id('checky')
        try:
            WebDriverWait(self.driver, 0.7).until(EC.element_located_to_be_selected((By.ID, 'checky')))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
        WebDriverWait(self.driver, 0.7).until(EC.element_located_to_be_selected((By.ID, 'checky')))
        self.assertTrue(element.is_selected())

    def testExpectedConditionElementSelectionStateToBe(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_id('checky')
        WebDriverWait(self.driver, 0.7).until(EC.element_selection_state_to_be(element, False))
        self.assertFalse(element.is_selected())
        try:
            WebDriverWait(self.driver, 0.7).until(EC.element_selection_state_to_be(element, True))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
        WebDriverWait(self.driver, 0.7).until(EC.element_selection_state_to_be(element, True))
        self.assertTrue(element.is_selected())

    def testExpectedConditionElementLocatedSelectionStateToBe(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_id('checky')
        WebDriverWait(self.driver, 0.7).until(EC.element_located_selection_state_to_be((By.ID, 'checky'), False))
        self.assertFalse(element.is_selected())
        try:
            WebDriverWait(self.driver, 0.7).until(EC.element_located_selection_state_to_be((By.ID, 'checky'), True))
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
        WebDriverWait(self.driver, 0.7).until(EC.element_located_selection_state_to_be((By.ID, 'checky'), True))
        self.assertTrue(element.is_selected())

    def testExpectedConditionAlertIsPresent(self):
        if self.driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver does not support alerts")
        self._loadPage('blank')
        try:
            WebDriverWait(self.driver, 0.7).until(EC.alert_is_present())
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException:
            pass
        self.driver.execute_script("setTimeout(function(){alert('alerty')}, 200)")
        WebDriverWait(self.driver, 0.7).until(EC.alert_is_present())
        alert = self.driver.switch_to.alert
        self.assertEqual('alerty', alert.text)
        alert.dismiss()

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
