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

# import pytest
#
# from selenium.common.exceptions import WebDriverException
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.wait import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC


def test_should_wait_for_document_to_be_loaded(driver, pages):
    pages.load("simpleTest.html")
    assert driver.title == "Hello WebDriver"


# Disabled till Java WebServer is used
# def test_should_follow_redirects_sent_in_the_http_response_headers(driver, pages):
#    pages.load("redirect.html")
#    assert driver.title == "We Arrive Here"


# Disabled till the Java WebServer is used
# def test_should_follow_meta_redirects(driver, pages):
#    pages.load("metaRedirect.html")
#    assert driver.title == "We Arrive Here"


# def test_should_be_able_to_get_afragment_on_the_current_page(driver, pages):
#     pages.load("xhtmlTest.html")
#     location = driver.current_url
#     driver.get(location + "#text")
#     driver.find_element(by=By.ID, value="id1")


# @pytest.mark.xfail_firefox(raises=WebDriverException)
# @pytest.mark.xfail_remote(raises=WebDriverException)
# def test_should_return_when_getting_aurl_that_does_not_resolve(driver):
#     #  Of course, we're up the creek if this ever does get registered
#     driver.get("http://www.thisurldoesnotexist.comx/")


# @pytest.mark.xfail_firefox(raises=WebDriverException)
# @pytest.mark.xfail_remote(raises=WebDriverException)
# def test_should_return_when_getting_aurl_that_does_not_connect(driver):
#     #  Here's hoping that there's nothing here. There shouldn't be
#     driver.get("http://localhost:3001")

# def test_should_be_able_to_load_apage_with_framesets_and_wait_until_all_frames_are_loaded() {
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
# def test_sould_do_nothing_if_there_is_nothing_to_go_back_to() {
#     originalTitle = driver.getTitle();
#     driver.get(pages.formPage);
#     driver.back();
#     # We may have returned to the browser's home page
#     self.assertEqual(driver.title, anyOf(equalTo(originalTitle), equalTo("We Leave From Here")));


# @pytest.mark.xfail_safari
# def test_should_be_able_to_navigate_back_in_the_browser_history(driver, pages):
#     pages.load("formPage.html")

#     driver.find_element(by=By.ID, value="imageButton").submit()
#     WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))

#     driver.back()
#     assert driver.title == "We Leave From Here"


# @pytest.mark.xfail_safari
# def test_should_be_able_to_navigate_back_in_the_browser_history_in_presence_of_iframes(driver, pages):
#     pages.load("xhtmlTest.html")

#     driver.find_element(by=By.NAME, value="sameWindow").click()

#     assert driver.title == "This page has iframes"

#     driver.back()
#     assert driver.title == "XHTML Test Page"


# def test_should_be_able_to_navigate_forwards_in_the_browser_history(driver, pages):
#     pages.load("formPage.html")

#     driver.find_element(by=By.ID, value="imageButton").submit()
#     WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))

#     driver.back()
#     assert driver.title == "We Leave From Here"

#     driver.forward()
#     assert driver.title == "We Arrive Here"


# @pytest.mark.xfail_ie
# @pytest.mark.xfail_firefox(run=False)
# @pytest.mark.xfail_remote(run=False)
# @pytest.mark.xfail_chrome(run=False)
# @pytest.mark.xfail_chromiumedge(run=False)
# def test_should_not_hang_if_document_open_call_is_never_followed_by_document_close_call(driver, pages):
#     pages.load("document_write_in_onload.html")
#     driver.find_element(By.XPATH, "//body")


# def test_should_be_able_to_refresh_apage(driver, pages):
#     pages.load("xhtmlTest.html")

#     driver.refresh()

#     assert driver.title == "XHTML Test Page"
