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


def testWritableTextInputShouldClear(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element_by_id("writableTextInput")
    element.clear()
    assert "" == element.get_attribute("value")


def testTextInputShouldNotClearWhenDisabled(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element_by_id("textInputnotenabled")
    assert not element.is_enabled()
    with pytest.raises(InvalidElementStateException):
        element.clear()


def testTextInputShouldNotClearWhenReadOnly(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element_by_id("readOnlyTextInput")
    with pytest.raises(InvalidElementStateException):
        element.clear()


def testWritableTextAreaShouldClear(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element_by_id("writableTextArea")
    element.clear()
    assert "" == element.get_attribute("value")


def testTextAreaShouldNotClearWhenDisabled(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element_by_id("textAreaNotenabled")
    with pytest.raises(InvalidElementStateException):
        element.clear()


def testTextAreaShouldNotClearWhenReadOnly(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element_by_id("textAreaReadOnly")
    with pytest.raises(InvalidElementStateException):
        element.clear()


def testContentEditableAreaShouldClear(driver, pages):
    pages.load("readOnlyPage.html")
    element = driver.find_element_by_id("content-editable")
    element.clear()
    assert "" == element.text
