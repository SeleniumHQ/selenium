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
from selenium.common.exceptions import MoveTargetOutOfBoundsException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class TestClickScrolling(object):

    def testClickingOnAnchorScrollsPage(self, driver, pages):
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

    def testShouldScrollToClickOnAnElementHiddenByOverflow(self, driver, pages):
        pages.load("click_out_of_bounds_overflow.html")

        link = driver.find_element(By.ID, "link")
        try:
            link.click()
        except MoveTargetOutOfBoundsException as e:
            AssertionError("Should not be out of bounds: %s" % e.msg)

    def testShouldBeAbleToClickOnAnElementHiddenByOverflow(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c == True:
            pytest.xfail("Marionette and W3C: https://github.com/w3c/webdriver/issues/408")
        pages.load("scroll.html")

        link = driver.find_element(By.ID, "line8")
        # This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
        link.click()
        assert "line8" == driver.find_element(By.ID, "clicked").text

    def testShouldBeAbleToClickOnAnElementHiddenByDoubleOverflow(self, driver, pages):
        if driver.capabilities['browserName'] == 'chrome':
            pytest.xfail("Chrome Issue: https://bugs.chromium.org/p/chromedriver/issues/detail?id=1536")
        pages.load("scrolling_tests/page_with_double_overflow_auto.html")

        driver.find_element(By.ID, "link").click()
        WebDriverWait(driver, 3).until(EC.title_is("Clicked Successfully!"))

    def testShouldBeAbleToClickOnAnElementHiddenByYOverflow(self, driver, pages):
        pages.load("scrolling_tests/page_with_y_overflow_auto.html")

        driver.find_element(By.ID, "link").click()
        WebDriverWait(driver, 3).until(EC.title_is("Clicked Successfully!"))

    def testShouldNotScrollOverflowElementsWhichAreVisible(self, driver, pages):
        pages.load("scroll2.html")
        list = driver.find_element(By.TAG_NAME, "ul")
        item = list.find_element(By.ID, "desired")
        item.click()
        yOffset = driver.execute_script("return arguments[0].scrollTop", list)
        assert 0 == yOffset, "Should not have scrolled"

    def testShouldNotScrollIfAlreadyScrolledAndElementIsInView(self, driver, pages):
        if driver.capabilities['browserName'] == 'chrome':
            pytest.xfail("Chrome Issue: https://bugs.chromium.org/p/chromedriver/issues/detail?id=1542")
        pages.load("scroll3.html")
        driver.find_element(By.ID, "button1").click()
        scrollTop = self.getScrollTop(driver)
        driver.find_element(By.ID, "button2").click()
        assert scrollTop == self.getScrollTop(driver)

    def testShouldBeAbleToClickRadioButtonScrolledIntoView(self, driver, pages):
        pages.load("scroll4.html")
        driver.find_element(By.ID, "radio").click()
        # If we don't throw, we're good

    def testShouldScrollOverflowElementsIfClickPointIsOutOfViewButElementIsInView(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Scrolling to containing frames isnt spec'ed https://github.com/w3c/webdriver/issues/408")
        pages.load("scroll5.html")
        driver.find_element(By.ID, "inner").click()
        assert "clicked" == driver.find_element(By.ID, "clicked").text

    def testShouldBeAbleToClickElementInAFrameThatIsOutOfView(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Scrolling to containing frames isnt spec'ed https://github.com/w3c/webdriver/issues/408")
        pages.load("scrolling_tests/page_with_frame_out_of_view.html")
        driver.switch_to.frame(driver.find_element_by_name("frame"))
        element = driver.find_element(By.NAME, "checkbox")
        element.click()
        assert element.is_selected()

    def testShouldBeAbleToClickElementThatIsOutOfViewInAFrame(self, driver, pages):
        pages.load("scrolling_tests/page_with_scrolling_frame.html")
        driver.switch_to.frame(driver.find_element_by_name("scrolling_frame"))
        element = driver.find_element(By.NAME, "scroll_checkbox")
        element.click()
        assert element.is_selected()

    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_firefox
    @pytest.mark.ignore_phantomjs
    def testShouldNotBeAbleToClickElementThatIsOutOfViewInANonScrollableFrame(self, driver, pages):
        pages.load("scrolling_tests/page_with_non_scrolling_frame.html")
        driver.switch_to.frame("scrolling_frame")
        element = driver.find_element(By.NAME, "scroll_checkbox")
        element.click()

    def testShouldBeAbleToClickElementThatIsOutOfViewInAFrameThatIsOutOfView(self, driver, pages):
        pages.load("scrolling_tests/page_with_scrolling_frame_out_of_view.html")
        driver.switch_to.frame(driver.find_element_by_name("scrolling_frame"))
        element = driver.find_element(By.NAME, "scroll_checkbox")
        element.click()
        assert element.is_selected()

    def testShouldBeAbleToClickElementThatIsOutOfViewInANestedFrame(self, driver, pages):
        pages.load("scrolling_tests/page_with_nested_scrolling_frames.html")
        driver.switch_to.frame(driver.find_element_by_name("scrolling_frame"))
        driver.switch_to.frame(driver.find_element_by_name("nested_scrolling_frame"))
        element = driver.find_element(By.NAME, "scroll_checkbox")
        element.click()
        assert element.is_selected()

    def testShouldBeAbleToClickElementThatIsOutOfViewInANestedFrameThatIsOutOfView(self, driver, pages):
        pages.load("scrolling_tests/page_with_nested_scrolling_frames_out_of_view.html")
        driver.switch_to.frame(driver.find_element_by_name("scrolling_frame"))
        driver.switch_to.frame(driver.find_element_by_name("nested_scrolling_frame"))
        element = driver.find_element(By.NAME, "scroll_checkbox")
        element.click()
        assert element.is_selected()

    def testShouldNotScrollWhenGettingElementSize(self, driver, pages):
        pages.load("scroll3.html")
        scrollTop = self.getScrollTop(driver)
        driver.find_element(By.ID, "button1").size
        assert scrollTop == self.getScrollTop(driver)

    def getScrollTop(self, driver):
        return driver.execute_script("return document.body.scrollTop")

    def testShouldBeAbleToClickElementInATallFrame(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox':
            pytest.skip("Scrolling to containing frames isnt spec'ed https://github.com/w3c/webdriver/issues/408")
        pages.load("scrolling_tests/page_with_tall_frame.html")
        driver.switch_to.frame(driver.find_element_by_name("tall_frame"))
        element = driver.find_element(By.NAME, "checkbox")
        element.click()
        assert element.is_selected()
