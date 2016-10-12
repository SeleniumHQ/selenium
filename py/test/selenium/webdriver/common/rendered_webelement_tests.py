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


class TestRenderedWebElement(object):

    @pytest.mark.ignore_chrome
    def testShouldPickUpStyleOfAnElement(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c == True:
            pytest.xfail("Marionette and W3C Issue: https://github.com/w3c/webdriver/issues/417")
        pages.load("javascriptPage.html")

        element = driver.find_element(by=By.ID, value="green-parent")
        backgroundColour = element.value_of_css_property("background-color")
        assert "rgba(0, 128, 0, 1)" == backgroundColour

        element = driver.find_element(by=By.ID, value="red-item")
        backgroundColour = element.value_of_css_property("background-color")
        assert "rgba(255, 0, 0, 1)" == backgroundColour

    @pytest.mark.ignore_chrome
    def testShouldAllowInheritedStylesToBeUsed(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs has an issue with getting the right value for background-color")
        pages.load("javascriptPage.html")

        element = driver.find_element(by=By.ID, value="green-item")
        backgroundColour = element.value_of_css_property("background-color")
        assert "transparent" == backgroundColour

    def testShouldCorrectlyIdentifyThatAnElementHasWidth(self, driver, pages):
        pages.load("xhtmlTest.html")

        shrinko = driver.find_element(by=By.ID, value="linkId")
        size = shrinko.size
        assert size["width"] > 0
        assert size["height"] > 0

    def testShouldBeAbleToDetermineTheRectOfAnElement(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver does not support rect command")
        if not driver.w3c:
            pytest.xfail("Not a W3C WebDriver compliant browser")
        pages.load("xhtmlTest.html")

        element = driver.find_element(By.ID, "username")
        rect = element.rect

        assert rect["x"] > 0
        assert rect["y"] > 0
        assert rect["width"] > 0
        assert rect["height"] > 0
