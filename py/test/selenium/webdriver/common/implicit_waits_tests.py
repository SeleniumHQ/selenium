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
from selenium.common.exceptions import NoSuchElementException


def not_available_on_remote(func):
    def testMethod(self):
        print(self.driver)
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod


class ImplicitWaitTest(unittest.TestCase):

    def testShouldImplicitlyWaitForASingleElement(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")
        self.driver.implicitly_wait(3)
        add.click()
        self.driver.find_element_by_id("box0")  # All is well if this doesn't throw.

    def testShouldStillFailToFindAnElementWhenImplicitWaitsAreEnabled(self):
        self._loadPage("dynamic")
        self.driver.implicitly_wait(0.5)
        try:
            self.driver.find_element_by_id("box0")
            self.fail("Expected NoSuchElementException to have been thrown")
        except NoSuchElementException as e:
            pass
        except Exception as e:
            self.fail("Expected NoSuchElementException but got " + str(e))

    def testShouldReturnAfterFirstAttemptToFindOneAfterDisablingImplicitWaits(self):
        self._loadPage("dynamic")
        self.driver.implicitly_wait(3)
        self.driver.implicitly_wait(0)
        try:
            self.driver.find_element_by_id("box0")
            self.fail("Expected NoSuchElementException to have been thrown")
        except NoSuchElementException as e:
            pass
        except Exception as e:
            self.fail("Expected NoSuchElementException but got " + str(e))

    def testShouldImplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")

        self.driver.implicitly_wait(2)
        add.click()
        add.click()

        elements = self.driver.find_elements_by_class_name("redbox")
        self.assertTrue(len(elements) >= 1)

    def testShouldStillFailToFindAnElemenstWhenImplicitWaitsAreEnabled(self):
        self._loadPage("dynamic")

        self.driver.implicitly_wait(0.5)
        elements = self.driver.find_elements_by_class_name("redbox")
        self.assertEqual(0, len(elements))

    def testShouldReturnAfterFirstAttemptToFindManyAfterDisablingImplicitWaits(self):
        self._loadPage("dynamic")
        add = self.driver.find_element_by_id("adder")
        self.driver.implicitly_wait(1.1)
        self.driver.implicitly_wait(0)
        add.click()
        elements = self.driver.find_elements_by_class_name("redbox")
        self.assertEqual(0, len(elements))

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
