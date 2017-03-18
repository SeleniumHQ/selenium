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

from selenium.webdriver.common.by import By


@pytest.mark.xfail_ie
def testShouldBeAbleToClickOnElementsWithOpacityZero(driver, pages):
    pages.load("click_jacker.html")
    element = driver.find_element(By.ID, "clickJacker")
    assert '0' == element.value_of_css_property("opacity"), \
        "Precondition failed: clickJacker should be transparent.\
        Value was %s" % element.value_of_css_property("opacity")
    element.click()
    assert '1' == element.value_of_css_property("opacity")


@pytest.mark.xfail_ie
def testShouldBeAbleToSelectOptionsFromAnInvisibleSelect(driver, pages):
    pages.load("formPage.html")
    select = driver.find_element(By.ID, "invisi_select")
    options = select.find_elements(By.TAG_NAME, "option")
    apples = options[0]
    oranges = options[1]

    assert apples.is_selected()
    assert not oranges.is_selected()

    oranges.click()
    assert not apples.is_selected()
    assert oranges.is_selected()
