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


@pytest.mark.ignore_marionette
class PageLoadingTests(unittest.TestCase):

    def testShouldWaitForDocumentToBeLoaded(self):
        self._loadSimplePage()

        self.assertEqual(self.driver.title, "Hello WebDriver")

    # Disabled till Java WebServer is used
    # def testShouldFollowRedirectsSentInTheHttpResponseHeaders(self):
    #    self.driver.get(pages.redirectPage);
    #    self.assertEqual(self.driver.title, "We Arrive Here")

    # Disabled till the Java WebServer is used
    # def testShouldFollowMetaRedirects(self):
    #    self._loadPage("metaRedirect")
    #    self.assertEqual(self.driver.title, "We Arrive Here")

    def testShouldBeAbleToGetAFragmentOnTheCurrentPage(self):
        self._loadPage("xhtmlTest")
        location = self.driver.current_url
        self.driver.get(location + "#text")
        self.driver.find_element(by=By.ID, value="id1")

    @pytest.mark.ignore_safari
    def testShouldReturnWhenGettingAUrlThatDoesNotResolve(self):
        try:
            #  Of course, we're up the creek if this ever does get registered
            self.driver.get("http://www.thisurldoesnotexist.comx/")
        except ValueError:
            pass

    @pytest.mark.ignore_safari
    def testShouldReturnWhenGettingAUrlThatDoesNotConnect(self):
        #  Here's hoping that there's nothing here. There shouldn't be
        self.driver.get("http://localhost:3001")

    # @Ignore({IE, IPHONE, SELENESE})
    # def testShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded() {
    #     self.driver.get(pages.framesetPage)
    #
    #     self.driver.switchTo().frame(0)
    #     WebElement pageNumber = self.driver.findElement(By.xpath("#span[@id='pageNumber']"))
    #     self.assertEqual((pageNumber.getText().trim(), equalTo("1"))
    #
    #     self.driver.switchTo().defaultContent().switchTo().frame(1)
    #     pageNumber = self.driver.findElement(By.xpath("#span[@id='pageNumber']"))
    #     self.assertEqual((pageNumber.getText().trim(), equalTo("2"))

    # Need to implement this decorator
    # @NeedsFreshDriver
    # def testSouldDoNothingIfThereIsNothingToGoBackTo() {
    #     originalTitle = self.driver.getTitle();
    #     self.driver.get(pages.formPage);
    #     self.driver.back();
    #     # We may have returned to the browser's home page
    #     self.assertEqual(self.driver.title, anyOf(equalTo(originalTitle), equalTo("We Leave From Here")));

    def testShouldBeAbleToNavigateBackInTheBrowserHistory(self):
        self._loadPage("formPage")

        self.driver.find_element(by=By.ID, value="imageButton").submit()
        self.assertEqual(self.driver.title, "We Arrive Here")

        self.driver.back()
        self.assertEqual(self.driver.title, "We Leave From Here")

    def testShouldBeAbleToNavigateBackInTheBrowserHistoryInPresenceOfIframes(self):
        self._loadPage("xhtmlTest")

        self.driver.find_element(by=By.NAME, value="sameWindow").click()

        self.assertEqual(self.driver.title, "This page has iframes")

        self.driver.back()
        self.assertEqual(self.driver.title, "XHTML Test Page")

    def testShouldBeAbleToNavigateForwardsInTheBrowserHistory(self):
        self._loadPage("formPage")

        self.driver.find_element(by=By.ID, value="imageButton").submit()
        self.assertEqual(self.driver.title, "We Arrive Here")

        self.driver.back()
        self.assertEqual(self.driver.title, "We Leave From Here")

        self.driver.forward()
        self.assertEqual(self.driver.title, "We Arrive Here")

    @pytest.mark.ignore_ie
    def testShouldNotHangifDocumentOpenCallIsNeverFollowedByDocumentCloseCall(self):
        self._loadPage("document_write_in_onload")
        self.driver.find_element(By.XPATH, "//body")

    def testShouldBeAbleToRefreshAPage(self):
        self._loadPage("xhtmlTest")

        self.driver.refresh()

        self.assertEqual(self.driver.title, "XHTML Test Page")

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
