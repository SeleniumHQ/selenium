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

from selenium.common.exceptions import NoSuchElementException


def testShouldImplicitlyWaitForASingleElement(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element_by_id("adder")
    driver.implicitly_wait(3)
    add.click()
    driver.find_element_by_id("box0")  # All is well if this doesn't throw.


def testShouldStillFailToFindAnElementWhenImplicitWaitsAreEnabled(driver, pages):
    pages.load("dynamic.html")
    driver.implicitly_wait(0.5)
    with pytest.raises(NoSuchElementException):
        driver.find_element_by_id("box0")


def testShouldReturnAfterFirstAttemptToFindOneAfterDisablingImplicitWaits(driver, pages):
    pages.load("dynamic.html")
    driver.implicitly_wait(3)
    driver.implicitly_wait(0)
    with pytest.raises(NoSuchElementException):
        driver.find_element_by_id("box0")


def testShouldImplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element_by_id("adder")

    driver.implicitly_wait(2)
    add.click()
    add.click()

    elements = driver.find_elements_by_class_name("redbox")
    assert len(elements) >= 1


def testShouldStillFailToFindAnElemenstWhenImplicitWaitsAreEnabled(driver, pages):
    pages.load("dynamic.html")

    driver.implicitly_wait(0.5)
    elements = driver.find_elements_by_class_name("redbox")
    assert 0 == len(elements)


def testShouldReturnAfterFirstAttemptToFindManyAfterDisablingImplicitWaits(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element_by_id("adder")
    driver.implicitly_wait(1.1)
    driver.implicitly_wait(0)
    add.click()
    elements = driver.find_elements_by_class_name("redbox")
    assert 0 == len(elements)
