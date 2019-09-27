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


def testShouldAlwaysFocusOnTheTopMostFrameAfterANavigationEvent(driver, pages):
    pages.load("frameset.html")
    driver.find_element(By.TAG_NAME, "frameset")  # Test passes if this does not throw.


def testShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded(driver, pages):
    pages.load("iframes.html")
    driver.find_element(By.ID, "iframe_page_heading")


def testShouldOpenPageWithBrokenFrameset(driver, pages):
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


def testShouldBeAbleToSwitchToAFrameByItsIndex(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(1)
    assert driver.find_element(By.ID, "pageNumber").text == "2"


def testShouldBeAbleToSwitchToAnIframeByItsIndex(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(0)
    assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"


def testShouldBeAbleToSwitchToAFrameByItsName(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("fourth")
    assert driver.find_element(By.TAG_NAME, "frame").get_attribute("name") == "child1"


def testShouldBeAbleToSwitchToAnIframeByItsName(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame("iframe1-name")
    assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"


def testShouldBeAbleToSwitchToAFrameByItsID(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("fifth")
    assert driver.find_element(By.NAME, "windowOne").text == "Open new window"


def testShouldBeAbleToSwitchToAnIframeByItsID(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame("iframe1")
    assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"


def testShouldBeAbleToSwitchToFrameWithNameContainingDot(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("sixth.iframe1")
    assert "Page number 3" in driver.find_element(By.TAG_NAME, "body").text


def testShouldBeAbleToSwitchToAFrameUsingAPreviouslyLocatedWebElement(driver, pages):
    pages.load("frameset.html")
    frame = driver.find_element(By.TAG_NAME, "frame")
    driver.switch_to.frame(frame)
    assert driver.find_element(By.ID, "pageNumber").text == "1"


def testShouldBeAbleToSwitchToAnIFrameUsingAPreviouslyLocatedWebElement(driver, pages):
    pages.load("iframes.html")
    frame = driver.find_element(By.TAG_NAME, "iframe")
    driver.switch_to.frame(frame)

    element = driver.find_element(By.NAME, "id-name1")
    assert element.get_attribute("value") == "name"


def testShouldEnsureElementIsAFrameBeforeSwitching(driver, pages):
    pages.load("frameset.html")
    frame = driver.find_element(By.TAG_NAME, "frameset")
    with pytest.raises(NoSuchFrameException):
        driver.switch_to.frame(frame)


def testFrameSearchesShouldBeRelativeToTheCurrentlySelectedFrame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("second")
    assert driver.find_element(By.ID, "pageNumber").text == "2"

    with pytest.raises(NoSuchElementException):
        driver.switch_to.frame(driver.find_element_by_name("third"))

    driver.switch_to.default_content()
    driver.switch_to.frame(driver.find_element_by_name("third"))

    with pytest.raises(NoSuchFrameException):
        driver.switch_to.frame("second")

    driver.switch_to.default_content()
    driver.switch_to.frame(driver.find_element_by_name("second"))
    assert driver.find_element(By.ID, "pageNumber").text == "2"


def testShouldSelectChildFramesByChainedCalls(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element_by_name("fourth"))
    driver.switch_to.frame(driver.find_element_by_name("child2"))
    assert driver.find_element(By.ID, "pageNumber").text == "11"


def testShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element_by_name("fourth"))
    with pytest.raises(NoSuchElementException):
        driver.switch_to.frame(driver.find_element_by_name("second"))


def testShouldThrowAnExceptionWhenAFrameCannotBeFound(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.switch_to.frame(driver.find_element_by_name("Nothing here"))


def testShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchFrameException):
        driver.switch_to.frame(27)


def testShouldBeAbleToSwitchToParentFrame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element_by_name("fourth"))
    driver.switch_to.parent_frame()
    driver.switch_to.frame(driver.find_element_by_name("first"))
    assert driver.find_element(By.ID, "pageNumber").text == "1"


def testShouldBeAbleToSwitchToParentFrameFromASecondLevelFrame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element_by_name("fourth"))
    driver.switch_to.frame(driver.find_element_by_name("child1"))
    driver.switch_to.parent_frame()
    driver.switch_to.frame(driver.find_element_by_name("child2"))
    assert driver.find_element(By.ID, "pageNumber").text == "11"


def testSwitchingToParentFrameFromDefaultContextIsNoOp(driver, pages):
    pages.load("xhtmlTest.html")
    driver.switch_to.parent_frame()
    assert driver.title == "XHTML Test Page"


def testShouldBeAbleToSwitchToParentFromAnIframe(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(0)
    driver.switch_to.parent_frame()
    driver.find_element(By.ID, "iframe_page_heading")

# ----------------------------------------------------------------------------------------------
#
# General frame handling behavior tests
#
# ----------------------------------------------------------------------------------------------


def testShouldContinueToReferToTheSameFrameOnceItHasBeenSelected(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(2)
    checkbox = driver.find_element(By.XPATH, "//input[@name='checky']")
    checkbox.click()
    checkbox.submit()

    # TODO(simon): this should not be needed, and is only here because IE's submit returns too
    # soon.

    WebDriverWait(driver, 3).until(EC.text_to_be_present_in_element((By.XPATH, '//p'), 'Success!'))


@pytest.mark.xfail_marionette(raises=WebDriverException,
                              reason='https://github.com/mozilla/geckodriver/issues/610')
@pytest.mark.xfail_remote(raises=WebDriverException,
                          reason='https://github.com/mozilla/geckodriver/issues/610')
def testShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargetedPage(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(0)
    driver.find_element(By.LINK_TEXT, "top").click()

    expectedTitle = "XHTML Test Page"

    WebDriverWait(driver, 3).until(EC.title_is(expectedTitle))
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "only-exists-on-xhtmltest")))


def testShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(0)
    driver.switch_to.default_content()
    driver.find_element(By.ID, "iframe_page_heading")


def testShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(0)
    driver.find_element(By.ID, "submitButton").click()
    assert getTextOfGreetingElement(driver) == "Success!"


def getTextOfGreetingElement(driver):
    return WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "greeting"))).text


def testShouldBeAbleToClickInAFrame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame("third")

    # This should replace frame "third" ...
    driver.find_element(By.ID, "submitButton").click()
    # driver should still be focused on frame "third" ...
    assert getTextOfGreetingElement(driver) == "Success!"
    # Make sure it was really frame "third" which was replaced ...
    driver.switch_to.default_content()
    driver.switch_to.frame("third")
    assert getTextOfGreetingElement(driver) == "Success!"


def testShouldBeAbleToClickInAFrameThatRewritesTopWindowLocation(driver, pages):
    pages.load("click_tests/issue5237.html")
    driver.switch_to.frame(driver.find_element_by_id("search"))
    driver.find_element(By.ID, "submit").click()
    driver.switch_to.default_content()
    WebDriverWait(driver, 3).until(EC.title_is("Target page for issue 5237"))


def testShouldBeAbleToClickInASubFrame(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element_by_id("sixth"))
    driver.switch_to.frame(driver.find_element_by_id("iframe1"))

    # This should replace frame "iframe1" inside frame "sixth" ...
    driver.find_element(By.ID, "submitButton").click()
    # driver should still be focused on frame "iframe1" inside frame "sixth" ...
    assert getTextOfGreetingElement(driver), "Success!"
    # Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
    driver.switch_to.default_content()
    driver.switch_to.frame(driver.find_element_by_id("sixth"))
    driver.switch_to.frame(driver.find_element_by_id("iframe1"))
    assert driver.find_element(By.ID, "greeting").text == "Success!"


def testShouldBeAbleToFindElementsInIframesByXPath(driver, pages):
    pages.load("iframes.html")
    driver.switch_to.frame(driver.find_element_by_id("iframe1"))
    element = driver.find_element(By.XPATH, "//*[@id = 'changeme']")
    assert element is not None


def testGetCurrentUrlReturnsTopLevelBrowsingContextUrl(driver, pages):
    pages.load("frameset.html")
    assert "frameset.html" in driver.current_url
    driver.switch_to.frame(driver.find_element_by_name("second"))
    assert "frameset.html" in driver.current_url


def testGetCurrentUrlReturnsTopLevelBrowsingContextUrlForIframes(driver, pages):
    pages.load("iframes.html")
    assert "iframes.html" in driver.current_url
    driver.switch_to.frame(driver.find_element_by_id("iframe1"))
    assert "iframes.html" in driver.current_url


def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUs(driver, pages):
    pages.load("frame_switching_tests/deletingFrame.html")
    driver.switch_to.frame(driver.find_element_by_id("iframe1"))

    killIframe = driver.find_element(By.ID, "killIframe")
    killIframe.click()
    driver.switch_to.default_content()
    WebDriverWait(driver, 3).until_not(
        EC.presence_of_element_located((By.ID, "iframe1")))

    addIFrame = driver.find_element(By.ID, "addBackFrame")
    addIFrame.click()
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "iframe1")))
    driver.switch_to.frame(driver.find_element_by_id("iframe1"))
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "success")))


def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithFrameIndex(driver, pages):
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


def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithWebelement(driver, pages):
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


@pytest.mark.xfail_chrome(raises=NoSuchElementException)
@pytest.mark.xfail_marionette(raises=WebDriverException,
                              reason='https://github.com/mozilla/geckodriver/issues/614')
@pytest.mark.xfail_remote(raises=WebDriverException,
                          reason='https://github.com/mozilla/geckodriver/issues/614')
@pytest.mark.xfail_webkitgtk(raises=NoSuchElementException)
def testShouldNotBeAbleToDoAnythingTheFrameIsDeletedFromUnderUs(driver, pages):
    pages.load("frame_switching_tests/deletingFrame.html")
    driver.switch_to.frame(driver.find_element_by_id("iframe1"))

    killIframe = driver.find_element(By.ID, "killIframe")
    killIframe.click()

    with pytest.raises(NoSuchFrameException):
        driver.find_element(By.ID, "killIframe").click()


def testShouldReturnWindowTitleInAFrameset(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element_by_name("third"))
    assert "Unique title" == driver.title


def testJavaScriptShouldExecuteInTheContextOfTheCurrentFrame(driver, pages):
    pages.load("frameset.html")
    assert driver.execute_script("return window == window.top")
    driver.switch_to.frame(driver.find_element(By.NAME, "third"))
    assert driver.execute_script("return window != window.top")


def testShouldNotSwitchMagicallyToTheTopWindow(driver, pages):
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
    if (url.endswith("?")):
        url = url[:len(url) - 1]

    assert pages.url("frame_switching_tests/bug4876_iframe.html") == url


def testGetShouldSwitchToDefaultContext(driver, pages):
    pages.load("iframes.html")
    driver.find_element(By.ID, "iframe1")
    driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))
    driver.find_element(By.ID, "cheese")  # Found on formPage.html but not on iframes.html.
    pages.load("iframes.html")  # This must effectively switch_to.default_content(), too.
    driver.find_element(By.ID, "iframe1")
