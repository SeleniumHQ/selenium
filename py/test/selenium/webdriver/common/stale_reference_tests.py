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

from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By


def test_old_page(driver, pages):
    pages.load("simpleTest.html")
    elem = driver.find_element(by=By.ID, value="links")
    pages.load("xhtmlTest.html")
    msg = r"\/errors#stale-element-reference-exception"
    with pytest.raises(StaleElementReferenceException, match=msg):
        elem.click()


@pytest.mark.xfail_safari
def test_should_not_crash_when_calling_get_size_on_an_obsolete_element(driver, pages):
    pages.load("simpleTest.html")
    elem = driver.find_element(by=By.ID, value="links")
    pages.load("xhtmlTest.html")
    with pytest.raises(StaleElementReferenceException):
        elem.size


@pytest.mark.xfail_safari
def test_should_not_crash_when_querying_the_attribute_of_astale_element(driver, pages):
    pages.load("xhtmlTest.html")
    heading = driver.find_element(by=By.XPATH, value="//h1")
    pages.load("simpleTest.html")
    with pytest.raises(StaleElementReferenceException):
        heading.get_attribute("class")
