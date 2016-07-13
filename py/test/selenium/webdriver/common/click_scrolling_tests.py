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

import unittest
import pytest

from selenium.webdriver.common.by import By
from selenium.common.exceptions import MoveTargetOutOfBoundsException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class ClickScrollingTest(unittest.TestCase):

    def tearDown(self):
        self.driver.switch_to.default_content()

    def testClickingOnAnchorScrollsPage(self):
        scrollScript = "var pageY"
        "if (typeof(window.pageYOffset) == 'number') {"
        "  pageY = window.pageYOffset"
        " else {"
        "  pageY = document.documentElement.scrollTop"
        "}"
        "return pageY"

        self._loadPage("macbeth")

        self.driver.find_element(By.PARTIAL_LINK_TEXT, "last speech").click()

        yOffset = self.driver.execute_script(scrollScript)

        # Focusing on to click, but not actually following,
        # the link will scroll it in to view, which is a few pixels further than 0
        self.assertGreater(300, yOffset)

    def testShouldScrollToClickOnAnElementHiddenByOverflow(self):
        url = self.webserver.where_is("click_out_of_bounds_overflow.html")
        self.driver.get(url)

        link = self.driver.find_element(By.ID, "link")
        try:
            link.click()
        except MoveTargetOutOfBoundsException as e:
            self.fail("Should not be out of bounds: %s" % e.msg)

    def testShouldBeAbleToClickOnAnElementHiddenByOverflow(self):
        self.driver.get(self.webserver.where_is("scroll.html"))

        link = self.driver.find_element(By.ID, "line8")
        # This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
        link.click()
        self.assertEquals("line8", self.driver.find_element(By.ID, "clicked").text)

    def testShouldBeAbleToClickOnAnElementHiddenByDoubleOverflow(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_double_overflow_auto.html"))

        self.driver.find_element(By.ID, "link").click()
        WebDriverWait(self.driver, 3).until(EC.title_is("Clicked Successfully!"))

    def testShouldBeAbleToClickOnAnElementHiddenByYOverflow(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_y_overflow_auto.html"))

        self.driver.find_element(By.ID, "link").click()
        WebDriverWait(self.driver, 3).until(EC.title_is("Clicked Successfully!"))

    def testShouldNotScrollOverflowElementsWhichAreVisible(self):
        self.driver.get(self.webserver.where_is("scroll2.html"))
        list = self.driver.find_element(By.TAG_NAME, "ul")
        item = list.find_element(By.ID, "desired")
        item.click()
        yOffset = self.driver.execute_script("return arguments[0].scrollTop", list)
        self.assertEquals(0, yOffset, "Should not have scrolled")

    def testShouldNotScrollIfAlreadyScrolledAndElementIsInView(self):
        self.driver.get(self.webserver.where_is("scroll3.html"))
        self.driver.find_element(By.ID, "button1").click()
        scrollTop = self.getScrollTop()
        self.driver.find_element(By.ID, "button2").click()
        self.assertEquals(scrollTop, self.getScrollTop())

    def testShouldBeAbleToClickRadioButtonScrolledIntoView(self):
        self.driver.get(self.webserver.where_is("scroll4.html"))
        self.driver.find_element(By.ID, "radio").click()
        # If we don't throw, we're good

    def testShouldScrollOverflowElementsIfClickPointIsOutOfViewButElementIsInView(self):
        self.driver.get(self.webserver.where_is("scroll5.html"))
        self.driver.find_element(By.ID, "inner").click()
        self.assertEquals("clicked", self.driver.find_element(By.ID, "clicked").text)

    def testShouldBeAbleToClickElementInAFrameThatIsOutOfView(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_frame_out_of_view.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("frame"))
        element = self.driver.find_element(By.NAME, "checkbox")
        element.click()
        self.assertTrue(element.is_selected())

    def testShouldBeAbleToClickElementThatIsOutOfViewInAFrame(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_scrolling_frame.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("scrolling_frame"))
        element = self.driver.find_element(By.NAME, "scroll_checkbox")
        element.click()
        self.assertTrue(element.is_selected())

    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_firefox
    @pytest.mark.ignore_phantomjs
    def testShouldNotBeAbleToClickElementThatIsOutOfViewInANonScrollableFrame(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_non_scrolling_frame.html"))
        self.driver.switch_to.frame("scrolling_frame")
        element = self.driver.find_element(By.NAME, "scroll_checkbox")
        element.click()

    def testShouldBeAbleToClickElementThatIsOutOfViewInAFrameThatIsOutOfView(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_scrolling_frame_out_of_view.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("scrolling_frame"))
        element = self.driver.find_element(By.NAME, "scroll_checkbox")
        element.click()
        self.assertTrue(element.is_selected())

    def testShouldBeAbleToClickElementThatIsOutOfViewInANestedFrame(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_nested_scrolling_frames.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("scrolling_frame"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("nested_scrolling_frame"))
        element = self.driver.find_element(By.NAME, "scroll_checkbox")
        element.click()
        self.assertTrue(element.is_selected())

    def testShouldBeAbleToClickElementThatIsOutOfViewInANestedFrameThatIsOutOfView(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_nested_scrolling_frames_out_of_view.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("scrolling_frame"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("nested_scrolling_frame"))
        element = self.driver.find_element(By.NAME, "scroll_checkbox")
        element.click()
        self.assertTrue(element.is_selected())

    def testShouldNotScrollWhenGettingElementSize(self):
        self.driver.get(self.webserver.where_is("scroll3.html"))
        scrollTop = self.getScrollTop()
        self.driver.find_element(By.ID, "button1").size
        self.assertEquals(scrollTop, self.getScrollTop())

    def getScrollTop(self):
        return self.driver.execute_script("return document.body.scrollTop")

    def testShouldBeAbleToClickElementInATallFrame(self):
        self.driver.get(self.webserver.where_is("scrolling_tests/page_with_tall_frame.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("tall_frame"))
        element = self.driver.find_element(By.NAME, "checkbox")
        element.click()
        self.assertTrue(element.is_selected())

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')
