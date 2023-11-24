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

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.color import Color


def test_should_pick_up_style_of_an_element(driver, pages):
    pages.load("javascriptPage.html")

    element = driver.find_element(by=By.ID, value="green-parent")
    backgroundColour = Color.from_string(element.value_of_css_property("background-color"))
    assert Color.from_string("rgba(0, 128, 0, 1)") == backgroundColour

    element = driver.find_element(by=By.ID, value="red-item")
    backgroundColour = Color.from_string(element.value_of_css_property("background-color"))
    assert Color.from_string("rgba(255, 0, 0, 1)") == backgroundColour


def test_should_allow_inherited_styles_to_be_used(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="green-item")
    backgroundColour = Color.from_string(element.value_of_css_property("background-color"))
    assert backgroundColour == Color.from_string("transparent")


def test_should_correctly_identify_that_an_element_has_width(driver, pages):
    pages.load("xhtmlTest.html")

    shrinko = driver.find_element(by=By.ID, value="linkId")
    size = shrinko.size
    assert size["width"] > 0
    assert size["height"] > 0


@pytest.mark.xfail_safari(reason="Get Element Rect command not implemented", raises=WebDriverException)
def test_should_be_able_to_determine_the_rect_of_an_element(driver, pages):
    pages.load("xhtmlTest.html")

    element = driver.find_element(By.ID, "username")
    rect = element.rect

    assert rect["x"] > 0
    assert rect["y"] > 0
    assert rect["width"] > 0
    assert rect["height"] > 0
