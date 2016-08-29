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
import unittest
from selenium.webdriver.common.by import By


class PositionAndSizeTest(unittest.TestCase):

    def testShouldBeAbleToDetermineTheLocationOfAnElement(self):
        self._loadPage("xhtmlTest")

        location = self._get_location_in_viewport(By.ID, "username")

        self.assertGreater(location["x"], 0)
        self.assertGreater(location["y"], 0)

    def testShouldGetCoordinatesOfAnElement(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/simple_page.html"))
        self.assertEqual(self._get_location_in_viewport(By.ID, "box"), {"x": 10, "y": 10})
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 10, "y": 10})

    def testShouldGetCoordinatesOfAnEmptyElement(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/page_with_empty_element.html"))
        self.assertEqual(self._get_location_in_viewport(By.ID, "box"), {"x": 10, "y": 10})
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 10, "y": 10})

    def testShouldGetCoordinatesOfATransparentElement(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/page_with_transparent_element.html"))
        self.assertEqual(self._get_location_in_viewport(By.ID, "box"), {"x": 10, "y": 10})
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 10, "y": 10})

    def testShouldGetCoordinatesOfAHiddenElement(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/page_with_hidden_element.html"))
        self.assertEqual(self._get_location_in_viewport(By.ID, "box"), {"x": 10, "y": 10})
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 10, "y": 10})

    def testShouldGetCoordinatesOfAnInvisibleElement(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/page_with_invisible_element.html"))
        self.assertEqual(self._get_location_in_viewport(By.ID, "box"), {"x": 0, "y": 0})
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 0, "y": 0})

    def testShouldScrollPageAndGetCoordinatesOfAnElementThatIsOutOfViewPort(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/page_with_element_out_of_view.html"))
        windowHeight = self.driver.get_window_size()["height"]
        location = self._get_location_in_viewport(By.ID, "box")
        self.assertEqual(location["x"], 10)
        self.assertGreaterEqual(location["y"], 0)
        self.assertLessEqual(location["y"], windowHeight - 100)
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 10, "y": 5010})

    def testShouldGetCoordinatesOfAnElementInAFrame(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/element_in_frame.html"))
        self.driver.switch_to_frame(self.driver.find_element(By.NAME, "ifr"))
        box = self.driver.find_element(By.ID, "box")
        self.assertEqual(box.location, {"x": 10, "y": 10})
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 10, "y": 10})

    @pytest.mark.ignore_marionette
    def testShouldGetCoordinatesInViewPortOfAnElementInAFrame(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/element_in_frame.html"))
        self.driver.switch_to_frame(self.driver.find_element(By.NAME, "ifr"))
        self.assertEqual(self._get_location_in_viewport(By.ID, "box"), {"x": 25, "y": 25})
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 10, "y": 10})

    @pytest.mark.ignore_marionette
    def testShouldGetCoordinatesInViewPortOfAnElementInANestedFrame(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/element_in_nested_frame.html"))
        self.driver.switch_to_frame(self.driver.find_element(By.NAME, "ifr"))
        self.driver.switch_to_frame(self.driver.find_element(By.NAME, "ifr"))
        self.assertEqual(self._get_location_in_viewport(By.ID, "box"), {"x": 40, "y": 40})
        self.assertEqual(self._get_location_on_page(By.ID, "box"), {"x": 10, "y": 10})

    def testShouldGetCoordinatesOfAnElementWithFixedPosition(self):
        self.driver.get(self.webserver.where_is("coordinates_tests/page_with_fixed_element.html"))
        self.assertEqual(self._get_location_in_viewport(By.ID, "fixed")["y"], 0)
        self.assertEqual(self._get_location_on_page(By.ID, "fixed")["y"], 0)

        self.driver.find_element(By.ID, "bottom").click()
        self.assertEqual(self._get_location_in_viewport(By.ID, "fixed")["y"], 0)
        self.assertGreater(self._get_location_on_page(By.ID, "fixed")["y"], 0)

    def testShouldCorrectlyIdentifyThatAnElementHasWidthAndHeight(self):
        self._loadPage("xhtmlTest")

        shrinko = self.driver.find_element(By.ID, "linkId")
        size = shrinko.size
        self.assertTrue(size["width"] > 0)
        self.assertTrue(size["height"] > 0)

    def _get_location_in_viewport(self, by, locator):
        element = self.driver.find_element(by, locator)
        return element.location_once_scrolled_into_view

    def _get_location_on_page(self, by, locator):
        element = self.driver.find_element(by, locator)
        return element.location

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
