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

from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait


def test_get_title(driver, pages):
    pages.load("simpleTest.html")
    title = driver.title
    assert "Hello WebDriver" == title


def test_get_current_url(driver, pages, webserver):
    pages.load("simpleTest.html")
    url = driver.current_url
    assert webserver.where_is("simpleTest.html") == url


def test_find_element_by_xpath(driver, pages):
    pages.load("simpleTest.html")
    elem = driver.find_element(By.XPATH, "//h1")
    assert "Heading" == elem.text


def test_find_element_by_xpath_throw_no_such_element_exception(driver, pages):
    pages.load("simpleTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.XPATH, "//h4")


def test_find_elements_by_xpath(driver, pages):
    pages.load("nestedElements.html")
    elems = driver.find_elements(By.XPATH, "//option")
    assert 48 == len(elems)
    assert "One" == elems[0].get_attribute("value")


def test_find_elements_by_name(driver, pages):
    pages.load("xhtmlTest.html")
    elem = driver.find_element(By.NAME, "windowOne")
    assert "Open new window" == elem.text


def test_find_elements_by_name_in_element_context(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element(By.NAME, "form2")
    sub_elem = elem.find_element(By.NAME, "selectomatic")
    assert "2" == sub_elem.get_attribute("id")


def test_find_elements_by_link_text_in_element_context(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element(By.NAME, "div1")
    sub_elem = elem.find_element(By.LINK_TEXT, "hello world")
    assert "link1" == sub_elem.get_attribute("name")


def test_find_element_by_id_in_element_context(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element(By.NAME, "form2")
    sub_elem = elem.find_element(By.ID, "2")
    assert "selectomatic" == sub_elem.get_attribute("name")


def test_find_element_by_xpath_in_element_context(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element(By.NAME, "form2")
    sub_elem = elem.find_element(By.XPATH, "select")
    assert "2" == sub_elem.get_attribute("id")


def test_find_element_by_xpath_in_element_context_not_found(driver, pages):
    pages.load("nestedElements.html")
    elem = driver.find_element(By.NAME, "form2")
    with pytest.raises(NoSuchElementException):
        elem.find_element(By.XPATH, "div")


def test_should_be_able_to_enter_data_into_form_fields(driver, pages):
    pages.load("xhtmlTest.html")
    elem = driver.find_element(By.XPATH, "//form[@name='someForm']/input[@id='username']")
    elem.clear()
    elem.send_keys("some text")
    elem = driver.find_element(By.XPATH, "//form[@name='someForm']/input[@id='username']")
    assert "some text" == elem.get_attribute("value")


def test_find_element_by_tag_name(driver, pages):
    pages.load("simpleTest.html")
    elems = driver.find_elements(By.TAG_NAME, "div")
    num_by_xpath = len(driver.find_elements(By.XPATH, "//div"))
    assert num_by_xpath == len(elems)
    elems = driver.find_elements(By.TAG_NAME, "iframe")
    assert 0 == len(elems)


def test_find_element_by_tag_name_within_element(driver, pages):
    pages.load("simpleTest.html")
    div = driver.find_element(By.ID, "multiline")
    elems = div.find_elements(By.TAG_NAME, "p")
    assert len(elems) == 1


def test_switch_frame_by_name(driver, pages):
    pages.load("frameset.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "third"))
    checkbox = driver.find_element(By.ID, "checky")
    checkbox.click()
    checkbox.submit()


def test_is_enabled(driver, pages):
    pages.load("formPage.html")
    elem = driver.find_element(By.XPATH, "//input[@id='working']")
    assert elem.is_enabled()
    elem = driver.find_element(By.XPATH, "//input[@id='notWorking']")
    assert not elem.is_enabled()


def test_is_selected_and_toggle(driver, pages):
    pages.load("formPage.html")
    elem = driver.find_element(By.ID, "multi")
    option_elems = elem.find_elements(By.XPATH, "option")
    assert option_elems[0].is_selected()
    option_elems[0].click()
    assert not option_elems[0].is_selected()
    option_elems[0].click()
    assert option_elems[0].is_selected()
    assert option_elems[2].is_selected()


def test_navigate(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.ID, "imageButton").submit()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))
    driver.back()
    assert "We Leave From Here" == driver.title
    driver.forward()
    assert "We Arrive Here" == driver.title


def test_get_attribute(driver, pages):
    url = pages.url("xhtmlTest.html")
    driver.get(url)
    elem = driver.find_element(By.ID, "id1")
    attr = elem.get_attribute("href")
    assert f"{url}#" == attr


def test_get_implicit_attribute(driver, pages):
    pages.load("nestedElements.html")
    elems = driver.find_elements(By.XPATH, "//option")
    assert len(elems) >= 3
    for i, elem in enumerate(elems[:3]):
        assert i == int(elem.get_attribute("index"))


def test_get_dom_attribute(driver, pages):
    url = pages.url("formPage.html")
    driver.get(url)
    elem = driver.find_element(By.ID, "vsearchGadget")
    attr = elem.get_dom_attribute("accesskey")
    assert "4" == attr


def test_get_property(driver, pages):
    url = pages.url("formPage.html")
    driver.get(url)
    elem = driver.find_element(By.ID, "withText")
    prop = elem.get_property("value")
    assert "Example text" == prop


def test_execute_simple_script(driver, pages):
    pages.load("xhtmlTest.html")
    title = driver.execute_script("return document.title;")
    assert "XHTML Test Page" == title


def test_execute_script_and_return_element(driver, pages):
    pages.load("xhtmlTest.html")
    elem = driver.execute_script("return document.getElementById('id1');")
    assert "WebElement" in str(type(elem))


def test_execute_script_with_args(driver, pages):
    pages.load("xhtmlTest.html")
    result = driver.execute_script("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish")
    assert "fish" == result


def test_execute_script_with_multiple_args(driver, pages):
    pages.load("xhtmlTest.html")
    result = driver.execute_script("return arguments[0] + arguments[1]", 1, 2)
    assert 3 == result


def test_execute_script_with_element_args(driver, pages):
    pages.load("javascriptPage.html")
    button = driver.find_element(By.ID, "plainButton")
    result = driver.execute_script(
        "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button
    )
    assert "plainButton" == result


def test_find_elements_by_partial_link_text(driver, pages):
    pages.load("xhtmlTest.html")
    elem = driver.find_element(By.PARTIAL_LINK_TEXT, "new window")
    elem.click()


def test_is_element_displayed(driver, pages):
    pages.load("javascriptPage.html")
    visible = driver.find_element(By.ID, "displayed").is_displayed()
    not_visible = driver.find_element(By.ID, "hidden").is_displayed()
    assert visible
    assert not not_visible


@pytest.mark.xfail_chrome
def test_move_window_position(driver, pages):
    pages.load("blank.html")
    loc = driver.get_window_position()
    # note can't test 0,0 since some OS's dont allow that location
    # because of system toolbars
    new_x = 50
    new_y = 50
    if loc["x"] == new_x:
        new_x += 10
    if loc["y"] == new_y:
        new_y += 10
    driver.set_window_position(new_x, new_y)
    loc = driver.get_window_position()
    assert loc["x"] == new_x
    assert loc["y"] == new_y


def test_change_window_size(driver, pages):
    pages.load("blank.html")
    size = driver.get_window_size()
    newSize = [600, 600]
    if size["width"] == 600:
        newSize[0] = 500
    if size["height"] == 600:
        newSize[1] = 500
    driver.set_window_size(newSize[0], newSize[1])
    size = driver.get_window_size()
    assert size["width"] == newSize[0]
    assert size["height"] == newSize[1]


@pytest.mark.xfail_firefox(raises=WebDriverException)
@pytest.mark.xfail_remote
@pytest.mark.xfail_safari
def test_get_log_types(driver, pages):
    pages.load("blank.html")
    assert isinstance(driver.log_types, list)


@pytest.mark.xfail_firefox(raises=WebDriverException)
@pytest.mark.xfail_remote
@pytest.mark.xfail_safari
def test_get_log(driver, pages):
    pages.load("blank.html")
    for log_type in driver.log_types:
        log = driver.get_log(log_type)
        assert isinstance(log, list)
