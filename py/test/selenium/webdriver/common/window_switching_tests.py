#!/usr/bin/python

# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License")
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import unittest
import pytest
from selenium.common.exceptions import NoSuchWindowException
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By


class WindowSwitchingTests(unittest.TestCase):

    def testShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations(self):
        self._loadPage("xhtmlTest")
        current = self.driver.current_window_handle

        self.driver.find_element_by_link_text("Open new window").click()
        self.assertEqual(self.driver.title, "XHTML Test Page")

        self.driver.switch_to_window("result")
        self.assertEqual(self.driver.title, "We Arrive Here")

        self._loadPage("iframes")
        handle = self.driver.current_window_handle
        self.driver.find_element_by_id("iframe_page_heading")
        self.driver.switch_to_frame("iframe1")

        self.assertEqual(self.driver.current_window_handle, handle)

        self.driver.close()
        self.driver.switch_to_window(current)

    def testShouldThrowNoSuchWindowException(self):
        self._loadPage("xhtmlTest")
        current = self.driver.current_window_handle
        try:
            self.driver.switch_to_window("invalid name")
            self.fail("NoSuchWindowException expected")
        except NoSuchWindowException:
            pass # Expected

        self.driver.switch_to_window(current)

    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_opera
    def testShouldThrowNoSuchWindowExceptionOnAnAttemptToGetItsHandle(self):
        self._loadPage("xhtmlTest")
        current = self.driver.current_window_handle
        self.driver.find_element(By.LINK_TEXT,"Open new window").click()

        self.driver.switch_to_window("result")
        self.driver.close()

        try :
            self.driver.current_window_handle
            self.fail("NoSuchWindowException expected")
        except NoSuchWindowException: 
            pass # Expected.
        finally:
            self.driver.switch_to_window(current)

    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_opera
    @pytest.mark.ignore_ie
    def testShouldThrowNoSuchWindowExceptionOnAnyOperationIfAWindowIsClosed(self):
        self._loadPage("xhtmlTest")
        current = self.driver.current_window_handle
        
        self.driver.find_element(By.LINK_TEXT,"Open new window").click()

        self.driver.switch_to_window("result")
        self.driver.close()
        try:
            try :
                self.driver.title
                self.fail("NoSuchWindowException expected")
            except NoSuchWindowException: 
                pass # Expected.
            
            try :
                self.driver.find_element_by_tag_name("body")
                self.fail("NoSuchWindowException expected")
            except NoSuchWindowException: 
                pass # Expected.
        finally:
            self.driver.switch_to_window(current)
    
    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_opera
    @pytest.mark.ignore_ie
    def testShouldThrowNoSuchWindowExceptionOnAnyElementOperationIfAWindowIsClosed(self):
        self._loadPage("xhtmlTest")
        current = self.driver.current_window_handle
        self.driver.find_element(By.LINK_TEXT,"Open new window").click()

        self.driver.switch_to_window("result")
        element = self.driver.find_element_by_tag_name("body")
        self.driver.close()

        try :
            element.text
            self.fail("NoSuchWindowException expected")
        except NoSuchWindowException: 
            pass # Expected.
        finally:
            self.driver.switch_to_window(current)

    def testClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang(self):
        self._loadPage("xhtmlTest")

        currentHandle = self.driver.current_window_handle

        self.driver.find_element_by_name("windowThree").click()

        self.driver.switch_to_window("result")

        try:
            self.driver.find_element_by_id("close").click()
        finally:
            self.driver.switch_to_window(currentHandle)
            self.driver.find_element_by_id("linkId")

    def testCanCallGetWindowHandlesAfterClosingAWindow(self):
        self._loadPage("xhtmlTest")

        currentHandle = self.driver.current_window_handle

        self.driver.find_element_by_name("windowThree").click()

        self.driver.switch_to_window("result")

        try:
            self.driver.find_element_by_id("close").click()
            all_handles = self.driver.window_handles

            self.assertEqual(1, len(all_handles))
        finally:
            self.driver.switch_to_window(currentHandle)

    def testCanObtainAWindowHandle(self):
        self._loadPage("xhtmlTest")
        currentHandle = self.driver.current_window_handle

        self.assertTrue(currentHandle is not None)

    def testFailingToSwitchToAWindowLeavesTheCurrentWindowAsIs(self):
        self._loadPage("xhtmlTest")
        current = self.driver.current_window_handle
        try:
            self.driver.switch_to_window("I will never exist")
            self.fail("expected exception")
        except NoSuchWindowException:
            pass

        new_handle = self.driver.current_window_handle

        self.assertEqual(current, new_handle)

    def testThatAccessingFindingAnElementAfterWindowIsClosedAndHaventswitchedDoesntCrash(self):
        self._loadPage("xhtmlTest")

        currentHandle = self.driver.current_window_handle

        self.driver.find_element_by_name("windowThree").click()

        self.driver.switch_to_window("result")

        try:
            self.driver.find_element_by_id("close").click()
            all_handles = self.driver.window_handles
            self.assertEqual(1, len(all_handles))
            self.driver.find_element_by_id("close")
            self.fail("Should complain that driver not available but MUST NOT HANG!")
        except WebDriverException:
            pass #this is expected
        finally:
            self.driver.switch_to_window(currentHandle)

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
