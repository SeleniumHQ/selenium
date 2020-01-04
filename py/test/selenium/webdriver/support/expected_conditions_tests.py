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

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement


def test_any_of_true(driver, pages):
    pages.load("simpleTest.html")
    WebDriverWait(driver, 0.1).until(EC.any_of(
        EC.title_is("Nope"), EC.title_is("Hello WebDriver")))


def test_any_of_false(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.1).until(EC.any_of(
            EC.title_is("Nope"), EC.title_is("Still Nope")))


def test_all_of_true(driver, pages):
    pages.load("simpleTest.html")
    results = WebDriverWait(driver, 0.1).until(EC.all_of(
        EC.title_is("Hello WebDriver"),
        EC.visibility_of_element_located((By.ID, "oneline"))))
    assert results[0] is True
    assert isinstance(results[1], WebElement)


def test_all_of_false(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.1).until(EC.all_of(
            EC.title_is("Nope"), EC.title_is("Still Nope")))


def test_none_of_true(driver, pages):
    pages.load("simpleTest.html")
    WebDriverWait(driver, 0.1).until(EC.none_of(
        EC.title_is("Nope"), EC.title_is("Still Nope")))


def test_none_of_false(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.1).until(EC.none_of(
            EC.title_is("Nope"), EC.title_is("Hello WebDriver")))
