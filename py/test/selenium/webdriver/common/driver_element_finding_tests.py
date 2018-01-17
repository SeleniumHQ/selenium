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
    NoSuchElementException,
    WebDriverException)

# By.id positive


def test_Should_Be_Able_To_Find_ASingle_Element_By_Id(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.ID, "linkId")
    assert element.get_attribute("id") == "linkId"


def test_Should_Be_Able_To_Find_ASingle_Element_By_Numeric_Id(driver, pages):
    pages.load("nestedElements.html")
    element = driver.find_element(By.ID, "2")
    assert element.get_attribute("id") == "2"


def test_should_be_able_to_find_an_element_with_css_escape(driver, pages):
    pages.load("idElements.html")
    element = driver.find_element(By.ID, "with.dots")
    assert element.get_attribute("id") == "with.dots"


def test_Should_Be_Able_To_Find_Multiple_Elements_By_Id(driver, pages):
    pages.load("nestedElements.html")
    elements = driver.find_elements(By.ID, "test_id")
    assert len(elements) == 2


def test_Should_Be_Able_To_Find_Multiple_Elements_By_Numeric_Id(driver, pages):
    pages.load("nestedElements.html")
    elements = driver.find_elements(By.ID, "2")
    assert len(elements) == 8

# By.id negative


def test_Should_Not_Be_Able_To_Locate_By_Id_ASingle_Element_That_Does_Not_Exist(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.ID, "non_Existent_Button")


def test_Should_Not_Be_Able_To_Locate_By_Id_Multiple_Elements_That_Do_Not_Exist(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.ID, "non_Existent_Button")
    assert len(elements) == 0


def test_Finding_ASingle_Element_By_Empty_Id_Should_Throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.ID, "")


def test_Finding_Multiple_Elements_By_Empty_Id_Should_Return_Empty_List(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.ID, "")
    assert len(elements) == 0


def test_Finding_ASingle_Element_By_Id_With_Space_Should_Throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.ID, "nonexistent button")


def test_Finding_Multiple_Elements_By_Id_With_Space_Should_Return_Empty_List(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.ID, "nonexistent button")
    assert len(elements) == 0

# By.name positive


def test_Should_Be_Able_To_Find_ASingle_Element_By_Name(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.NAME, "checky")
    assert element.get_attribute("value") == "furrfu"


def test_Should_Be_Able_To_Find_Multiple_Elements_By_Name(driver, pages):
    pages.load("nestedElements.html")
    elements = driver.find_elements(By.NAME, "checky")
    assert len(elements) > 1


def test_Should_Be_Able_To_Find_An_Element_That_Does_Not_Support_The_Name_Property(driver, pages):
    pages.load("nestedElements.html")
    element = driver.find_element(By.NAME, "div1")
    assert element.get_attribute("name") == "div1"

# By.name negative


def test_Should_Not_Be_Able_To_Locate_By_Name_ASingle_Element_That_Does_Not_Exist(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.NAME, "non_Existent_Button")


def test_Should_Not_Be_Able_To_Locate_By_Name_Multiple_Elements_That_Do_Not_Exist(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.NAME, "non_Existent_Button")
    assert len(elements) == 0


def test_Finding_ASingle_Element_By_Empty_Name_Should_Throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.NAME, "")


def test_Finding_Multiple_Elements_By_Empty_Name_Should_Return_Empty_List(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.NAME, "")
    assert len(elements) == 0


def test_Finding_ASingle_Element_By_Name_With_Space_Should_Throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.NAME, "nonexistent button")


def test_Finding_Multiple_Elements_By_Name_With_Space_Should_Return_Empty_List(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.NAME, "nonexistent button")
    assert len(elements) == 0

# By.tag_Name positive


def test_Should_Be_Able_To_Find_ASingle_Element_By_Tag_Name(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.TAG_NAME, "input")
    assert element.tag_name.lower() == "input"


def test_Should_Be_Able_To_Find_Multiple_Elements_By_Tag_Name(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.TAG_NAME, "input")
    assert len(elements) > 1

# By.tag_Name negative


def test_Should_Not_Be_Able_To_Locate_By_Tag_Name_ASingle_Element_That_Does_Not_Exist(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.TAG_NAME, "non_Existent_Button")


def test_Should_Not_Be_Able_To_Locate_By_Tag_Name_Multiple_Elements_That_Do_Not_Exist(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.TAG_NAME, "non_Existent_Button")
    assert len(elements) == 0


def test_Finding_ASingle_Element_By_Empty_Tag_Name_Should_Throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.TAG_NAME, "")


def test_Finding_Multiple_Elements_By_Empty_Tag_Name_Should_Throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.TAG_NAME, "")


def test_Finding_ASingle_Element_By_Tag_Name_With_Space_Should_Throw(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.TAG_NAME, "nonexistent button")


def test_Finding_Multiple_Elements_By_Tag_Name_With_Space_Should_Return_Empty_List(driver, pages):
    pages.load("formPage.html")
    elements = driver.find_elements(By.TAG_NAME, "nonexistent button")
    assert len(elements) == 0

# By.class_Name positive


def test_Should_Be_Able_To_Find_ASingle_Element_By_Class(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "extraDiv")
    assert "Another div starts here." in element.text


def test_Should_Be_Able_To_Find_Multiple_Elements_By_Class_Name(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CLASS_NAME, "nameC")
    assert len(elements) > 1


def test_Should_Find_Element_By_Class_When_It_Is_The_First_Name_Among_Many(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "nameA")
    assert element.text == "An H2 title"


def test_Should_Find_Element_By_Class_When_It_Is_The_Last_Name_Among_Many(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "nameC")
    assert element.text == "An H2 title"


def test_Should_Find_Element_By_Class_When_It_Is_In_The_Middle_Among_Many(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "nameBnoise")
    assert element.text == "An H2 title"


def test_Should_Find_Element_By_Class_When_Its_Name_Is_Surrounded_By_Whitespace(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CLASS_NAME, "spaceAround")
    assert element.text == "Spaced out"


def test_Should_Find_Elements_By_Class_When_Its_Name_Is_Surrounded_By_Whitespace(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CLASS_NAME, "spaceAround")
    assert len(elements) == 1
    assert elements[0].text == "Spaced out"

# By.class_Name negative


def test_Should_Not_Find_Element_By_Class_When_The_Name_Queried_Is_Shorter_Than_Candidate_Name(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CLASS_NAME, "name_B")


def test_Finding_ASingle_Element_By_Empty_Class_Name_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CLASS_NAME, "")


def test_Finding_Multiple_Elements_By_Empty_Class_Name_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_elements(By.CLASS_NAME, "")


def test_Finding_ASingle_Element_By_Compound_Class_Name_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CLASS_NAME, "a b")


def test_Finding_ASingle_Element_By_Invalid_Class_Name_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CLASS_NAME, "!@#$%^&*")


def test_Finding_Multiple_Elements_By_Invalid_Class_Name_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_elements(By.CLASS_NAME, "!@#$%^&*")

# By.xpath positive


def test_Should_Be_Able_To_Find_ASingle_Element_By_XPath(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.XPATH, "//h1")
    assert element.text == "XHTML Might Be The Future"


def test_Should_Be_Able_To_Find_Multiple_Elements_By_XPath(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.XPATH, "//div")
    assert len(elements) == 13


def test_Should_Be_Able_To_Find_Many_Elements_Repeatedly_By_XPath(driver, pages):
    pages.load("xhtmlTest.html")
    xpath = "//node()[contains(@id,'id')]"
    assert len(driver.find_elements(By.XPATH, xpath)) == 3

    xpath = "//node()[contains(@id,'nope')]"
    assert len(driver.find_elements(By.XPATH, xpath)) == 0


def test_Should_Be_Able_To_Identify_Elements_By_Class(driver, pages):
    pages.load("xhtmlTest.html")
    header = driver.find_element(By.XPATH, "//h1[@class='header']")
    assert header.text == "XHTML Might Be The Future"


def test_Should_Be_Able_To_Find_An_Element_By_XPath_With_Multiple_Attributes(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(
        By.XPATH, "//form[@name='optional']/input[@type='submit' and @value='Click!']")
    assert element.tag_name.lower() == "input"
    assert element.get_attribute("value") == "Click!"


def test_Finding_ALink_By_Xpath_Should_Locate_An_Element_With_The_Given_Text(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.XPATH, "//a[text()='click me']")
    assert element.text == "click me"


def test_Finding_ALink_By_Xpath_Using_Contains_Keyword_Should_Work(driver, pages):
    pages.load("nestedElements.html")
    element = driver.find_element(By.XPATH, "//a[contains(.,'hello world')]")
    assert "hello world" in element.text


@pytest.mark.xfail_chrome(raises=InvalidSelectorException)
@pytest.mark.xfail_firefox(raises=InvalidSelectorException)
@pytest.mark.xfail_remote(raises=InvalidSelectorException)
@pytest.mark.xfail_marionette(raises=WebDriverException)
@pytest.mark.xfail_safari(raises=NoSuchElementException)
@pytest.mark.xfail_webkitgtk(raises=InvalidSelectorException)
def test_Should_Be_Able_To_Find_Element_By_XPath_With_Namespace(driver, pages):
    pages.load("svgPage.html")
    element = driver.find_element(By.XPATH, "//svg:svg//svg:text")
    assert element.text == "Test Chart"


def test_Should_Be_Able_To_Find_Element_By_XPath_In_Xml_Document(driver, pages):
    pages.load("simple.xml")
    element = driver.find_element(By.XPATH, "//foo")
    assert "baz" in element.text

# By.xpath negative


def test_Should_Throw_An_Exception_When_There_Is_No_Link_To_Click(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.XPATH, "//a[@id='Not here']")


def test_Should_Throw_InvalidSelectorException_When_XPath_Is_Syntactically_Invalid_In_Driver_Find_Element(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.XPATH, "this][isnot][valid")


def test_Should_Throw_InvalidSelectorException_When_XPath_Is_Syntactically_Invalid_In_Driver_Find_Elements(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.XPATH, "this][isnot][valid")


def test_Should_Throw_InvalidSelectorException_When_XPath_Is_Syntactically_Invalid_In_Element_Find_Element(driver, pages):
    pages.load("formPage.html")
    body = driver.find_element(By.TAG_NAME, "body")
    with pytest.raises(InvalidSelectorException):
        body.find_element(By.XPATH, "this][isnot][valid")


def test_Should_Throw_InvalidSelectorException_When_XPath_Is_Syntactically_Invalid_In_Element_Find_Elements(driver, pages):
    pages.load("formPage.html")
    body = driver.find_element(By.TAG_NAME, "body")
    with pytest.raises(InvalidSelectorException):
        body.find_elements(By.XPATH, "this][isnot][valid")


def test_Should_Throw_InvalidSelectorException_When_XPath_Returns_Wrong_Type_In_Driver_Find_Element(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_element(By.XPATH, "count(//input)")


def test_Should_Throw_InvalidSelectorException_When_XPath_Returns_Wrong_Type_In_Driver_Find_Elements(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(InvalidSelectorException):
        driver.find_elements(By.XPATH, "count(//input)")


def test_Should_Throw_InvalidSelectorException_When_XPath_Returns_Wrong_Type_In_Element_Find_Element(driver, pages):
    pages.load("formPage.html")
    body = driver.find_element(By.TAG_NAME, "body")
    with pytest.raises(InvalidSelectorException):
        body.find_element(By.XPATH, "count(//input)")


def test_Should_Throw_InvalidSelectorException_When_XPath_Returns_Wrong_Type_In_Element_Find_Elements(driver, pages):
    pages.load("formPage.html")
    body = driver.find_element(By.TAG_NAME, "body")
    with pytest.raises(InvalidSelectorException):
        body.find_elements(By.XPATH, "count(//input)")

# By.css_Selector positive


def test_Should_Be_Able_To_Find_ASingle_Element_By_Css_Selector(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CSS_SELECTOR, "div.content")
    assert element.tag_name.lower() == "div"
    assert element.get_attribute("class") == "content"


def test_Should_Be_Able_To_Find_Multiple_Elements_By_Css_Selector(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CSS_SELECTOR, "p")
    assert len(elements) > 1


def test_Should_Be_Able_To_Find_ASingle_Element_By_Compound_Css_Selector(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.CSS_SELECTOR, "div.extraDiv, div.content")
    assert element.tag_name.lower() == "div"
    assert element.get_attribute("class") == "content"


def test_Should_Be_Able_To_Find_Multiple_Elements_By_Compound_Css_Selector(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CSS_SELECTOR, "div.extraDiv, div.content")
    assert len(elements) > 1
    assert elements[0].get_attribute("class") == "content"
    assert elements[1].get_attribute("class") == "extraDiv"


def test_Should_Be_Able_To_Find_An_Element_By_Boolean_Attribute_Using_Css_Selector(driver, pages):
    pages.load("locators_tests/boolean_attribute_selected.html")
    element = driver.find_element(By.CSS_SELECTOR, "option[selected='selected']")
    assert element.get_attribute("value") == "two"


def test_Should_Be_Able_To_Find_An_Element_By_Boolean_Attribute_Using_Short_Css_Selector(driver, pages):
    pages.load("locators_tests/boolean_attribute_selected.html")
    element = driver.find_element(By.CSS_SELECTOR, "option[selected]")
    assert element.get_attribute("value") == "two"


def test_Should_Be_Able_To_Find_An_Element_By_Boolean_Attribute_Using_Short_Css_Selector_On_Html4Page(driver, pages):
    pages.load("locators_tests/boolean_attribute_selected_html4.html")
    element = driver.find_element(By.CSS_SELECTOR, "option[selected]")
    assert element.get_attribute("value") == "two"

# By.css_Selector negative


def test_Should_Not_Find_Element_By_Css_Selector_When_There_Is_No_Such_Element(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CSS_SELECTOR, ".there-is-no-such-class")


def test_Should_Not_Find_Elements_By_Css_Selector_When_There_Is_No_Such_Element(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.CSS_SELECTOR, ".there-is-no-such-class")
    assert len(elements) == 0


def test_Finding_ASingle_Element_By_Empty_Css_Selector_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CSS_SELECTOR, "")


def test_Finding_Multiple_Elements_By_Empty_Css_Selector_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_elements(By.CSS_SELECTOR, "")


def test_Finding_ASingle_Element_By_Invalid_Css_Selector_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.CSS_SELECTOR, "//a/b/c[@id='1']")


def test_Finding_Multiple_Elements_By_Invalid_Css_Selector_Should_Throw(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_elements(By.CSS_SELECTOR, "//a/b/c[@id='1']")

# By.link_Text positive


def test_Should_Be_Able_To_Find_ALink_By_Text(driver, pages):
    pages.load("xhtmlTest.html")
    link = driver.find_element(By.LINK_TEXT, "click me")
    assert link.text == "click me"


def test_Should_Be_Able_To_Find_Multiple_Links_By_Text(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.LINK_TEXT, "click me")
    assert len(elements) == 2


def test_Should_Find_Element_By_Link_Text_Containing_Equals_Sign(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.LINK_TEXT, "Link=equalssign")
    assert element.get_attribute("id") == "linkWithEqualsSign"


def test_Should_Find_Multiple_Elements_By_Link_Text_Containing_Equals_Sign(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.LINK_TEXT, "Link=equalssign")
    assert 1 == len(elements)
    assert elements[0].get_attribute("id") == "linkWithEqualsSign"


def test_finds_By_Link_Text_On_Xhtml_Page(driver, pages):
    pages.load("actualXhtmlPage.xhtml")
    link_Text = "Foo"
    element = driver.find_element(By.LINK_TEXT, link_Text)
    assert element.text == link_Text


def test_Link_With_Formatting_Tags(driver, pages):
    pages.load("simpleTest.html")
    elem = driver.find_element(By.ID, "links")

    res = elem.find_element(By.PARTIAL_LINK_TEXT, "link with formatting tags")
    assert res.text == "link with formatting tags"


def test_Driver_Can_Get_Link_By_Link_Test_Ignoring_Trailing_Whitespace(driver, pages):
    pages.load("simpleTest.html")
    link = driver.find_element(By.LINK_TEXT, "link with trailing space")
    assert link.get_attribute("id") == "linkWithTrailingSpace"
    assert link.text == "link with trailing space"

# By.link_Text negative


def test_Should_Not_Be_Able_To_Locate_By_Link_Text_ASingle_Element_That_Does_Not_Exist(driver, pages):
    pages.load("xhtmlTest.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.LINK_TEXT, "Not here either")


def test_Should_Not_Be_Able_To_Locate_By_Link_Text_Multiple_Elements_That_Do_Not_Exist(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.LINK_TEXT, "Not here either")
    assert len(elements) == 0

# By.partial_Link_Text positive


def test_Should_Be_Able_To_Find_Multiple_Elements_By_Partial_Link_Text(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.PARTIAL_LINK_TEXT, "ick me")
    assert len(elements) == 2


def test_Should_Be_Able_To_Find_ASingle_Element_By_Partial_Link_Text(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.PARTIAL_LINK_TEXT, "anon")
    assert "anon" in element.text


def test_Should_Find_Element_By_Partial_Link_Text_Containing_Equals_Sign(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.PARTIAL_LINK_TEXT, "Link=")
    assert element.get_attribute("id") == "linkWithEqualsSign"


def test_Should_Find_Multiple_Elements_By_Partial_Link_Text_Containing_Equals_Sign(driver, pages):
    pages.load("xhtmlTest.html")
    elements = driver.find_elements(By.PARTIAL_LINK_TEXT, "Link=")
    assert len(elements) == 1
    assert elements[0].get_attribute("id") == "linkWithEqualsSign"

# Misc tests


def test_Driver_Should_Be_Able_To_Find_Elements_After_Loading_More_Than_One_Page_At_ATime(driver, pages):
    pages.load("formPage.html")
    pages.load("xhtmlTest.html")
    link = driver.find_element(By.LINK_TEXT, "click me")
    assert link.text == "click me"

# You don't want to ask why this is here


def test_When_Finding_By_Name_Should_Not_Return_By_Id(driver, pages):
    pages.load("formPage.html")

    element = driver.find_element(By.NAME, "id-name1")
    assert element.get_attribute("value") == "name"

    element = driver.find_element(By.ID, "id-name1")
    assert element.get_attribute("value") == "id"

    element = driver.find_element(By.NAME, "id-name2")
    assert element.get_attribute("value") == "name"

    element = driver.find_element(By.ID, "id-name2")
    assert element.get_attribute("value") == "id"


def test_Should_Be_Able_To_Find_AHidden_Elements_By_Name(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.NAME, "hidden")
    assert element.get_attribute("name") == "hidden"


def test_Should_Not_Be_Able_To_Find_An_Element_On_ABlank_Page(driver, pages):
    driver.get("about:blank")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.TAG_NAME, "a")
