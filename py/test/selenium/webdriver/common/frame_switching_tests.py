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

from selenium.common.exceptions import (
    NoSuchElementException,
    NoSuchFrameException,
    WebDriverException)
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# ----------------------------------------------------------------------------------------------
#
# Tests that WebDriver doesn't do anything fishy when it navigates to a page with frames.
#
# ----------------------------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def restore_default_context(driver):
    yield
    driver.switch_to.default_content()


def test_should_always_focus_on_the_top_most_frame_after_anavigation_event(driver, pages):
    pages.load("frameset.html")
    driver.find_element(By.TAG_NAME, "frameset")  # Test passes if this does not throw.


def test_should_not_automatically_switch_focus_to_an_iframe_when_apage_containing_them_is_loaded(driver, pages):
    pages.load("iframes.html")
    driver.find_element(By.ID, "iframe_page_heading")


def test_should_open_page_with_broken_frameset(driver, pages):
    pages.load("framesetPage3.html")

    frame1 = driver.find_element(By.ID, "first")
    driver.switch_to.frame(frame1)
    driver.switch_to.default_content()

    frame2 = driver.find_element(By.ID, "second")
    driver.switch_to.frame(frame2)  # IE9 can not switch to this broken frame - it has no window.

# ----------------------------------------------------------------------------------------------
#
# Tests that WebDriver can switch to frames as expected.
#
# ----------------------------------------------------------------------------------------------


def test_should_be_able_to_switch_to_aframe_by_its_index(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(1)
    assert driver.find_element(By.ID, "pageNumber").text == "2"


def test_should_be_able_to_switch_to_an_iframe_by_its_index(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(0)
    assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"


def test_should_be_able_to_switch_to_aframe_by_its_name(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("fourth")
    assert driver.find_element(By.TAG_NAME, "frame").get_attribute("name") == "child1"


def test_should_be_able_to_switch_to_an_iframe_by_its_name(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame("iframe1-name")
    assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"


def test_should_be_able_to_switch_to_aframe_by_its_id(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("fifth")
    assert driver.find_element(By.NAME, "windowOne").text == "Open new window"


def test_should_be_able_to_switch_to_an_iframe_by_its_id(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame("iframe1")
    assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"


def test_should_be_able_to_switch_to_frame_with_name_containing_dot(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("sixth.iframe1")
    assert "Page number 3" in driver.find_element(By.TAG_NAME, "body").text


def test_should_be_able_to_switch_to_aframe_using_apreviously_located_web_element(driver, pages):
    pages.load("frameset.html")
    frame = driver.find_element(By.TAG_NAME, "frame")
    driver.switch_to.frame(frame)
    assert driver.find_element(By.ID, "pageNumber").text == "1"


def test_should_be_able_to_switch_to_an_iframe_using_apreviously_located_web_element(driver, pages):
    pages.load("iframes.html")
    frame = driver.find_element(By.TAG_NAME, "iframe")
    driver.switch_to.frame(frame)

    element = driver.find_element(By.NAME, "id-name1")
    assert element.get_attribute("value") == "name"


def test_should_ensure_element_is_aframe_before_switching(driver, pages):
    pages.load("frameset.html")
    frame = driver.find_element(By.TAG_NAME, "frameset")
    with pytest.raises(NoSuchFrameException):
        driver.switch_to.frame(frame)


def test_frame_searches_should_be_relative_to_the_currently_selected_frame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("second")
    assert driver.find_element(By.ID, "pageNumber").text == "2"

    with pytest.raises(NoSuchElementException):
        driver.switch_to.frame(driver.find_element(By.NAME, "third"))

    driver.switch_to.default_content()
    driver.switch_to.frame(driver.find_element(By.NAME, "third"))

    with pytest.raises(NoSuchFrameException):
        driver.switch_to.frame("second")

    driver.switch_to.default_content()
    driver.switch_to.frame(driver.find_element(By.NAME, "second"))
    assert driver.find_element(By.ID, "pageNumber").text == "2"


def test_should_select_child_frames_by_chained_calls(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "fourth"))
    driver.switch_to.frame(driver.find_element(By.NAME, "child2"))
    assert driver.find_element(By.ID, "pageNumber").text == "11"


def test_should_throw_frame_not_found_exception_looking_up_sub_frames_with_super_frame_names(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "fourth"))
    with pytest.raises(NoSuchElementException):
        driver.switch_to.frame(driver.find_element(By.NAME, "second"))


def test_should_throw_an_exception_when_aframe_cannot_be_found(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.switch_to.frame(driver.find_element(By.NAME, "Nothing here"))


def test_should_throw_an_exception_when_aframe_cannot_be_found_by_index(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchFrameException):
        driver.switch_to.frame(27)


def test_should_be_able_to_switch_to_parent_frame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "fourth"))
    driver.switch_to.parent_frame()
    driver.switch_to.frame(driver.find_element(By.NAME, "first"))
    assert driver.find_element(By.ID, "pageNumber").text == "1"


@pytest.mark.xfail_safari
def test_should_be_able_to_switch_to_parent_frame_from_asecond_level_frame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "fourth"))
    driver.switch_to.frame(driver.find_element(By.NAME, "child1"))
    driver.switch_to.parent_frame()
    driver.switch_to.frame(driver.find_element(By.NAME, "child2"))
    assert driver.find_element(By.ID, "pageNumber").text == "11"


def test_switching_to_parent_frame_from_default_context_is_no_op(driver, pages):
    pages.load("xhtmlTest.html")
    driver.switch_to.parent_frame()
    assert driver.title == "XHTML Test Page"


def test_should_be_able_to_switch_to_parent_from_an_iframe(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(0)
    driver.switch_to.parent_frame()
    driver.find_element(By.ID, "iframe_page_heading")

# ----------------------------------------------------------------------------------------------
#
# General frame handling behavior tests
#
# ----------------------------------------------------------------------------------------------


def test_should_continue_to_refer_to_the_same_frame_once_it_has_been_selected(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(2)
    checkbox = driver.find_element(By.XPATH, "//input[@name='checky']")
    checkbox.click()
    checkbox.submit()

    # TODO(simon): this should not be needed, and is only here because IE's submit returns too
    # soon.

    WebDriverWait(driver, 3).until(EC.text_to_be_present_in_element((By.XPATH, '//p'), 'Success!'))


@pytest.mark.xfail_firefox(raises=WebDriverException,
                           reason='https://github.com/mozilla/geckodriver/issues/610')
@pytest.mark.xfail_remote(raises=WebDriverException,
                          reason='https://github.com/mozilla/geckodriver/issues/610')
@pytest.mark.xfail_safari
def test_should_focus_on_the_replacement_when_aframe_follows_alink_to_a_top_targeted_page(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(0)
    driver.find_element(By.LINK_TEXT, "top").click()

    expectedTitle = "XHTML Test Page"

    WebDriverWait(driver, 3).until(EC.title_is(expectedTitle))
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "only-exists-on-xhtmltest")))


def test_should_allow_auser_to_switch_from_an_iframe_back_to_the_main_content_of_the_page(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(0)
    driver.switch_to.default_content()
    driver.find_element(By.ID, "iframe_page_heading")


def test_should_allow_the_user_to_switch_to_an_iframe_and_remain_focused_on_it(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(0)
    driver.find_element(By.ID, "submitButton").click()
    assert get_text_of_greeting_element(driver) == "Success!"


def get_text_of_greeting_element(driver):
    return WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "greeting"))).text


def test_should_be_able_to_click_in_aframe(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("third")

    # This should replace frame "third" ...
    driver.find_element(By.ID, "submitButton").click()
    # driver should still be focused on frame "third" ...
    assert get_text_of_greeting_element(driver) == "Success!"
    # Make sure it was really frame "third" which was replaced ...
    driver.switch_to.default_content()
    driver.switch_to.frame("third")
    assert get_text_of_greeting_element(driver) == "Success!"


def test_should_be_able_to_click_in_aframe_that_rewrites_top_window_location(driver, pages):
    pages.load("click_tests/issue5237.html")
    driver.switch_to.frame(driver.find_element(By.ID, "search"))
    driver.find_element(By.ID, "submit").click()
    driver.switch_to.default_content()
    WebDriverWait(driver, 3).until(EC.title_is("Target page for issue 5237"))


def test_should_be_able_to_click_in_asub_frame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element(By.ID, "sixth"))
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))

    # This should replace frame "iframe1" inside frame "sixth" ...
    driver.find_element(By.ID, "submitButton").click()
    # driver should still be focused on frame "iframe1" inside frame "sixth" ...
    assert get_text_of_greeting_element(driver), "Success!"
    # Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
    driver.switch_to.default_content()
    driver.switch_to.frame(driver.find_element(By.ID, "sixth"))
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))
    assert driver.find_element(By.ID, "greeting").text == "Success!"


def test_should_be_able_to_find_elements_in_iframes_by_xpath(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))
    element = driver.find_element(By.XPATH, "//*[@id = 'changeme']")
    assert element is not None


def test_get_current_url_returns_top_level_browsing_context_url(driver, pages):
    pages.load("frameset.html")
    assert "frameset.html" in driver.current_url
    driver.switch_to.frame(driver.find_element(By.NAME, "second"))
    assert "frameset.html" in driver.current_url


def test_get_current_url_returns_top_level_browsing_context_url_for_iframes(driver, pages):
    pages.load("iframes.html")
    assert "iframes.html" in driver.current_url
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))
    assert "iframes.html" in driver.current_url


def test_should_be_able_to_switch_to_the_top_if_the_frame_is_deleted_from_under_us(driver, pages):
    pages.load("frame_switching_tests/deletingFrame.html")
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))

    killIframe = driver.find_element(By.ID, "killIframe")
    killIframe.click()
    driver.switch_to.default_content()
    WebDriverWait(driver, 3).until_not(
        EC.presence_of_element_located((By.ID, "iframe1")))

    addIFrame = driver.find_element(By.ID, "addBackFrame")
    addIFrame.click()
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "iframe1")))
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "success")))


def test_should_be_able_to_switch_to_the_top_if_the_frame_is_deleted_from_under_us_with_frame_index(driver, pages):
    pages.load("frame_switching_tests/deletingFrame.html")
    iframe = 0
    WebDriverWait(driver, 3).until(EC.frame_to_be_available_and_switch_to_it(iframe))
    # we should be in the frame now
    killIframe = driver.find_element(By.ID, "killIframe")
    killIframe.click()
    driver.switch_to.default_content()

    addIFrame = driver.find_element(By.ID, "addBackFrame")
    addIFrame.click()
    WebDriverWait(driver, 3).until(EC.frame_to_be_available_and_switch_to_it(iframe))
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "success")))


def test_should_be_able_to_switch_to_the_top_if_the_frame_is_deleted_from_under_us_with_webelement(driver, pages):
    pages.load("frame_switching_tests/deletingFrame.html")
    iframe = driver.find_element(By.ID, "iframe1")
    WebDriverWait(driver, 3).until(EC.frame_to_be_available_and_switch_to_it(iframe))
    # we should be in the frame now
    killIframe = driver.find_element(By.ID, "killIframe")
    killIframe.click()
    driver.switch_to.default_content()

    addIFrame = driver.find_element(By.ID, "addBackFrame")
    addIFrame.click()

    iframe = driver.find_element(By.ID, "iframe1")
    WebDriverWait(driver, 3).until(EC.frame_to_be_available_and_switch_to_it(iframe))
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "success")))


# @pytest.mark.xfail_chrome(raises=NoSuchElementException)
# @pytest.mark.xfail_chromiumedge(raises=NoSuchElementException)
# @pytest.mark.xfail_firefox(raises=WebDriverException,
#                            reason='https://github.com/mozilla/geckodriver/issues/614')
# @pytest.mark.xfail_remote(raises=WebDriverException,
#                           reason='https://github.com/mozilla/geckodriver/issues/614')
# @pytest.mark.xfail_webkitgtk(raises=NoSuchElementException)
# @pytest.mark.xfail_safari
# def test_should_not_be_able_to_do_anything_the_frame_is_deleted_from_under_us(driver, pages):
#     pages.load("frame_switching_tests/deletingFrame.html")
#     driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))

#     killIframe = driver.find_element(By.ID, "killIframe")
#     killIframe.click()

#     with pytest.raises(NoSuchFrameException):
#         driver.find_element(By.ID, "killIframe").click()


def test_should_return_window_title_in_aframeset(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "third"))
    assert "Unique title" == driver.title


def test_java_script_should_execute_in_the_context_of_the_current_frame(driver, pages):
    pages.load("frameset.html")
    assert driver.execute_script("return window == window.top")
    driver.switch_to.frame(driver.find_element(By.NAME, "third"))
    assert driver.execute_script("return window != window.top")


@pytest.mark.xfail_chrome(reason="Fails on Travis")
@pytest.mark.xfail_safari
def test_should_not_switch_magically_to_the_top_window(driver, pages):
    pages.load("frame_switching_tests/bug4876.html")
    driver.switch_to.frame(0)
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "inputText")))

    for i in range(20):
        try:
            input = WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "inputText")))
            submit = WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "submitButton")))
            input.clear()
            import random
            input.send_keys("rand%s" % int(random.random()))
            submit.click()
        finally:
            url = driver.execute_script("return window.location.href")
        # IE6 and Chrome add "?"-symbol to the end of the URL
    if url.endswith("?"):
        url = url[:len(url) - 1]

    assert pages.url("frame_switching_tests/bug4876_iframe.html") == url


def test_get_should_switch_to_default_context(driver, pages):
    pages.load("iframes.html")
    driver.find_element(By.ID, "iframe1")
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))
    driver.find_element(By.ID, "cheese")  # Found on formPage.html but not on iframes.html.
    pages.load("iframes.html")  # This must effectively switch_to.default_content(), too.
    driver.find_element(By.ID, "iframe1")
