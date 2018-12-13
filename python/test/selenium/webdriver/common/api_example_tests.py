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

# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
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

import pytest

from selenium.common.exceptions import (
    NoSuchElementException,
    NoSuchWindowException,
    TimeoutException,
    WebDriverException)
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def testGetTitle(driver, pages):
    pages.load("simpleTest.html")
    title = driver.title
    assert "Hello WebDriver" == title


def testGetCurrentUrl(driver, pages, webserver):
    pages.load("simpleTest.html")
    url = driver.current_url
    assert webserver.where_is('simpleTest.html') == url


def testFindElementsByXPath(driver, pages):
    pages.load("simpleTest.html")
    elem = driver.find_element_by_xpath("//h1")
    assert "Heading" == elem.text


def testFindElementByXpathThrowNoSuchElementException(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element_by_xpath("//h4")


def testFindElementsByXpath(driver, pages):
    pages.load("nestedElements.html")
    elems = driver.find_elements_by_xpath("//option")
    assert 48 == len(elems)
    assert "One" == elems[0].get_attribute("value")


def testFindElementsByName(driver, pages):
    pages.load("xhtmlTest.html")
    elem = driver.find_element_by_name("windowOne")
    assert "Open new window" == elem.text


def testFindElementsByNameInElementContext(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element_by_name("form2")
    sub_elem = elem.find_element_by_name("selectomatic")
    assert "2" == sub_elem.get_attribute("id")


def testFindElementsByLinkTextInElementContext(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element_by_name("div1")
    sub_elem = elem.find_element_by_link_text("hello world")
    assert "link1" == sub_elem.get_attribute("name")


def testFindElementByIdInElementContext(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element_by_name("form2")
    sub_elem = elem.find_element_by_id("2")
    assert "selectomatic" == sub_elem.get_attribute("name")


def testFindElementByXpathInElementContext(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element_by_name("form2")
    sub_elem = elem.find_element_by_xpath("select")
    assert "2" == sub_elem.get_attribute("id")


def testFindElementByXpathInElementContextNotFound(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element_by_name("form2")
    with pytest.raises(NoSuchElementException):
        elem.find_element_by_xpath("div")


def testShouldBeAbleToEnterDataIntoFormFields(driver, pages):
    pages.load("xhtmlTest.html")
    elem = driver.find_element_by_xpath("//form[@name='someForm']/input[@id='username']")
    elem.clear()
    elem.send_keys("some text")
    elem = driver.find_element_by_xpath("//form[@name='someForm']/input[@id='username']")
    assert "some text" == elem.get_attribute("value")


def testFindElementByTagName(driver, pages):
    pages.load("simpleTest.html")
    elems = driver.find_elements_by_tag_name("div")
    num_by_xpath = len(driver.find_elements_by_xpath("//div"))
    assert num_by_xpath == len(elems)
    elems = driver.find_elements_by_tag_name("iframe")
    assert 0 == len(elems)


def testFindElementByTagNameWithinElement(driver, pages):
    pages.load("simpleTest.html")
    div = driver.find_element_by_id("multiline")
    elems = div.find_elements_by_tag_name("p")
    assert len(elems) == 1


@pytest.mark.xfail_marionette(
    reason="W3C implementations can't switch to a window by name",
    raises=TimeoutException,
    run=False)
def testSwitchToWindow(driver, pages):
    title_1 = "XHTML Test Page"
    title_2 = "We Arrive Here"
    switch_to_window_timeout = 5
    wait = WebDriverWait(driver, switch_to_window_timeout, ignored_exceptions=[NoSuchWindowException])
    pages.load("xhtmlTest.html")
    driver.find_element_by_link_text("Open new window").click()
    assert title_1 == driver.title
    wait.until(lambda dr: dr.switch_to.window("result") is None)
    assert title_2 == driver.title


def testSwitchFrameByName(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element_by_name("third"))
    checkbox = driver.find_element_by_id("checky")
    checkbox.click()
    checkbox.submit()


def testIsEnabled(driver, pages):
    pages.load("formPage.html")
    elem = driver.find_element_by_xpath("//input[@id='working']")
    assert elem.is_enabled()
    elem = driver.find_element_by_xpath("//input[@id='notWorking']")
    assert not elem.is_enabled()


def testIsSelectedAndToggle(driver, pages):
    pages.load("formPage.html")
    elem = driver.find_element_by_id("multi")
    option_elems = elem.find_elements_by_xpath("option")
    assert option_elems[0].is_selected()
    option_elems[0].click()
    assert not option_elems[0].is_selected()
    option_elems[0].click()
    assert option_elems[0].is_selected()
    assert option_elems[2].is_selected()


def testNavigate(driver, pages):
    pages.load("formPage.html")
    driver.find_element_by_id("imageButton").submit()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))
    driver.back()
    assert "We Leave From Here" == driver.title
    driver.forward()
    assert "We Arrive Here" == driver.title


def testGetAttribute(driver, pages):
    url = pages.url('xhtmlTest.html')
    driver.get(url)
    elem = driver.find_element_by_id("id1")
    attr = elem.get_attribute("href")
    assert '{0}#'.format(url) == attr


def testGetImplicitAttribute(driver, pages):
    pages.load("nestedElements.html")
    elems = driver.find_elements_by_xpath("//option")
    assert len(elems) >= 3
    for i, elem in enumerate(elems[:3]):
        assert i == int(elem.get_attribute("index"))


def testExecuteSimpleScript(driver, pages):
    pages.load("xhtmlTest.html")
    title = driver.execute_script("return document.title;")
    assert "XHTML Test Page" == title


def testExecuteScriptAndReturnElement(driver, pages):
    pages.load("xhtmlTest.html")
    elem = driver.execute_script("return document.getElementById('id1');")
    assert "WebElement" in str(type(elem))


def testExecuteScriptWithArgs(driver, pages):
    pages.load("xhtmlTest.html")
    result = driver.execute_script("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish")
    assert "fish" == result


def testExecuteScriptWithMultipleArgs(driver, pages):
    pages.load("xhtmlTest.html")
    result = driver.execute_script(
        "return arguments[0] + arguments[1]", 1, 2)
    assert 3 == result


def testExecuteScriptWithElementArgs(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element_by_id("plainButton")
    result = driver.execute_script("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button)
    assert "plainButton" == result


def testFindElementsByPartialLinkText(driver, pages):
    pages.load("xhtmlTest.html")
    elem = driver.find_element_by_partial_link_text("new window")
    elem.click()


def testIsElementDisplayed(driver, pages):
    pages.load("javascriptPage.html")
    visible = driver.find_element_by_id("displayed").is_displayed()
    not_visible = driver.find_element_by_id("hidden").is_displayed()
    assert visible
    assert not not_visible


def testMoveWindowPosition(driver, pages):
    pages.load("blank.html")
    loc = driver.get_window_position()
    # note can't test 0,0 since some OS's dont allow that location
    # because of system toolbars
    new_x = 50
    new_y = 50
    if loc['x'] == new_x:
        new_x += 10
    if loc['y'] == new_y:
        new_y += 10
    driver.set_window_position(new_x, new_y)
    loc = driver.get_window_position()
    assert loc['x'] == new_x
    assert loc['y'] == new_y


def testChangeWindowSize(driver, pages):
    pages.load("blank.html")
    size = driver.get_window_size()
    newSize = [600, 600]
    if size['width'] == 600:
        newSize[0] = 500
    if size['height'] == 600:
        newSize[1] = 500
    driver.set_window_size(newSize[0], newSize[1])
    size = driver.get_window_size()
    assert size['width'] == newSize[0]
    assert size['height'] == newSize[1]


@pytest.mark.xfail_marionette(
    raises=WebDriverException)
def testGetLogTypes(driver, pages):
    pages.load("blank.html")
    assert isinstance(driver.log_types, list)


@pytest.mark.xfail_marionette(
    raises=WebDriverException)
def testGetLog(driver, pages):
    pages.load("blank.html")
    for log_type in driver.log_types:
        log = driver.get_log(log_type)
        assert isinstance(log, list)
