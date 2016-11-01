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

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By


class TestPageLoading(object):

    def testShouldWaitForDocumentToBeLoaded(self, driver, pages):
        pages.load("simpleTest.html")
        assert driver.title == "Hello WebDriver"

    # Disabled till Java WebServer is used
    # def testShouldFollowRedirectsSentInTheHttpResponseHeaders(self, driver, pages):
    #    pages.load("redirect.html")
    #    assert driver.title == "We Arrive Here"

    # Disabled till the Java WebServer is used
    # def testShouldFollowMetaRedirects(self, driver, pages):
    #    pages.load("metaRedirect.html")
    #    assert driver.title == "We Arrive Here"

    @pytest.mark.xfail_marionette(run=False)
    def testShouldBeAbleToGetAFragmentOnTheCurrentPage(self, driver, pages):
        pages.load("xhtmlTest.html")
        location = driver.current_url
        driver.get(location + "#text")
        driver.find_element(by=By.ID, value="id1")

    @pytest.mark.xfail_marionette(raises=WebDriverException)
    def testShouldReturnWhenGettingAUrlThatDoesNotResolve(self, driver):
        #  Of course, we're up the creek if this ever does get registered
        driver.get("http://www.thisurldoesnotexist.comx/")

    @pytest.mark.xfail_marionette(raises=WebDriverException)
    def testShouldReturnWhenGettingAUrlThatDoesNotConnect(self, driver):
        #  Here's hoping that there's nothing here. There shouldn't be
        driver.get("http://localhost:3001")

    # def testShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded() {
    #     driver.get(pages.framesetPage)
    #
    #     driver.switchTo().frame(0)
    #     WebElement pageNumber = driver.findElement(By.xpath("#span[@id='pageNumber']"))
    #     self.assertEqual((pageNumber.getText().trim(), equalTo("1"))
    #
    #     driver.switchTo().defaultContent().switchTo().frame(1)
    #     pageNumber = driver.findElement(By.xpath("#span[@id='pageNumber']"))
    #     self.assertEqual((pageNumber.getText().trim(), equalTo("2"))

    # Need to implement this decorator
    # @NeedsFreshDriver
    # def testSouldDoNothingIfThereIsNothingToGoBackTo() {
    #     originalTitle = driver.getTitle();
    #     driver.get(pages.formPage);
    #     driver.back();
    #     # We may have returned to the browser's home page
    #     self.assertEqual(driver.title, anyOf(equalTo(originalTitle), equalTo("We Leave From Here")));

    @pytest.mark.xfail_marionette(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1291320")
    def testShouldBeAbleToNavigateBackInTheBrowserHistory(self, driver, pages):
        pages.load("formPage.html")

        driver.find_element(by=By.ID, value="imageButton").submit()
        assert driver.title == "We Arrive Here"

        driver.back()
        assert driver.title == "We Leave From Here"

    @pytest.mark.xfail_marionette(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1291320")
    def testShouldBeAbleToNavigateBackInTheBrowserHistoryInPresenceOfIframes(self, driver, pages):
        pages.load("xhtmlTest.html")

        driver.find_element(by=By.NAME, value="sameWindow").click()

        assert driver.title == "This page has iframes"

        driver.back()
        assert driver.title == "XHTML Test Page"

    @pytest.mark.xfail_marionette(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1291320")
    def testShouldBeAbleToNavigateForwardsInTheBrowserHistory(self, driver, pages):
        pages.load("formPage.html")

        driver.find_element(by=By.ID, value="imageButton").submit()
        assert driver.title == "We Arrive Here"

        driver.back()
        assert driver.title == "We Leave From Here"

        driver.forward()
        assert driver.title == "We Arrive Here"

    @pytest.mark.xfail_ie
    @pytest.mark.xfail_marionette(run=False)
    def testShouldNotHangifDocumentOpenCallIsNeverFollowedByDocumentCloseCall(self, driver, pages):
        pages.load("document_write_in_onload.html")
        driver.find_element(By.XPATH, "//body")

    def testShouldBeAbleToRefreshAPage(self, driver, pages):
        pages.load("xhtmlTest.html")

        driver.refresh()

        assert driver.title == "XHTML Test Page"
