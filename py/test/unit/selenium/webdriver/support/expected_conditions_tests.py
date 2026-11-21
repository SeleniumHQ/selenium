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

from unittest import mock

import pytest

from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC

LOCATOR = (By.ID, "target")


def stale_element():
    element = mock.create_autospec(WebElement, instance=True)
    for name in ("is_displayed", "is_enabled", "is_selected"):
        getattr(element, name).side_effect = StaleElementReferenceException("element was re-rendered")
    return element


@pytest.mark.parametrize(
    "condition",
    [
        EC.element_to_be_clickable(LOCATOR),
        EC.element_located_to_be_selected(LOCATOR),
    ],
    ids=["element_to_be_clickable", "element_located_to_be_selected"],
)
def test_located_condition_returns_false_when_element_goes_stale(condition):
    driver = mock.Mock()
    driver.find_element.return_value = stale_element()

    assert condition(driver) is False


def test_element_to_be_clickable_returns_false_when_given_element_goes_stale():
    assert EC.element_to_be_clickable(stale_element())(mock.Mock()) is False


def test_visibility_of_any_elements_located_returns_false_when_element_goes_stale():
    driver = mock.Mock()
    driver.find_elements.return_value = [stale_element()]

    assert EC.visibility_of_any_elements_located(LOCATOR)(driver) is False
