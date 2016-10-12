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
from selenium.common.exceptions import NoSuchElementException, NoSuchFrameException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestFrameSwitching(object):

    # ----------------------------------------------------------------------------------------------
    #
    # Tests that WebDriver doesn't do anything fishy when it navigates to a page with frames.
    #
    # ----------------------------------------------------------------------------------------------

    def testShouldAlwaysFocusOnTheTopMostFrameAfterANavigationEvent(self, driver, pages):
        pages.load("frameset.html")
        driver.find_element(By.TAG_NAME, "frameset")  # Test passes if this does not throw.

    def testShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded(self, driver, pages):
        pages.load("iframes.html")
        driver.find_element(By.ID, "iframe_page_heading")

    def testShouldOpenPageWithBrokenFrameset(self, driver, pages):
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

    def testShouldBeAbleToSwitchToAFrameByItsIndex(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(1)
        assert driver.find_element(By.ID, "pageNumber").text == "2"

    def testShouldBeAbleToSwitchToAnIframeByItsIndex(self, driver, pages):
        pages.load("iframes.html")
        driver.switch_to.frame(0)
        assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"

    def testShouldBeAbleToSwitchToAFrameByItsName(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame("fourth")
        assert driver.find_element(By.TAG_NAME, "frame").get_attribute("name") == "child1"

    def testShouldBeAbleToSwitchToAnIframeByItsName(self, driver, pages):
        pages.load("iframes.html")
        driver.switch_to.frame("iframe1-name")
        assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"

    def testShouldBeAbleToSwitchToAFrameByItsID(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame("fifth")
        assert driver.find_element(By.NAME, "windowOne").text == "Open new window"

    def testShouldBeAbleToSwitchToAnIframeByItsID(self, driver, pages):
        pages.load("iframes.html")
        driver.switch_to.frame("iframe1")
        assert driver.find_element(By.NAME, "id-name1").get_attribute("value") == "name"

    def testShouldBeAbleToSwitchToFrameWithNameContainingDot(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame("sixth.iframe1")
        assert "Page number 3" in driver.find_element(By.TAG_NAME, "body").text

    def testShouldBeAbleToSwitchToAFrameUsingAPreviouslyLocatedWebElement(self, driver, pages):
        pages.load("frameset.html")
        frame = driver.find_element(By.TAG_NAME, "frame")
        driver.switch_to.frame(frame)
        assert driver.find_element(By.ID, "pageNumber").text == "1"

    def testShouldBeAbleToSwitchToAnIFrameUsingAPreviouslyLocatedWebElement(self, driver, pages):
        pages.load("iframes.html")
        frame = driver.find_element(By.TAG_NAME, "iframe")
        driver.switch_to.frame(frame)

        element = driver.find_element(By.NAME, "id-name1")
        assert element.get_attribute("value") == "name"

    def testShouldEnsureElementIsAFrameBeforeSwitching(self, driver, pages):
        pages.load("frameset.html")
        frame = driver.find_element(By.TAG_NAME, "frameset")
        with pytest.raises(NoSuchFrameException):
            driver.switch_to.frame(frame)

    def testFrameSearchesShouldBeRelativeToTheCurrentlySelectedFrame(self, driver, pages):
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

    def testShouldSelectChildFramesByChainedCalls(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(driver.find_element_by_name("fourth"))
        driver.switch_to.frame(driver.find_element_by_name("child2"))
        assert driver.find_element(By.ID, "pageNumber").text == "11"

    @pytest.mark.ignore_phantomjs
    def testShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(driver.find_element_by_name("fourth"))
        with pytest.raises(NoSuchElementException):
            driver.switch_to.frame(driver.find_element_by_name("second"))

    def testShouldThrowAnExceptionWhenAFrameCannotBeFound(self, driver, pages):
        pages.load("xhtmlTest.html")
        with pytest.raises(NoSuchElementException):
            driver.switch_to.frame(driver.find_element_by_name("Nothing here"))

    def testShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex(self, driver, pages):
        pages.load("xhtmlTest.html")
        with pytest.raises(NoSuchFrameException):
            driver.switch_to.frame(27)

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToParentFrame(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(driver.find_element_by_name("fourth"))
        driver.switch_to.parent_frame()
        driver.switch_to.frame(driver.find_element_by_name("first"))
        assert driver.find_element(By.ID, "pageNumber").text == "1"

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToParentFrameFromASecondLevelFrame(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(driver.find_element_by_name("fourth"))
        driver.switch_to.frame(driver.find_element_by_name("child1"))
        driver.switch_to.parent_frame()
        driver.switch_to.frame(driver.find_element_by_name("child2"))
        assert driver.find_element(By.ID, "pageNumber").text == "11"

    @pytest.mark.ignore_phantomjs
    def testSwitchingToParentFrameFromDefaultContextIsNoOp(self, driver, pages):
        pages.load("xhtmlTest.html")
        driver.switch_to.parent_frame()
        assert driver.title == "XHTML Test Page"

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToParentFromAnIframe(self, driver, pages):
        pages.load("iframes.html")
        driver.switch_to.frame(0)
        driver.switch_to.parent_frame()
        driver.find_element(By.ID, "iframe_page_heading")

    # ----------------------------------------------------------------------------------------------
    #
    # General frame handling behavior tests
    #
    # ----------------------------------------------------------------------------------------------

    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    @pytest.mark.ignore_marionette
    def testShouldContinueToReferToTheSameFrameOnceItHasBeenSelected(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(2)
        checkbox = driver.find_element(By.XPATH, "//input[@name='checky']")
        checkbox.click()
        checkbox.submit()

        # TODO(simon): this should not be needed, and is only here because IE's submit returns too
        # soon.

        WebDriverWait(driver, 3).until(EC.text_to_be_present_in_element((By.XPATH, '//p'), 'Success!'))

    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    def testShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargetedPage(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(0)
        driver.find_element(By.LINK_TEXT, "top").click()

        expectedTitle = "XHTML Test Page"

        WebDriverWait(driver, 3).until(EC.title_is(expectedTitle))
        WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "only-exists-on-xhtmltest")))

    def testShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage(self, driver, pages):
        pages.load("iframes.html")
        driver.switch_to.frame(0)
        driver.switch_to.default_content()
        driver.find_element(By.ID, "iframe_page_heading")

    def testShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt(self, driver, pages):
        pages.load("iframes.html")
        driver.switch_to.frame(0)
        driver.find_element(By.ID, "submitButton").click()
        assert self.getTextOfGreetingElement(driver) == "Success!"

    def getTextOfGreetingElement(self, driver):
        return WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "greeting"))).text

    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_chrome
    def testShouldBeAbleToClickInAFrame(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame("third")

        # This should replace frame "third" ...
        driver.find_element(By.ID, "submitButton").click()
        # driver should still be focused on frame "third" ...
        assert self.getTextOfGreetingElement(driver) == "Success!"
        # Make sure it was really frame "third" which was replaced ...
        WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "third")))
        driver.switch_to.default_content()
        driver.switch_to.frame("third")
        assert self.getTextOfGreetingElement() == "Success!"

    def testShouldBeAbleToClickInAFrameThatRewritesTopWindowLocation(self, driver, pages):
        pages.load("click_tests/issue5237.html")
        driver.switch_to.frame(driver.find_element_by_id("search"))
        driver.find_element(By.ID, "submit").click()
        driver.switch_to.default_content()
        WebDriverWait(driver, 3).until(EC.title_is("Target page for issue 5237"))

    def testShouldBeAbleToClickInASubFrame(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(driver.find_element_by_id("sixth"))
        driver.switch_to.frame(driver.find_element_by_id("iframe1"))

        # This should replace frame "iframe1" inside frame "sixth" ...
        driver.find_element(By.ID, "submitButton").click()
        # driver should still be focused on frame "iframe1" inside frame "sixth" ...
        assert self.getTextOfGreetingElement(driver), "Success!"
        # Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
        driver.switch_to.default_content()
        driver.switch_to.frame(driver.find_element_by_id("sixth"))
        driver.switch_to.frame(driver.find_element_by_id("iframe1"))
        assert driver.find_element(By.ID, "greeting").text == "Success!"

    def testShouldBeAbleToFindElementsInIframesByXPath(self, driver, pages):
        pages.load("iframes.html")
        driver.switch_to.frame(driver.find_element_by_id("iframe1"))
        element = driver.find_element(By.XPATH, "//*[@id = 'changeme']")
        assert element is not None

    @pytest.mark.ignore_phantomjs
    def testGetCurrentUrlReturnsTopLevelBrowsingContextUrl(self, driver, pages):
        pages.load("frameset.html")
        assert "frameset.html" in driver.current_url
        driver.switch_to.frame(driver.find_element_by_name("second"))
        assert "frameset.html" in driver.current_url

    @pytest.mark.ignore_phantomjs
    def testGetCurrentUrlReturnsTopLevelBrowsingContextUrlForIframes(self, driver, pages):
        pages.load("iframes.html")
        assert "iframes.html" in driver.current_url
        driver.switch_to.frame(driver.find_element_by_id("iframe1"))
        assert "iframes.html" in driver.current_url

    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    @pytest.mark.ignore_chrome
    def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUs(self, driver, pages):
        pages.load("frame_switching_tests/deletingFrame.html")
        driver.switch_to.frame(driver.find_element_by_id("iframe1"))

        killIframe = driver.find_element(By.ID, "killIframe")
        killIframe.click()
        driver.switch_to.default_content()
        WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "iframe1")))

        addIFrame = driver.find_element(By.ID, "addBackFrame")
        addIFrame.click()
        WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "iframe1")))
        driver.switch_to.frame(driver.find_element_by_id("iframe1"))
        WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "success")))

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithFrameIndex(self, driver, pages):
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

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithWebelement(self, driver, pages):
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

    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    def testShouldNotBeAbleToDoAnythingTheFrameIsDeletedFromUnderUs(self, driver, pages):
        pages.load("frame_switching_tests/deletingFrame.html")
        driver.switch_to.frame(driver.find_element_by_id("iframe1"))

        killIframe = driver.find_element(By.ID, "killIframe")
        killIframe.click()

        with pytest.raises(NoSuchElementException):
            driver.find_element(By.ID, "killIframe").click()

    def testShouldReturnWindowTitleInAFrameset(self, driver, pages):
        pages.load("frameset.html")
        driver.switch_to.frame(driver.find_element_by_name("third"))
        assert "Unique title" == driver.title

    def testJavaScriptShouldExecuteInTheContextOfTheCurrentFrame(self, driver, pages):
        pages.load("frameset.html")
        assert driver.execute_script("return window == window.top")
        driver.switch_to.frame(driver.find_element(By.NAME, "third"))
        assert driver.execute_script("return window != window.top")

    @pytest.mark.ignore_phantomjs
    def testShouldNotSwitchMagicallyToTheTopWindow(self, driver, pages):
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

    def testGetShouldSwitchToDefaultContext(self, driver, pages):
        pages.load("iframes.html")
        driver.find_element(By.ID, "iframe1")
        driver.switch_to.frame(driver.find_element(By.ID, "iframe1"))
        driver.find_element(By.ID, "cheese")  # Found on formPage.html but not on iframes.html.
        pages.load("iframes.html")  # This must effectively switch_to.default_content(), too.
        driver.find_element(By.ID, "iframe1")
