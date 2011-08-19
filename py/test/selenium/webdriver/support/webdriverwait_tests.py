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


import os
import re
import tempfile
import time
import shutil
import unittest
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoSuchFrameException
from selenium.common.exceptions import TimeoutException
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer
from selenium.webdriver.support.ui import WebDriverWait


def not_available_on_remote(func):
    def testMethod(self):
        print self.driver
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod

def findBox0(driver):
    return driver.find_element_by_id("box0")

def findRedBoxes(driver):
    return driver.find_elements_by_class_name("redbox")

def findAtLeastOneRedBox(driver):
    boxes = driver.find_elements_by_class_name("redbox")
    if len(boxes) > 0:
        return boxes
    return False

def setup_module(module):
    WebDriverWaitTest.webserver = SimpleWebServer()
    WebDriverWaitTest.webserver.start()
    WebDriverWaitTest.driver = webdriver.Firefox()

def teardown_module(module):
    WebDriverWaitTest.driver.quit()
    WebDriverWaitTest.webserver.stop()

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

    def testShouldExplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")

        add.click();
        add.click();

        elements = WebDriverWait(self.driver, 2).until(findAtLeastOneRedBox)
        self.assertTrue(len(elements) >= 1)

    def testShouldStillFailToFindAnElemenstWhenExplicitWaiting(self):
        self._loadPage("dynamic")
        elements = WebDriverWait(self.driver, 0.5).until(findRedBoxes)
        self.assertEqual(0, len(elements))
        try:
            elements = WebDriverWait(self.driver, 1).until(findAtLeastOneRedBox)
        except TimeoutException, e:
            pass # we should get a timeout
        except Exception, e:
            self.fail("Expected TimeoutException but got " + str(e))

    def testShouldReturnAfterFirstAttemptToFindManyWhenExplicitlyWaiting(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")
        add.click()
        elements = WebDriverWait(self.driver, 1).until(findRedBoxes)
        self.assertEqual(0, len(elements))

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
