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

"""Accessibility snapshots need BiDi (ADR 18205).

A WebDriver Classic session raises rather than returning a partial tree. This file runs in
the classic suites only.
"""

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By


def test_classic_session_raises_for_the_whole_page(driver, pages):
    pages.load("accessibility/001-headings-and-landmarks.html")
    if driver.capabilities.get("webSocketUrl"):
        pytest.skip("this session has BiDi")

    with pytest.raises(WebDriverException, match="BiDi"):
        driver.accessibility_snapshot()


def test_classic_session_raises_for_an_element(driver, pages):
    pages.load("accessibility/001-headings-and-landmarks.html")
    if driver.capabilities.get("webSocketUrl"):
        pytest.skip("this session has BiDi")

    with pytest.raises(WebDriverException, match="BiDi"):
        driver.find_element(By.TAG_NAME, "body").accessibility_snapshot()
