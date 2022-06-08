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
from selenium.common.exceptions import (
    InvalidSelectorException,
    NoSuchElementException)

# By.id positive


def test_should_be_able_to_find_asingle_element_by_id(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.ID, "linkId")
    assert element.get_attribute("id") == "linkId"


def test_should_be_able_to_find_asingle_element_by_numeric_id(driver, pages):
    pages.load("nestedElements.html")
    element = driver.find_element(By.ID, "2")
    assert element.get_attribute("id") == "2"


def test_should_be_able_to_find_an_element_with_css_escape(driver, pages):
    pages.load("idElements.html")
    element = driver.find_element(By.ID, "with.dots")
    assert element.get_attribute("id") == "with.dots"


def test_should_be_able_to_find_multiple_elements_by_id(driver, pages):
    pages.load("nestedElements.html")
    elements = driver.find_elements(By.ID, "test_id")
    assert len(elements) == 2


def test_should_be_able_to_find_multiple_elements_by_numeric_id(driver, pages):
    pages.load("nestedElements.html")
    elements = driver.find_elements(By.ID, "2")
    assert len(elements) == 8

# By.id negative


def test_should_not_be_able_to_locate_by_id_asingle_element_that_does_not_exist(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.ID, "non_Existent_Button")


def test_should_not_be_able_to_locate_by_id_multiple_elements_that_do_not_exist(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.ID, "non_Existent_Button")
    assert len(elements) == 0


def test_finding_asingle_element_by_empty_id_should_throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.ID, "")


def test_finding_multiple_elements_by_empty_id_should_return_empty_list(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.ID, "")
    assert len(elements) == 0


def test_finding_asingle_element_by_id_with_space_should_throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.ID, "nonexistent button")


def test_finding_multiple_elements_by_id_with_space_should_return_empty_list(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.ID, "nonexistent button")
    assert len(elements) == 0

# By.name positive


def test_should_be_able_to_find_asingle_element_by_name(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.NAME, "checky")
    assert element.get_attribute("value") == "furrfu"


def test_should_be_able_to_find_multiple_elements_by_name(driver, pages):
    pages.load("nestedElements.html")
    elements = driver.find_elements(By.NAME, "checky")
    assert len(elements) > 1


def test_should_be_able_to_find_an_element_that_does_not_support_the_name_property(driver, pages):
    pages.load("nestedElements.html")
    element = driver.find_element(By.NAME, "div1")
    assert element.get_attribute("name") == "div1"

# By.name negative


def test_should_not_be_able_to_locate_by_name_asingle_element_that_does_not_exist(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.NAME, "non_Existent_Button")


def test_should_not_be_able_to_locate_by_name_multiple_elements_that_do_not_exist(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.NAME, "non_Existent_Button")
    assert len(elements) == 0


def test_finding_asingle_element_by_empty_name_should_throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.NAME, "")


def test_finding_multiple_elements_by_empty_name_should_return_empty_list(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.NAME, "")
    assert len(elements) == 0


def test_finding_asingle_element_by_name_with_space_should_throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.NAME, "nonexistent button")


def test_finding_multiple_elements_by_name_with_space_should_return_empty_list(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.NAME, "nonexistent button")
    assert len(elements) == 0

# By.tag_Name positive


def test_should_be_able_to_find_asingle_element_by_tag_name(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.TAG_NAME, "input")
    assert element.tag_name.lower() == "input"


def test_should_be_able_to_find_multiple_elements_by_tag_name(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.TAG_NAME, "input")
    assert len(elements) > 1

# By.tag_Name negative


def test_should_not_be_able_to_locate_by_tag_name_asingle_element_that_does_not_exist(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.TAG_NAME, "non_Existent_Button")


def test_should_not_be_able_to_locate_by_tag_name_multiple_elements_that_do_not_exist(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.TAG_NAME, "non_Existent_Button")
    assert len(elements) == 0


@pytest.mark.xfail_firefox(reason='https://github.com/mozilla/geckodriver/issues/2007')
@pytest.mark.xfail_remote(reason='https://github.com/mozilla/geckodriver/issues/2007')
def test_finding_asingle_element_by_empty_tag_name_should_throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.TAG_NAME, "")


@pytest.mark.xfail_firefox(reason='https://github.com/mozilla/geckodriver/issues/2007')
@pytest.mark.xfail_remote(reason='https://github.com/mozilla/geckodriver/issues/2007')
def test_finding_multiple_elements_by_empty_tag_name_should_throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.TAG_NAME, "")


def test_finding_asingle_element_by_tag_name_with_space_should_throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.TAG_NAME, "nonexistent button")


def test_finding_multiple_elements_by_tag_name_with_space_should_return_empty_list(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.TAG_NAME, "nonexistent button")
    assert len(elements) == 0

# By.class_Name positive


def test_should_be_able_to_find_asingle_element_by_class(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "extraDiv")
    assert "Another div starts here." in element.text


def test_should_be_able_to_find_multiple_elements_by_class_name(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CLASS_NAME, "nameC")
    assert len(elements) > 1


def test_should_find_element_by_class_when_it_is_the_first_name_among_many(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "nameA")
    assert element.text == "An H2 title"


def test_should_find_element_by_class_when_it_is_the_last_name_among_many(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "nameC")
    assert element.text == "An H2 title"


def test_should_find_element_by_class_when_it_is_in_the_middle_among_many(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "nameBnoise")
    assert element.text == "An H2 title"


def test_should_find_element_by_class_when_its_name_is_surrounded_by_whitespace(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "spaceAround")
    assert element.text == "Spaced out"


def test_should_find_elements_by_class_when_its_name_is_surrounded_by_whitespace(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CLASS_NAME, "spaceAround")
    assert len(elements) == 1
    assert elements[0].text == "Spaced out"

# By.class_Name negative


def test_should_not_find_element_by_class_when_the_name_queried_is_shorter_than_candidate_name(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CLASS_NAME, "name_B")


def test_finding_asingle_element_by_empty_class_name_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.CLASS_NAME, "")


def test_finding_multiple_elements_by_empty_class_name_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.CLASS_NAME, "")


def test_finding_asingle_element_by_compound_class_name_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CLASS_NAME, "a b")


def test_finding_asingle_element_by_invalid_class_name_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.CLASS_NAME, "!@#$%^&*")


def test_finding_multiple_elements_by_invalid_class_name_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.CLASS_NAME, "!@#$%^&*")

# By.xpath positive


def test_should_be_able_to_find_asingle_element_by_xpath(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.XPATH, "//h1")
    assert element.text == "XHTML Might Be The Future"


def test_should_be_able_to_find_multiple_elements_by_xpath(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.XPATH, "//div")
    assert len(elements) == 13


def test_should_be_able_to_find_many_elements_repeatedly_by_xpath(driver, pages):
    pages.load("xhtmlTest.html")
    xpath = "//node()[contains(@id,'id')]"
    assert len(driver.find_elements(By.XPATH, xpath)) == 3

    xpath = "//node()[contains(@id,'nope')]"
    assert len(driver.find_elements(By.XPATH, xpath)) == 0


def test_should_be_able_to_identify_elements_by_class(driver, pages):
    pages.load("xhtmlTest.html")
    header = driver.find_element(By.XPATH, "//h1[@class='header']")
    assert header.text == "XHTML Might Be The Future"


def test_should_be_able_to_find_an_element_by_xpath_with_multiple_attributes(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(
        By.XPATH, "//form[@name='optional']/input[@type='submit' and @value='Click!']")
    assert element.tag_name.lower() == "input"
    assert element.get_attribute("value") == "Click!"


def test_finding_alink_by_xpath_should_locate_an_element_with_the_given_text(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.XPATH, "//a[text()='click me']")
    assert element.text == "click me"


def test_finding_alink_by_xpath_using_contains_keyword_should_work(driver, pages):
    pages.load("nestedElements.html")
    element = driver.find_element(By.XPATH, "//a[contains(.,'hello world')]")
    assert "hello world" in element.text


# @pytest.mark.xfail_chrome(raises=InvalidSelectorException)
# @pytest.mark.xfail_chromiumedge(raises=InvalidSelectorException)
# @pytest.mark.xfail_firefox(raises=InvalidSelectorException)
# @pytest.mark.xfail_remote(raises=InvalidSelectorException)
# @pytest.mark.xfail_safari(raises=NoSuchElementException)
# @pytest.mark.xfail_webkitgtk(raises=InvalidSelectorException)
# def test_Should_Be_Able_To_Find_Element_By_XPath_With_Namespace(driver, pages):
#     pages.load("svgPage.html")
#     element = driver.find_element(By.XPATH, "//svg:svg//svg:text")
#     assert element.text == "Test Chart"


def test_should_be_able_to_find_element_by_xpath_in_xml_document(driver, pages):
    pages.load("simple.xml")
    element = driver.find_element(By.XPATH, "//foo")
    assert "baz" in element.text

# By.xpath negative


def test_should_throw_an_exception_when_there_is_no_link_to_click(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.XPATH, "//a[@id='Not here']")


def test_should_throw_invalid_selector_exception_when_xpath_is_syntactically_invalid_in_driver_find_element(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.XPATH, "this][isnot][valid")


def test_should_throw_invalid_selector_exception_when_xpath_is_syntactically_invalid_in_driver_find_elements(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.XPATH, "this][isnot][valid")


def test_should_throw_invalid_selector_exception_when_xpath_is_syntactically_invalid_in_element_find_element(driver, pages):
    pages.load("formPage.html")
    body = driver.find_element(By.TAG_NAME, "body")
    with pytest.raises(InvalidSelectorException):
        body.find_element(By.XPATH, "this][isnot][valid")


def test_should_throw_invalid_selector_exception_when_xpath_is_syntactically_invalid_in_element_find_elements(driver, pages):
    pages.load("formPage.html")
    body = driver.find_element(By.TAG_NAME, "body")
    with pytest.raises(InvalidSelectorException):
        body.find_elements(By.XPATH, "this][isnot][valid")


def test_should_throw_invalid_selector_exception_when_xpath_returns_wrong_type_in_driver_find_element(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.XPATH, "count(//input)")


def test_should_throw_invalid_selector_exception_when_xpath_returns_wrong_type_in_driver_find_elements(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.XPATH, "count(//input)")


def test_should_throw_invalid_selector_exception_when_xpath_returns_wrong_type_in_element_find_element(driver, pages):
    pages.load("formPage.html")
    body = driver.find_element(By.TAG_NAME, "body")
    with pytest.raises(InvalidSelectorException):
        body.find_element(By.XPATH, "count(//input)")


def test_should_throw_invalid_selector_exception_when_xpath_returns_wrong_type_in_element_find_elements(driver, pages):
    pages.load("formPage.html")
    body = driver.find_element(By.TAG_NAME, "body")
    with pytest.raises(InvalidSelectorException):
        body.find_elements(By.XPATH, "count(//input)")

# By.css_Selector positive


def test_should_be_able_to_find_asingle_element_by_css_selector(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CSS_SELECTOR, "div.content")
    assert element.tag_name.lower() == "div"
    assert element.get_attribute("class") == "content"


def test_should_be_able_to_find_multiple_elements_by_css_selector(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CSS_SELECTOR, "p")
    assert len(elements) > 1


def test_should_be_able_to_find_asingle_element_by_compound_css_selector(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CSS_SELECTOR, "div.extraDiv, div.content")
    assert element.tag_name.lower() == "div"
    assert element.get_attribute("class") == "content"


def test_should_be_able_to_find_multiple_elements_by_compound_css_selector(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CSS_SELECTOR, "div.extraDiv, div.content")
    assert len(elements) > 1
    assert elements[0].get_attribute("class") == "content"
    assert elements[1].get_attribute("class") == "extraDiv"


def test_should_be_able_to_find_an_element_by_boolean_attribute_using_css_selector(driver, pages):
    pages.load("locators_tests/boolean_attribute_selected.html")
    element = driver.find_element(By.CSS_SELECTOR, "option[selected='selected']")
    assert element.get_attribute("value") == "two"


def test_should_be_able_to_find_an_element_by_boolean_attribute_using_short_css_selector(driver, pages):
    pages.load("locators_tests/boolean_attribute_selected.html")
    element = driver.find_element(By.CSS_SELECTOR, "option[selected]")
    assert element.get_attribute("value") == "two"


def test_should_be_able_to_find_an_element_by_boolean_attribute_using_short_css_selector_on_html_4_page(driver, pages):
    pages.load("locators_tests/boolean_attribute_selected_html4.html")
    element = driver.find_element(By.CSS_SELECTOR, "option[selected]")
    assert element.get_attribute("value") == "two"

# By.css_Selector negative


def test_should_not_find_element_by_css_selector_when_there_is_no_such_element(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CSS_SELECTOR, ".there-is-no-such-class")


def test_should_not_find_elements_by_css_selector_when_there_is_no_such_element(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CSS_SELECTOR, ".there-is-no-such-class")
    assert len(elements) == 0


def test_finding_asingle_element_by_empty_css_selector_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.CSS_SELECTOR, "")


def test_finding_multiple_elements_by_empty_css_selector_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.CSS_SELECTOR, "")


def test_finding_asingle_element_by_invalid_css_selector_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.CSS_SELECTOR, "//a/b/c[@id='1']")


def test_finding_multiple_elements_by_invalid_css_selector_should_throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.CSS_SELECTOR, "//a/b/c[@id='1']")

# By.link_Text positive


def test_should_be_able_to_find_alink_by_text(driver, pages):
    pages.load("xhtmlTest.html")
    link = driver.find_element(By.LINK_TEXT, "click me")
    assert link.text == "click me"


def test_should_be_able_to_find_multiple_links_by_text(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.LINK_TEXT, "click me")
    assert len(elements) == 2


def test_should_find_element_by_link_text_containing_equals_sign(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.LINK_TEXT, "Link=equalssign")
    assert element.get_attribute("id") == "linkWithEqualsSign"


def test_should_find_multiple_elements_by_link_text_containing_equals_sign(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.LINK_TEXT, "Link=equalssign")
    assert 1 == len(elements)
    assert elements[0].get_attribute("id") == "linkWithEqualsSign"


def test_finds_by_link_text_on_xhtml_page(driver, pages):
    pages.load("actualXhtmlPage.xhtml")
    link_Text = "Foo"
    element = driver.find_element(By.LINK_TEXT, link_Text)
    assert element.text == link_Text


def test_link_with_formatting_tags(driver, pages):
    pages.load("simpleTest.html")
    elem = driver.find_element(By.ID, "links")

    res = elem.find_element(By.PARTIAL_LINK_TEXT, "link with formatting tags")
    assert res.text == "link with formatting tags"


@pytest.mark.xfail_safari
def test_driver_can_get_link_by_link_test_ignoring_trailing_whitespace(driver, pages):
    pages.load("simpleTest.html")
    link = driver.find_element(By.LINK_TEXT, "link with trailing space")
    assert link.get_attribute("id") == "linkWithTrailingSpace"
    assert link.text == "link with trailing space"

# By.link_Text negative


def test_should_not_be_able_to_locate_by_link_text_asingle_element_that_does_not_exist(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.LINK_TEXT, "Not here either")


def test_should_not_be_able_to_locate_by_link_text_multiple_elements_that_do_not_exist(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.LINK_TEXT, "Not here either")
    assert len(elements) == 0

# By.partial_Link_Text positive


def test_should_be_able_to_find_multiple_elements_by_partial_link_text(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.PARTIAL_LINK_TEXT, "ick me")
    assert len(elements) == 2


def test_should_be_able_to_find_asingle_element_by_partial_link_text(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.PARTIAL_LINK_TEXT, "anon")
    assert "anon" in element.text


def test_should_find_element_by_partial_link_text_containing_equals_sign(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.PARTIAL_LINK_TEXT, "Link=")
    assert element.get_attribute("id") == "linkWithEqualsSign"


def test_should_find_multiple_elements_by_partial_link_text_containing_equals_sign(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.PARTIAL_LINK_TEXT, "Link=")
    assert len(elements) == 1
    assert elements[0].get_attribute("id") == "linkWithEqualsSign"

# Misc tests


def test_driver_should_be_able_to_find_elements_after_loading_more_than_one_page_at_atime(driver, pages):
    pages.load("formPage.html")
    pages.load("xhtmlTest.html")
    link = driver.find_element(By.LINK_TEXT, "click me")
    assert link.text == "click me"

# You don't want to ask why this is here


def test_when_finding_by_name_should_not_return_by_id(driver, pages):
    pages.load("formPage.html")

    element = driver.find_element(By.NAME, "id-name1")
    assert element.get_attribute("value") == "name"

    element = driver.find_element(By.ID, "id-name1")
    assert element.get_attribute("value") == "id"

    element = driver.find_element(By.NAME, "id-name2")
    assert element.get_attribute("value") == "name"

    element = driver.find_element(By.ID, "id-name2")
    assert element.get_attribute("value") == "id"


def test_should_be_able_to_find_ahidden_elements_by_name(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.NAME, "hidden")
    assert element.get_attribute("name") == "hidden"


def test_should_not_be_able_to_find_an_element_on_a_blank_page(driver, pages):
    driver.get("about:blank")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.TAG_NAME, "a")
