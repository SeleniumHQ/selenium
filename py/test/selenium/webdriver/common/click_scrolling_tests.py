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

from selenium.common.exceptions import MoveTargetOutOfBoundsException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def test_clicking_on_anchor_scrolls_page(driver, pages):
    scrollScript = """var pageY;
    if (typeof(window.pageYOffset) == 'number') {
      pageY = window.pageYOffset;
    } else {
      pageY = document.documentElement.scrollTop;
    }
    return pageY;"""

    pages.load("macbeth.html")

    driver.find_element(By.PARTIAL_LINK_TEXT, "last speech").click()

    yOffset = driver.execute_script(scrollScript)

    # Focusing on to click, but not actually following,
    # the link will scroll it in to view, which is a few pixels further than 0
    assert yOffset > 300


def test_should_scroll_to_click_on_an_element_hidden_by_overflow(driver, pages):
    pages.load("click_out_of_bounds_overflow.html")

    link = driver.find_element(By.ID, "link")
    try:
        link.click()
    except MoveTargetOutOfBoundsException as e:
        AssertionError("Should not be out of bounds: %s" % e.msg)


def test_should_be_able_to_click_on_an_element_hidden_by_overflow(driver, pages):
    pages.load("scroll.html")

    link = driver.find_element(By.ID, "line8")
    # This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
    link.click()
    assert "line8" == driver.find_element(By.ID, "clicked").text


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_should_be_able_to_click_on_an_element_hidden_by_double_overflow(driver, pages):
    pages.load("scrolling_tests/page_with_double_overflow_auto.html")

    driver.find_element(By.ID, "link").click()
    WebDriverWait(driver, 3).until(EC.title_is("Clicked Successfully!"))


def test_should_be_able_to_click_on_an_element_hidden_by_yoverflow(driver, pages):
    pages.load("scrolling_tests/page_with_y_overflow_auto.html")

    driver.find_element(By.ID, "link").click()
    WebDriverWait(driver, 3).until(EC.title_is("Clicked Successfully!"))


def test_should_not_scroll_overflow_elements_which_are_visible(driver, pages):
    pages.load("scroll2.html")
    list = driver.find_element(By.TAG_NAME, "ul")
    item = list.find_element(By.ID, "desired")
    item.click()
    yOffset = driver.execute_script("return arguments[0].scrollTop", list)
    assert 0 == yOffset, "Should not have scrolled"


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_should_not_scroll_if_already_scrolled_and_element_is_in_view(driver, pages):
    pages.load("scroll3.html")
    driver.find_element(By.ID, "button2").click()
    scrollTop = get_scroll_top(driver)
    driver.find_element(By.ID, "button1").click()
    assert scrollTop == get_scroll_top(driver)


def test_should_be_able_to_click_radio_button_scrolled_into_view(driver, pages):
    pages.load("scroll4.html")
    driver.find_element(By.ID, "radio").click()
    # If we don't throw, we're good


@pytest.mark.xfail_safari
def test_should_scroll_overflow_elements_if_click_point_is_out_of_view_but_element_is_in_view(driver, pages):
    pages.load("scroll5.html")
    driver.find_element(By.ID, "inner").click()
    assert "clicked" == driver.find_element(By.ID, "clicked").text


@pytest.mark.xfail_firefox(reason="https://github.com/w3c/webdriver/issues/408")
@pytest.mark.xfail_remote(reason="https://github.com/w3c/webdriver/issues/408")
@pytest.mark.xfail_safari
def test_should_be_able_to_click_element_in_aframe_that_is_out_of_view(driver, pages):
    pages.load("scrolling_tests/page_with_frame_out_of_view.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "frame"))
    element = driver.find_element(By.NAME, "checkbox")
    element.click()
    assert element.is_selected()


def test_should_be_able_to_click_element_that_is_out_of_view_in_aframe(driver, pages):
    pages.load("scrolling_tests/page_with_scrolling_frame.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "scrolling_frame"))
    element = driver.find_element(By.NAME, "scroll_checkbox")
    element.click()
    assert element.is_selected()


def test_should_not_be_able_to_click_element_that_is_out_of_view_in_anon_scrollable_frame(driver, pages):
    pages.load("scrolling_tests/page_with_non_scrolling_frame.html")
    driver.switch_to.frame("scrolling_frame")
    element = driver.find_element(By.NAME, "scroll_checkbox")
    element.click()
    # TODO we should assert that the click was unsuccessful


@pytest.mark.xfail_safari
def test_should_be_able_to_click_element_that_is_out_of_view_in_aframe_that_is_out_of_view(driver, pages):
    pages.load("scrolling_tests/page_with_scrolling_frame_out_of_view.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "scrolling_frame"))
    element = driver.find_element(By.NAME, "scroll_checkbox")
    element.click()
    assert element.is_selected()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_chrome
@pytest.mark.xfail_remote
def test_should_be_able_to_click_element_that_is_out_of_view_in_anested_frame(driver, pages):
    pages.load("scrolling_tests/page_with_nested_scrolling_frames.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "scrolling_frame"))
    driver.switch_to.frame(driver.find_element(By.NAME, "nested_scrolling_frame"))
    element = driver.find_element(By.NAME, "scroll_checkbox")
    element.click()
    assert element.is_selected()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_chrome
@pytest.mark.xfail_remote
def test_should_be_able_to_click_element_that_is_out_of_view_in_anested_frame_that_is_out_of_view(driver, pages):
    pages.load("scrolling_tests/page_with_nested_scrolling_frames_out_of_view.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "scrolling_frame"))
    driver.switch_to.frame(driver.find_element(By.NAME, "nested_scrolling_frame"))
    element = driver.find_element(By.NAME, "scroll_checkbox")
    element.click()
    assert element.is_selected()


def test_should_not_scroll_when_getting_element_size(driver, pages):
    pages.load("scroll3.html")
    scrollTop = get_scroll_top(driver)
    driver.find_element(By.ID, "button1").size
    assert scrollTop == get_scroll_top(driver)


def get_scroll_top(driver):
    return driver.execute_script("return document.body.scrollTop")
