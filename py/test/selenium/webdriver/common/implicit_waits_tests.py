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
from selenium.webdriver.common.by import By


def test_should_implicitly_wait_for_asingle_element(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element(By.ID, "adder")
    driver.implicitly_wait(3)
    add.click()
    driver.find_element(By.ID, "box0")  # All is well if this doesn't throw.


def test_should_still_fail_to_find_an_element_when_implicit_waits_are_enabled(driver, pages):
    pages.load("dynamic.html")
    driver.implicitly_wait(0.5)
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.ID, "box0")


def test_should_return_after_first_attempt_to_find_one_after_disabling_implicit_waits(driver, pages):
    pages.load("dynamic.html")
    driver.implicitly_wait(3)
    driver.implicitly_wait(0)
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.ID, "box0")


def test_should_implicitly_wait_until_at_least_one_element_is_found_when_searching_for_many(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element(By.ID, "adder")

    driver.implicitly_wait(2)
    add.click()
    add.click()

    elements = driver.find_elements(By.CLASS_NAME, "redbox")
    assert len(elements) >= 1


def test_should_still_fail_to_find_an_elemenst_when_implicit_waits_are_enabled(driver, pages):
    pages.load("dynamic.html")

    driver.implicitly_wait(0.5)
    elements = driver.find_elements(By.CLASS_NAME, "redbox")
    assert 0 == len(elements)


def test_should_return_after_first_attempt_to_find_many_after_disabling_implicit_waits(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element(By.ID, "adder")
    driver.implicitly_wait(1.1)
    driver.implicitly_wait(0)
    add.click()
    elements = driver.find_elements(By.CLASS_NAME, "redbox")
    assert 0 == len(elements)
