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
from selenium.common.exceptions import WebDriverException, NoSuchElementException, NoSuchFrameException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def not_available_on_remote(func):
    def testMethod(self):
        print(self.driver)
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod


class FrameSwitchingTest(unittest.TestCase):

    def tearDown(self):
        try:
            self.driver.switch_to.default_content()
        except Exception:
            # May happen if the driver went away.
            pass

    # ----------------------------------------------------------------------------------------------
    #
    # Tests that WebDriver doesn't do anything fishy when it navigates to a page with frames.
    #
    # ----------------------------------------------------------------------------------------------

    def testShouldAlwaysFocusOnTheTopMostFrameAfterANavigationEvent(self):
        self._load_page("frameset")
        self.driver.find_element(By.TAG_NAME, "frameset")  # Test passes if this does not throw.

    def testShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded(self):
        self._load_page("iframes")
        self.driver.find_element(By.ID, "iframe_page_heading")

    def testShouldOpenPageWithBrokenFrameset(self):
        self.driver.get(self.webserver.where_is("framesetPage3.html"))

        frame1 = self.driver.find_element(By.ID, "first")
        self.driver.switch_to.frame(frame1)
        self.driver.switch_to.default_content()

        frame2 = self.driver.find_element(By.ID, "second")

        try:
            self.driver.switch_to.frame(frame2)
        except WebDriverException:
            # IE9 can not switch to this broken frame - it has no window.
            pass

    # ----------------------------------------------------------------------------------------------
    #
    # Tests that WebDriver can switch to frames as expected.
    #
    # ----------------------------------------------------------------------------------------------

    def testShouldBeAbleToSwitchToAFrameByItsIndex(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(1)

        self.assertEqual(self.driver.find_element(By.ID, "pageNumber").text, "2")

    def testShouldBeAbleToSwitchToAnIframeByItsIndex(self):
        self._load_page("iframes")
        self.driver.switch_to.frame(0)

        self.assertEqual(self.driver.find_element(By.NAME, "id-name1").get_attribute("value"), "name")

    def testShouldBeAbleToSwitchToAFrameByItsName(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_name("fourth"))

        self.assertEqual(self.driver.find_element(By.TAG_NAME, "frame").get_attribute("name"), "child1")

    def testShouldBeAbleToSwitchToAnIframeByItsName(self):
        self._load_page("iframes")
        self.driver.switch_to.frame(self.driver.find_element_by_name("iframe1-name"))

        self.assertEqual(self.driver.find_element(By.NAME, "id-name1").get_attribute("value"), "name")

    def testShouldBeAbleToSwitchToAFrameByItsID(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element(By.ID, "fifth"))
        self.assertEqual(self.driver.find_element(By.NAME, "windowOne").text, "Open new window")

    def testShouldBeAbleToSwitchToAnIframeByItsID(self):
        self._load_page("iframes")
        self.driver.switch_to.frame(self.driver.find_element_by_id("iframe1"))

        self.assertEqual(self.driver.find_element(By.NAME, "id-name1").get_attribute("value"), "name")

    def testShouldBeAbleToSwitchToFrameWithNameContainingDot(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_id("sixth.iframe1"))
        self.assertTrue("Page number 3" in self.driver.find_element(By.TAG_NAME, "body").text)

    def testShouldBeAbleToSwitchToAFrameUsingAPreviouslyLocatedWebElement(self):
        self._load_page("frameset")
        frame = self.driver.find_element(By.TAG_NAME, "frame")
        self.driver.switch_to.frame(frame)

        self.assertEqual(self.driver.find_element(By.ID, "pageNumber").text, "1")

    def testShouldBeAbleToSwitchToAnIFrameUsingAPreviouslyLocatedWebElement(self):
        self._load_page("iframes")
        frame = self.driver.find_element(By.TAG_NAME, "iframe")
        self.driver.switch_to.frame(frame)

        element = self.driver.find_element(By.NAME, "id-name1")
        self.assertEqual(element.get_attribute("value"), "name")

    def testShouldEnsureElementIsAFrameBeforeSwitching(self):
        self._load_page("frameset")
        frame = self.driver.find_element(By.TAG_NAME, "frameset")

        try:
            self.driver.switch_to.frame(frame)
            self.fail("Should have thrown NoSuchElementException")
        except NoSuchFrameException:
            # Do nothing.
            pass

    def testFrameSearchesShouldBeRelativeToTheCurrentlySelectedFrame(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_name("second"))
        self.assertEqual(self.driver.find_element(By.ID, "pageNumber").text, "2")

        try:
            self.driver.switch_to.frame(self.driver.find_element_by_name("third"))
            self.fail("Should have thrown NoSuchElementException")
        except NoSuchElementException:
            # Do nothing
            pass
        self.driver.switch_to.default_content()
        self.driver.switch_to.frame(self.driver.find_element_by_name("third"))

        try:
            self.driver.switch_to.frame(self.driver.find_element_by_name("second"))
            self.fail("Should have thrown NoSuchElementException")
        except NoSuchElementException:
            # Do nothing
            pass
        self.driver.switch_to.default_content()
        self.driver.switch_to.frame(self.driver.find_element_by_name("second"))
        self.assertEqual(self.driver.find_element(By.ID, "pageNumber").text, "2")

    def testShouldSelectChildFramesByChainedCalls(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_name("fourth"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("child2"))
        self.assertEqual(self.driver.find_element(By.ID, "pageNumber").text, "11")

    @pytest.mark.ignore_phantomjs
    def testShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_name("fourth"))

        try:
            self.driver.switch_to.frame(self.driver.find_element_by_name("second"))
            self.fail("Expected NoSuchElementException")
        except NoSuchElementException:
            # Expected
            pass

    def testShouldThrowAnExceptionWhenAFrameCannotBeFound(self):
        self._load_page("xhtmlTest")

        try:
            self.driver.switch_to.frame(self.driver.find_element_by_name("Nothing here"))
            self.fail("Should not have been able to switch")
        except NoSuchElementException:
            # This is expected
            pass

    def testShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex(self):
        self._load_page("xhtmlTest")

        try:
            self.driver.switch_to.frame(27)
            self.fail("Should not have been able to switch")
        except NoSuchFrameException:
            # This is expected
            pass

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToParentFrame(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_name("fourth"))
        self.driver.switch_to.parent_frame()
        self.driver.switch_to.frame(self.driver.find_element_by_name("first"))
        self.assertEqual(self.driver.find_element(By.ID, "pageNumber").text, "1")

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToParentFrameFromASecondLevelFrame(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_name("fourth"))
        self.driver.switch_to.frame(self.driver.find_element_by_name("child1"))
        self.driver.switch_to.parent_frame()
        self.driver.switch_to.frame(self.driver.find_element_by_name("child2"))
        self.assertEqual(self.driver.find_element(By.ID, "pageNumber").text, "11")

    @pytest.mark.ignore_phantomjs
    def testSwitchingToParentFrameFromDefaultContextIsNoOp(self):
        self._load_page("xhtmlTest")
        self.driver.switch_to.parent_frame()
        self.assertEquals(self.driver.title, "XHTML Test Page")

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToParentFromAnIframe(self):
        self._load_page("iframes")
        self.driver.switch_to.frame(0)
        self.driver.switch_to.parent_frame()
        self.driver.find_element(By.ID, "iframe_page_heading")

    # ----------------------------------------------------------------------------------------------
    #
    # General frame handling behavior tests
    #
    # ----------------------------------------------------------------------------------------------

    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    def testShouldContinueToReferToTheSameFrameOnceItHasBeenSelected(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(2)
        checkbox = self.driver.find_element(By.XPATH, "//input[@name='checky']")
        checkbox.click()
        # checkbox.submit()

        # TODO(simon): this should not be needed, and is only here because IE's submit returns too
        # soon.

        WebDriverWait(self.driver, 3).until(EC.text_to_be_present_in_element((By.XPATH, '//p'), 'Success!'))

    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    def testShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargetedPage(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(0)
        self.driver.find_element(By.LINK_TEXT, "top").click()

        expectedTitle = "XHTML Test Page"

        WebDriverWait(self.driver, 3).until(EC.title_is(expectedTitle))
        WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "only-exists-on-xhtmltest")))

    def testShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage(self):
        self._load_page("iframes")
        self.driver.switch_to.frame(0)

        try:
            self.driver.switch_to.default_content()
            self.driver.find_element(By.ID, "iframe_page_heading")
        except Exception:
            self.fail("Should have switched back to main content")

    def testShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt(self):
        self._load_page("iframes")
        self.driver.switch_to.frame(0)
        self.driver.find_element(By.ID, "submitButton").click()

        self.assertEqual(self.getTextOfGreetingElement(), "Success!")

    def getTextOfGreetingElement(self):
        return WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "greeting"))).text

    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    def testShouldBeAbleToClickInAFrame(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_name("third"))

        # This should replace frame "third" ...
        self.driver.find_element(By.ID, "submitButton").click()
        # driver should still be focused on frame "third" ...
        self.assertEqual(self.getTextOfGreetingElement(), "Success!")
        # Make sure it was really frame "third" which was replaced ...
        WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "third")))
        self.driver.switch_to.frame()
        self.assertEqual(self.getTextOfGreetingElement(), "Success!")

    def testShouldBeAbleToClickInAFrameThatRewritesTopWindowLocation(self):
        self.driver.get(self.webserver.where_is("click_tests/issue5237.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_id("search"))
        self.driver.find_element(By.ID, "submit").click()
        self.driver.switch_to.default_content()
        WebDriverWait(self.driver, 3).until(EC.title_is("Target page for issue 5237"))

    def testShouldBeAbleToClickInASubFrame(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_id("sixth"))
        self.driver.switch_to.frame(self.driver.find_element_by_id("iframe1"))

        # This should replace frame "iframe1" inside frame "sixth" ...
        self.driver.find_element(By.ID, "submitButton").click()
        # driver should still be focused on frame "iframe1" inside frame "sixth" ...
        self.assertEqual(self.getTextOfGreetingElement(), "Success!")
        # Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
        self.driver.switch_to.default_content()
        self.driver.switch_to.frame(self.driver.find_element_by_id("sixth"))
        self.driver.switch_to.frame(self.driver.find_element_by_id("iframe1"))
        self.assertEqual(self.driver.find_element(By.ID, "greeting").text, "Success!")

    def testShouldBeAbleToFindElementsInIframesByXPath(self):
        self._load_page("iframes")
        self.driver.switch_to.frame(self.driver.find_element_by_id("iframe1"))

        element = self.driver.find_element(By.XPATH, "//*[@id = 'changeme']")

        self.assertIsNotNone(element)

    @pytest.mark.ignore_phantomjs
    def testGetCurrentUrlReturnsTopLevelBrowsingContextUrl(self):
        self._load_page("frameset")
        self.assertTrue("frameset.html" in self.driver.current_url)
        self.driver.switch_to.frame(self.driver.find_element_by_name("second"))
        self.assertTrue("frameset.html" in self.driver.current_url)

    @pytest.mark.ignore_phantomjs
    def testGetCurrentUrlReturnsTopLevelBrowsingContextUrlForIframes(self):
        self._load_page("iframes")
        self.assertTrue("iframes.html" in self.driver.current_url)
        self.driver.switch_to.frame(self.driver.find_element_by_id("iframe1"))
        self.assertTrue("iframes.html" in self.driver.current_url)

    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUs(self):
        self.driver.get(self.webserver.where_is("frame_switching_tests/deletingFrame.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_id("iframe1"))

        killIframe = self.driver.find_element(By.ID, "killIframe")
        killIframe.click()
        self.driver.switch_to.default_content()

        self.assertFrameNotPresent(By.ID, "iframe1")

        addIFrame = self.driver.find_element(By.ID, "addBackFrame")
        addIFrame.click()
        WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "iframe1")))
        self.driver.switch_to.frame(self.driver.find_element_by_id("iframe1"))

        try:
            WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "success")))
        except WebDriverException:
            self.fail("Could not find element after switching frame")

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithFrameIndex(self):
        self.driver.get(self.webserver.where_is("frame_switching_tests/deletingFrame.html"))
        iframe = 0
        WebDriverWait(self.driver, 3).until(EC.frame_to_be_available_and_switch_to_it(iframe))
        # we should be in the frame now
        killIframe = self.driver.find_element(By.ID, "killIframe")
        killIframe.click()
        self.driver.switch_to.default_content()

        addIFrame = self.driver.find_element(By.ID, "addBackFrame")
        addIFrame.click()
        WebDriverWait(self.driver, 3).until(EC.frame_to_be_available_and_switch_to_it(iframe))

        try:
            WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "success")))
        except WebDriverException:
            self.fail("Could not find element after switching frame")

    @pytest.mark.ignore_phantomjs
    def testShouldBeAbleToSwitchToTheTopIfTheFrameIsDeletedFromUnderUsWithWebelement(self):
        self.driver.get(self.webserver.where_is("frame_switching_tests/deletingFrame.html"))
        iframe = self.driver.find_element(By.ID, "iframe1")
        WebDriverWait(self.driver, 3).until(EC.frame_to_be_available_and_switch_to_it(iframe))
        # we should be in the frame now
        killIframe = self.driver.find_element(By.ID, "killIframe")
        killIframe.click()
        self.driver.switch_to.default_content()

        addIFrame = self.driver.find_element(By.ID, "addBackFrame")
        addIFrame.click()

        iframe = self.driver.find_element(By.ID, "iframe1")
        WebDriverWait(self.driver, 3).until(EC.frame_to_be_available_and_switch_to_it(iframe))

        try:
            WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "success")))
        except WebDriverException:
            self.fail("Could not find element after switching frame")

    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    @pytest.mark.ignore_firefox
    def testShouldNotBeAbleToDoAnythingTheFrameIsDeletedFromUnderUs(self):
        self.driver.get(self.webserver.where_is("frame_switching_tests/deletingFrame.html"))
        self.driver.switch_to.frame(self.driver.find_element_by_id("iframe1"))

        killIframe = self.driver.find_element(By.ID, "killIframe")
        killIframe.click()

        try:
            self.driver.find_element(By.ID, "killIframe").click()
            self.fail("NoSuchElementException should be thrown")
        except NoSuchElementException:
            pass

    def testShouldReturnWindowTitleInAFrameset(self):
        self._load_page("frameset")
        self.driver.switch_to.frame(self.driver.find_element_by_name("third"))
        self.assertEquals("Unique title", self.driver.title)

    def testJavaScriptShouldExecuteInTheContextOfTheCurrentFrame(self):
        self._load_page("frameset")
        self.assertTrue(self.driver.execute_script("return window == window.top"))
        self.driver.switch_to.frame(self.driver.find_element(By.NAME, "third"))
        self.assertTrue(self.driver.execute_script("return window != window.top"))

    @pytest.mark.ignore_phantomjs
    def testShouldNotSwitchMagicallyToTheTopWindow(self):
        baseUrl = self.webserver.where_is("frame_switching_tests/")
        self.driver.get(baseUrl + "bug4876.html")
        self.driver.switch_to.frame(0)
        WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "inputText")))

        for i in range(20):
            try:
                input = WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "inputText")))
                submit = WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((By.ID, "submitButton")))
                input.clear()
                import random
                input.send_keys("rand%s" % int(random.random()))
                submit.click()
            finally:
                url = self.driver.execute_script("return window.location.href")
            # IE6 and Chrome add "?"-symbol to the end of the URL
        if (url.endswith("?")):
            url = url.substring(0, url.length() - 1)

        self.assertEquals(baseUrl + "bug4876_iframe.html", url)

    def testGetShouldSwitchToDefaultContext(self):
        self._load_page("iframes")
        try:
            self.driver.find_element(By.ID, "iframe1")
        except NoSuchElementException as e:
            self.fail("Expected to be on iframes.html, but %s" % e.msg())
        self.driver.switch_to.frame(self.driver.find_element(By.ID, "iframe1"))
        try:
            self.driver.find_element(By.ID, "cheese")  # Found on formPage.html but not on iframes.html.
        except NoSuchElementException as e:
            self.fail("Expected to be on formPage.html, but %s" % e.msg())

        self._load_page("iframes")  # This must effectively switch_to.default_content(), too.
        try:
            self.driver.find_element(By.ID, "iframe1")
        except NoSuchElementException as e:
            self.fail("Expected to be on iframes.html, but %s" % e.msg)

    def assertFrameNotPresent(self, by, locator):
        self.driver.switch_to.default_content()
        WebDriverWait(self.driver, 3).until(EC.presence_of_element_located((by, locator)))
        self.driver.switch_to.default_content()

    def _page_url(self, name):
        return self.webserver.where_is(name + '.html')

    def _load_simple_page(self):
        self._load_page("simpleTest")

    def _load_page(self, name):
        self.driver.get(self._page_url(name))
