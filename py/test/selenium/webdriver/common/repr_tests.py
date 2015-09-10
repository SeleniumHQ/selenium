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
from selenium.webdriver.support.wait import WebDriverWait


class ClassReprTests(unittest.TestCase):

    def testShouldImplementReprForWebDriver(self):
        driver_repr = repr(self.driver)
        self.assertTrue(type(self.driver).__name__ in driver_repr)
        self.assertTrue(self.driver.session_id in driver_repr)

    def testShouldImplementReprForWebElement(self):
        self.driver.get(self.webserver.where_is('simpleTest.html'))
        elem = self.driver.find_element_by_id("validImgTag")
        elem_repr = repr(elem)
        self.assertTrue(type(elem).__name__ in elem_repr)
        self.assertTrue(self.driver.session_id in elem_repr)
        self.assertTrue(elem._id in elem_repr)

    def testShouldImplementReprForWait(self):
        wait = WebDriverWait(self.driver, 30)
        wait_repr = repr(wait)
        self.assertTrue(type(wait).__name__ in wait_repr)
        self.assertTrue(self.driver.session_id in wait_repr)
