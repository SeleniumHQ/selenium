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


class TestPositionAndSize(object):

    def testShouldBeAbleToDetermineTheLocationOfAnElement(self, driver, pages):
        pages.load("xhtmlTest.html")

        location = self._get_location_in_viewport(driver, By.ID, "username")

        assert location["x"] > 0
        assert location["y"] > 0

    def testShouldGetCoordinatesOfAnElement(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs calculates coordinates differently")
        pages.load("coordinates_tests/simple_page.html")
        assert self._get_location_in_viewport(driver, By.ID, "box") == {"x": 10, "y": 10}
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 10, "y": 10}

    def testShouldGetCoordinatesOfAnEmptyElement(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs calculates coordinates differently")
        pages.load("coordinates_tests/page_with_empty_element.html")
        assert self._get_location_in_viewport(driver, By.ID, "box") == {"x": 10, "y": 10}
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 10, "y": 10}

    def testShouldGetCoordinatesOfATransparentElement(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs calculates coordinates differently")
        pages.load("coordinates_tests/page_with_transparent_element.html")
        assert self._get_location_in_viewport(driver, By.ID, "box") == {"x": 10, "y": 10}
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 10, "y": 10}

    def testShouldGetCoordinatesOfAHiddenElement(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs calculates coordinates differently")
        pages.load("coordinates_tests/page_with_hidden_element.html")
        assert self._get_location_in_viewport(driver, By.ID, "box") == {"x": 10, "y": 10}
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 10, "y": 10}

    def testShouldGetCoordinatesOfAnInvisibleElement(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs calculates coordinates differently")
        pages.load("coordinates_tests/page_with_invisible_element.html")
        assert self._get_location_in_viewport(driver, By.ID, "box") == {"x": 0, "y": 0}
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 0, "y": 0}

    def testShouldScrollPageAndGetCoordinatesOfAnElementThatIsOutOfViewPort(self, driver, pages):
        pages.load("coordinates_tests/page_with_element_out_of_view.html")
        windowHeight = driver.get_window_size()["height"]
        location = self._get_location_in_viewport(driver, By.ID, "box")
        assert location["x"] == 10
        assert location["y"] >= 0
        assert location["y"] <= windowHeight - 100
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 10, "y": 5010}

    def testShouldGetCoordinatesOfAnElementInAFrame(self, driver, pages):
        pages.load("coordinates_tests/element_in_frame.html")
        driver.switch_to_frame(driver.find_element(By.NAME, "ifr"))
        box = driver.find_element(By.ID, "box")
        assert box.location == {"x": 10, "y": 10}
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 10, "y": 10}

    @pytest.mark.ignore_marionette
    def testShouldGetCoordinatesInViewPortOfAnElementInAFrame(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs calculates coordinates differently")
        pages.load("coordinates_tests/element_in_frame.html")
        driver.switch_to_frame(driver.find_element(By.NAME, "ifr"))
        assert self._get_location_in_viewport(driver, By.ID, "box") == {"x": 25, "y": 25}
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 10, "y": 10}

    @pytest.mark.ignore_marionette
    def testShouldGetCoordinatesInViewPortOfAnElementInANestedFrame(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs calculates coordinates differently")
        pages.load("coordinates_tests/element_in_nested_frame.html")
        driver.switch_to_frame(driver.find_element(By.NAME, "ifr"))
        driver.switch_to_frame(driver.find_element(By.NAME, "ifr"))
        assert self._get_location_in_viewport(driver, By.ID, "box") == {"x": 40, "y": 40}
        assert self._get_location_on_page(driver, By.ID, "box") == {"x": 10, "y": 10}

    def testShouldGetCoordinatesOfAnElementWithFixedPosition(self, driver, pages):
        pages.load("coordinates_tests/page_with_fixed_element.html")
        assert self._get_location_in_viewport(driver, By.ID, "fixed")["y"] == 0
        assert self._get_location_on_page(driver, By.ID, "fixed")["y"] == 0

        driver.find_element(By.ID, "bottom").click()
        assert self._get_location_in_viewport(driver, By.ID, "fixed")["y"] == 0
        assert self._get_location_on_page(driver, By.ID, "fixed")["y"] > 0

    def testShouldCorrectlyIdentifyThatAnElementHasWidthAndHeight(self, driver, pages):
        pages.load("xhtmlTest.html")

        shrinko = driver.find_element(By.ID, "linkId")
        size = shrinko.size
        assert size["width"] > 0
        assert size["height"] > 0

    def _get_location_in_viewport(self, driver, by, locator):
        element = driver.find_element(by, locator)
        return element.location_once_scrolled_into_view

    def _get_location_on_page(self, driver, by, locator):
        element = driver.find_element(by, locator)
        return element.location
