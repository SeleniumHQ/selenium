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


def test_should_be_able_to_determine_the_location_of_an_element(driver, pages):
    pages.load("xhtmlTest.html")
    location = driver.find_element(By.ID, "username").location_once_scrolled_into_view
    assert location["x"] > 0
    assert location["y"] > 0


@pytest.mark.parametrize(
    "page",
    (
        "coordinates_tests/simple_page.html",
        "coordinates_tests/page_with_empty_element.html",
        "coordinates_tests/page_with_transparent_element.html",
        "coordinates_tests/page_with_hidden_element.html",
    ),
    ids=("basic", "empty", "transparent", "hidden"),
)
@pytest.mark.xfail_safari
def test_should_get_coordinates_of_an_element(page, driver, pages):
    pages.load(page)
    element = driver.find_element(By.ID, "box")
    _check_location(element.location_once_scrolled_into_view, x=10, y=10)
    _check_location(element.location, x=10, y=10)


@pytest.mark.xfail_safari
def test_should_get_coordinates_of_an_invisible_element(driver, pages):
    pages.load("coordinates_tests/page_with_invisible_element.html")
    element = driver.find_element(By.ID, "box")
    _check_location(element.location_once_scrolled_into_view, x=0, y=0)
    _check_location(element.location, x=0, y=0)


def test_should_scroll_page_and_get_coordinates_of_an_element_that_is_out_of_view_port(driver, pages):
    pages.load("coordinates_tests/page_with_element_out_of_view.html")
    element = driver.find_element(By.ID, "box")
    windowHeight = driver.get_window_size()["height"]
    _check_location(element.location_once_scrolled_into_view, x=10)
    assert 0 <= element.location_once_scrolled_into_view["y"] <= (windowHeight - 100)
    _check_location(element.location, x=10, y=5010)


@pytest.mark.xfail_chrome
@pytest.mark.xfail_edge
@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
@pytest.mark.xfail_safari
def test_should_get_coordinates_of_an_element_in_aframe(driver, pages):
    pages.load("coordinates_tests/element_in_frame.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "ifr"))
    element = driver.find_element(By.ID, "box")
    _check_location(element.location_once_scrolled_into_view, x=25, y=25)
    _check_location(element.location, x=10, y=10)


@pytest.mark.xfail_chrome
@pytest.mark.xfail_edge
@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
@pytest.mark.xfail_safari
def test_should_get_coordinates_of_an_element_in_anested_frame(driver, pages):
    pages.load("coordinates_tests/element_in_nested_frame.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "ifr"))
    driver.switch_to.frame(driver.find_element(By.NAME, "ifr"))
    element = driver.find_element(By.ID, "box")
    _check_location(element.location_once_scrolled_into_view, x=40, y=40)
    _check_location(element.location, x=10, y=10)


def test_should_get_coordinates_of_an_element_with_fixed_position(driver, pages):
    pages.load("coordinates_tests/page_with_fixed_element.html")
    element = driver.find_element(By.ID, "fixed")
    _check_location(element.location_once_scrolled_into_view, y=0)
    _check_location(element.location, y=0)

    driver.find_element(By.ID, "bottom").click()
    _check_location(element.location_once_scrolled_into_view, y=0)
    assert element.location["y"] > 0


def test_should_correctly_identify_that_an_element_has_width_and_height(driver, pages):
    pages.load("xhtmlTest.html")
    shrinko = driver.find_element(By.ID, "linkId")
    size = shrinko.size
    assert size["width"] > 0
    assert size["height"] > 0


def _check_location(location, **kwargs):
    expected = kwargs.items()
    actual = location.items()
    assert expected <= actual
