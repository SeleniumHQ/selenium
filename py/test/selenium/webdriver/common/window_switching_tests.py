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

from selenium.common.exceptions import NoSuchWindowException
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def testShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations(driver, pages):
    pages.load("xhtmlTest.html")
    current = driver.current_window_handle

    driver.find_element_by_link_text("Open new window").click()
    assert driver.title == "XHTML Test Page"
    handles = driver.window_handles
    handles.remove(current)
    driver.switch_to.window(handles[0])
    assert driver.title == "We Arrive Here"

    pages.load("iframes.html")
    handle = driver.current_window_handle
    driver.find_element_by_id("iframe_page_heading")
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))
    assert driver.current_window_handle == handle


def testShouldThrowNoSuchWindowException(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchWindowException):
        driver.switch_to.window("invalid name")


@pytest.mark.xfail_marionette(
    reason='https://bugzilla.mozilla.org/show_bug.cgi?id=1309173')
def testShouldThrowNoSuchWindowExceptionOnAnAttemptToGetItsHandle(driver, pages):
    pages.load("xhtmlTest.html")
    current = driver.current_window_handle
    handles = driver.window_handles
    driver.find_element(By.LINK_TEXT, "Open new window").click()
    WebDriverWait(driver, 3).until(EC.new_window_is_opened(handles))
    handles = driver.window_handles
    handles.remove(current)
    driver.switch_to.window(handles[0])
    driver.close()

    with pytest.raises(NoSuchWindowException):
        driver.current_window_handle


@pytest.mark.xfail_ie
def testShouldThrowNoSuchWindowExceptionOnAnyOperationIfAWindowIsClosed(driver, pages):
    pages.load("xhtmlTest.html")
    current = driver.current_window_handle
    handles = driver.window_handles
    driver.find_element(By.LINK_TEXT, "Open new window").click()
    WebDriverWait(driver, 3).until(EC.new_window_is_opened(handles))
    handles = driver.window_handles
    handles.remove(current)
    driver.switch_to.window(handles[0])
    driver.close()

    with pytest.raises(NoSuchWindowException):
        driver.title

    with pytest.raises(NoSuchWindowException):
        driver.find_element_by_tag_name("body")


@pytest.mark.xfail_ie
def testShouldThrowNoSuchWindowExceptionOnAnyElementOperationIfAWindowIsClosed(driver, pages):
    pages.load("xhtmlTest.html")
    current = driver.current_window_handle
    handles = driver.window_handles
    driver.find_element(By.LINK_TEXT, "Open new window").click()
    WebDriverWait(driver, 3).until(EC.new_window_is_opened(handles))
    handles = driver.window_handles
    handles.remove(current)
    driver.switch_to.window(handles[0])
    element = driver.find_element_by_tag_name("body")
    driver.close()

    with pytest.raises(NoSuchWindowException):
        element.text


@pytest.mark.xfail_marionette(run=False)
def testClickingOnAButtonThatClosesAnOpenWindowDoesNotCauseTheBrowserToHang(driver, pages):
    pages.load("xhtmlTest.html")
    current = driver.current_window_handle
    handles = driver.window_handles
    driver.find_element_by_name("windowThree").click()
    WebDriverWait(driver, 3).until(EC.new_window_is_opened(handles))
    handles = driver.window_handles
    handles.remove(current)
    driver.switch_to.window(handles[0])
    driver.find_element_by_id("close").click()
    driver.switch_to.window(current)
    driver.find_element_by_id("linkId")


@pytest.mark.xfail_marionette(run=False)
def testCanCallGetWindowHandlesAfterClosingAWindow(driver, pages):
    pages.load("xhtmlTest.html")
    current = driver.current_window_handle
    handles = driver.window_handles
    driver.find_element_by_name("windowThree").click()
    WebDriverWait(driver, 3).until(EC.new_window_is_opened(handles))
    handles = driver.window_handles
    handles.remove(current)
    driver.switch_to.window(handles[0])

    driver.find_element_by_id("close").click()
    WebDriverWait(driver, 3).until(EC.number_of_windows_to_be(1))


def testCanObtainAWindowHandle(driver, pages):
    pages.load("xhtmlTest.html")
    currentHandle = driver.current_window_handle
    assert currentHandle is not None


def testFailingToSwitchToAWindowLeavesTheCurrentWindowAsIs(driver, pages):
    pages.load("xhtmlTest.html")
    current = driver.current_window_handle
    with pytest.raises(NoSuchWindowException):
        driver.switch_to.window("I will never exist")
    new_handle = driver.current_window_handle
    assert current == new_handle


@pytest.mark.xfail_marionette(run=False)
@pytest.mark.xfail_chrome(reason="Fails on Travis")
def testThatAccessingFindingAnElementAfterWindowIsClosedAndHaventswitchedDoesntCrash(driver, pages):
    pages.load("xhtmlTest.html")
    current = driver.current_window_handle
    handles = driver.window_handles
    driver.find_element_by_name("windowThree").click()
    WebDriverWait(driver, 3).until(EC.new_window_is_opened(handles))
    handles = driver.window_handles
    handles.remove(current)
    driver.switch_to.window(handles[0])

    with pytest.raises(WebDriverException):
        driver.find_element_by_id("close").click()
        all_handles = driver.window_handles
        assert 1 == len(all_handles)
        driver.find_element_by_id("close")
    driver.switch_to.window(current)
