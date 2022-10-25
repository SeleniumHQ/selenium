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

from selenium.common.exceptions import InvalidElementStateException
from selenium.webdriver.common.by import By


def test_writable_text_input_should_clear(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element(By.ID, "writableTextInput")
    element.clear()
    assert "" == element.get_attribute("value")


def test_text_input_should_not_clear_when_disabled(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element(By.ID, "textInputNotEnabled")
    assert not element.is_enabled()
    with pytest.raises(InvalidElementStateException):
        element.clear()


def test_text_input_should_not_clear_when_read_only(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element(By.ID, "readOnlyTextInput")
    with pytest.raises(InvalidElementStateException):
        element.clear()


def test_writable_text_area_should_clear(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element(By.ID, "writableTextArea")
    element.clear()
    assert "" == element.get_attribute("value")


def test_text_area_should_not_clear_when_disabled(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element(By.ID, "textAreaNotEnabled")
    with pytest.raises(InvalidElementStateException):
        element.clear()


def test_text_area_should_not_clear_when_read_only(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element(By.ID, "textAreaReadOnly")
    with pytest.raises(InvalidElementStateException):
        element.clear()


def test_content_editable_area_should_clear(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element(By.ID, "content-editable")
    element.clear()
    assert "" == element.text
