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

import base64
import imghdr

import pytest

from selenium.webdriver.common.by import By


def test_get_screenshot_as_base64(driver, pages):
    pages.load("simpleTest.html")
    result = base64.b64decode(driver.get_screenshot_as_base64())
    assert imghdr.what('', result) == 'png'


def test_get_screenshot_as_png(driver, pages):
    pages.load("simpleTest.html")
    result = driver.get_screenshot_as_png()
    assert imghdr.what('', result) == 'png'


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_get_element_screenshot(driver, pages):
    pages.load("simpleTest.html")
    element = driver.find_element(By.ID, "multiline")
    result = base64.b64decode(element.screenshot_as_base64)
    assert imghdr.what('', result) == 'png'
