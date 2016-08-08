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

from selenium.webdriver.support.wait import WebDriverWait


class TestClassRepr(object):

    def testShouldImplementReprForWebDriver(self, driver):
        driver_repr = repr(driver)
        assert type(driver).__name__ in driver_repr
        assert driver.session_id in driver_repr

    def testShouldImplementReprForWebElement(self, driver, pages):
        pages.load('simpleTest.html')
        elem = driver.find_element_by_id("validImgTag")
        elem_repr = repr(elem)
        assert type(elem).__name__ in elem_repr
        assert driver.session_id in elem_repr
        assert elem._id in elem_repr

    def testShouldImplementReprForWait(self, driver):
        wait = WebDriverWait(driver, 30)
        wait_repr = repr(wait)
        assert type(wait).__name__ in wait_repr
        assert driver.session_id in wait_repr
