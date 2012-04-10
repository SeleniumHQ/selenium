#!/usr/bin/python

# Copyright 2011 WebDriver committers
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


import time
import unittest
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoSuchFrameException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait


def not_available_on_remote(func):
    def testMethod(self):
        print self.driver
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod

findBox0 = lambda driver: driver.find_element_by_id("box0")

findRedBoxes = lambda driver: driver.find_elements_by_class_name("redbox")

def findAtLeastOneRedBox(driver):
    boxes = driver.find_elements_by_class_name("redbox")
    if len(boxes) > 0:
        return boxes
    return False

class WebDriverWaitTest(unittest.TestCase):

    def testShouldExplicitlyWaitForASingleElement(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")
        add.click();
        WebDriverWait(self.driver, 3).until(findBox0)  # All is well if this doesn't throw.

    def testShouldStillFailToFindAnElementWithExplicitWait(self):
        self._loadPage("dynamic")
        try:
            WebDriverWait(self.driver, 0.5).until(findBox0)
            self.fail("Expected TimeoutException to have been thrown")
        except TimeoutException, e:
            pass
        except Exception, e:
            self.fail("Expected TimeoutException but got " + str(e))

    def testShouldExplicitlyWaituntilAtLeastOneElementIsFoundWhenSearchingForMany(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")

        add.click();
        add.click();

        elements = WebDriverWait(self.driver, 2).until(findAtLeastOneRedBox)
        self.assertTrue(len(elements) >= 1)

    def testShouldFailToFindElementsWhenExplicitWaiting(self):
        self._loadPage("dynamic")
        try:
            elements = WebDriverWait(self.driver, 0.5).until(findRedBoxes)
        except TimeoutException, e:
            pass # we should get a timeout
        except Exception, e:
            self.fail("Expected TimeoutException but got " + str(e))

    def testShouldWaitOnlyAsLongAsTimeoutSpecifiedWhenImplicitWaitsAreSet(self):
        self._loadPage("dynamic")
        self.driver.implicitly_wait(0.5)
        try:
            start = time.time()
            try:
                WebDriverWait(self.driver, 1).until(findBox0)
                self.fail("Expected TimeoutException to have been thrown")
            except TimeoutException, e:
                pass
            self.assertTrue(time.time() - start < 1.5, 
                "Expected to take just over 1 second to execute, but took %f" % 
                (time.time() - start))
        finally:
            self.driver.implicitly_wait(0)

    def testShouldWaitAtLeastOnce(self):
        self._loadPage("simpleTest")
        elements_exists = lambda driver: driver.find_elements_by_tag_name('h1')
        elements = WebDriverWait(self.driver, 0).until(elements_exists)
        self.assertTrue(len(elements) >= 1)

    def testWaitUntilNotReturnsIfEvaluatesToFalse(self):
        falsum = lambda driver: False
        self.assertFalse(WebDriverWait(self.driver, 1).until_not(falsum))

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
