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
from selenium.common.exceptions import (
    InvalidSelectorException,
    NoSuchElementException)


class DriverElementFindingTests(unittest.TestCase):
    # By.id positive

    def test_Should_Be_Able_To_Find_ASingle_Element_By_Id(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.ID, "linkId")
        self.assertEqual(element.get_attribute("id"), "linkId")

    def test_Should_Be_Able_To_Find_ASingle_Element_By_Numeric_Id(self):
        self._load_page("nestedElements")
        element = self.driver.find_element(By.ID, "2")
        self.assertEqual(element.get_attribute("id"), "2")

    def test_should_be_able_to_find_an_element_with_css_escape(self):
        self._load_page("idElements")
        element = self.driver.find_element(By.ID, "with.dots")
        self.assertEqual(element.get_attribute("id"), "with.dots")

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_Id(self):
        self._load_page("nestedElements")
        elements = self.driver.find_elements(By.ID, "test_id")
        self.assertEqual(len(elements), 2)

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_Numeric_Id(self):
        self._load_page("nestedElements")
        elements = self.driver.find_elements(By.ID, "2")
        self.assertEqual(len(elements), 8)

    # By.id negative

    def test_Should_Not_Be_Able_To_Locate_By_Id_ASingle_Element_That_Does_Not_Exist(self):
        self._load_page("formPage")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.ID, "non_Existent_Button")

    def test_Should_Not_Be_Able_To_Locate_By_Id_Multiple_Elements_That_Do_Not_Exist(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.ID, "non_Existent_Button")
        self.assertEqual(len(elements), 0)

    @pytest.mark.ignore_phantomjs
    def test_Finding_ASingle_Element_By_Empty_Id_Should_Throw(self):
        self._load_page("formPage")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.ID, "")

    @pytest.mark.ignore_phantomjs
    def test_Finding_Multiple_Elements_By_Empty_Id_Should_Return_Empty_List(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.ID, "")
        self.assertEqual(len(elements), 0)

    def test_Finding_ASingle_Element_By_Id_With_Space_Should_Throw(self):
        self._load_page("formPage")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.ID, "nonexistent button")

    def test_Finding_Multiple_Elements_By_Id_With_Space_Should_Return_Empty_List(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.ID, "nonexistent button")
        self.assertEqual(len(elements), 0)

    # By.name positive

    def test_Should_Be_Able_To_Find_ASingle_Element_By_Name(self):
        self._load_page("formPage")
        element = self.driver.find_element(By.NAME, "checky")
        self.assertEqual(element.get_attribute("value"), "furrfu")

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_Name(self):
        self._load_page("nestedElements")
        elements = self.driver.find_elements(By.NAME, "checky")
        self.assertGreater(len(elements), 1)

    def test_Should_Be_Able_To_Find_An_Element_That_Does_Not_Support_The_Name_Property(self):
        self._load_page("nestedElements")
        element = self.driver.find_element(By.NAME, "div1")
        self.assertEqual(element.get_attribute("name"), "div1")

    # By.name negative

    def test_Should_Not_Be_Able_To_Locate_By_Name_ASingle_Element_That_Does_Not_Exist(self):
        self._load_page("formPage")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.NAME, "non_Existent_Button")

    def test_Should_Not_Be_Able_To_Locate_By_Name_Multiple_Elements_That_Do_Not_Exist(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.NAME, "non_Existent_Button")
        self.assertEqual(len(elements), 0)

    @pytest.mark.ignore_phantomjs
    def test_Finding_ASingle_Element_By_Empty_Name_Should_Throw(self):
        self._load_page("formPage")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.NAME, "")

    @pytest.mark.ignore_phantomjs
    def test_Finding_Multiple_Elements_By_Empty_Name_Should_Return_Empty_List(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.NAME, "")
        self.assertEqual(len(elements), 0)

    def test_Finding_ASingle_Element_By_Name_With_Space_Should_Throw(self):
        self._load_page("formPage")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.NAME, "nonexistent button")

    def test_Finding_Multiple_Elements_By_Name_With_Space_Should_Return_Empty_List(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.NAME, "nonexistent button")
        self.assertEqual(len(elements), 0)

    # By.tag_Name positive

    def test_Should_Be_Able_To_Find_ASingle_Element_By_Tag_Name(self):
        self._load_page("formPage")
        element = self.driver.find_element(By.TAG_NAME, "input")
        self.assertEqual(element.tag_name.lower(), "input")

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_Tag_Name(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.TAG_NAME, "input")
        self.assertGreater(len(elements), 1)

    # By.tag_Name negative

    def test_Should_Not_Be_Able_To_Locate_By_Tag_Name_ASingle_Element_That_Does_Not_Exist(self):
        self._load_page("formPage")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.TAG_NAME, "non_Existent_Button")

    def test_Should_Not_Be_Able_To_Locate_By_Tag_Name_Multiple_Elements_That_Do_Not_Exist(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.TAG_NAME, "non_Existent_Button")
        self.assertEqual(len(elements), 0)

    @pytest.mark.ignore_phantomjs
    def test_Finding_ASingle_Element_By_Empty_Tag_Name_Should_Throw(self):
        self._load_page("formPage")
        with pytest.raises(InvalidSelectorException):
            self.driver.find_element(By.TAG_NAME, "")

    @pytest.mark.ignore_phantomjs
    def test_Finding_Multiple_Elements_By_Empty_Tag_Name_Should_Return_Empty_List(self):
        self._load_page("formPage")
        with pytest.raises(InvalidSelectorException):
            self.driver.find_elements(By.TAG_NAME, "")

    def test_Finding_ASingle_Element_By_Tag_Name_With_Space_Should_Throw(self):
        self._load_page("formPage")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.TAG_NAME, "nonexistent button")

    def test_Finding_Multiple_Elements_By_Tag_Name_With_Space_Should_Return_Empty_List(self):
        self._load_page("formPage")
        elements = self.driver.find_elements(By.TAG_NAME, "nonexistent button")
        self.assertEqual(len(elements), 0)

    # By.class_Name positive

    def test_Should_Be_Able_To_Find_ASingle_Element_By_Class(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.CLASS_NAME, "extraDiv")
        self.assertTrue("Another div starts here." in element.text)

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_Class_Name(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.CLASS_NAME, "nameC")
        self.assertGreater(len(elements), 1)

    def test_Should_Find_Element_By_Class_When_It_Is_The_First_Name_Among_Many(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.CLASS_NAME, "nameA")
        self.assertEqual(element.text, "An H2 title")

    def test_Should_Find_Element_By_Class_When_It_Is_The_Last_Name_Among_Many(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.CLASS_NAME, "nameC")
        self.assertEqual(element.text, "An H2 title")

    def test_Should_Find_Element_By_Class_When_It_Is_In_The_Middle_Among_Many(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.CLASS_NAME, "nameBnoise")
        self.assertEqual(element.text, "An H2 title")

    def test_Should_Find_Element_By_Class_When_Its_Name_Is_Surrounded_By_Whitespace(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.CLASS_NAME, "spaceAround")
        self.assertEqual(element.text, "Spaced out")

    def test_Should_Find_Elements_By_Class_When_Its_Name_Is_Surrounded_By_Whitespace(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.CLASS_NAME, "spaceAround")
        self.assertEqual(len(elements), 1)
        self.assertEqual(elements[0].text, "Spaced out")

    # By.class_Name negative

    def test_Should_Not_Find_Element_By_Class_When_The_Name_Queried_Is_Shorter_Than_Candidate_Name(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.CLASS_NAME, "name_B")

    @pytest.mark.ignore_phantomjs
    def test_Finding_ASingle_Element_By_Empty_Class_Name_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.CLASS_NAME, "")

    @pytest.mark.ignore_phantomjs
    def test_Finding_Multiple_Elements_By_Empty_Class_Name_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_elements(By.CLASS_NAME, "")

    @pytest.mark.ignore_phantomjs
    def test_Finding_ASingle_Element_By_Compound_Class_Name_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.CLASS_NAME, "a b")

    @pytest.mark.ignore_phantomjs
    def test_Finding_Multiple_Elements_By_Compound_Class_Name_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_elements(By.CLASS_NAME, "a b")

    @pytest.mark.ignore_phantomjs
    def test_Finding_ASingle_Element_By_Invalid_Class_Name_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.CLASS_NAME, "!@#$%^&*")

    @pytest.mark.ignore_phantomjs
    def test_Finding_Multiple_Elements_By_Invalid_Class_Name_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_elements(By.CLASS_NAME, "!@#$%^&*")

    # By.xpath positive

    def test_Should_Be_Able_To_Find_ASingle_Element_By_XPath(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.XPATH, "//h1")
        self.assertEqual(element.text, "XHTML Might Be The Future")

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_XPath(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.XPATH, "//div")
        self.assertEqual(len(elements), 13)

    def test_Should_Be_Able_To_Find_Many_Elements_Repeatedly_By_XPath(self):
        self._load_page("xhtmlTest")
        xpath = "//node()[contains(@id,'id')]"
        self.assertEqual(len(self.driver.find_elements(By.XPATH, xpath)), 3)

        xpath = "//node()[contains(@id,'nope')]"
        self.assertEqual(len(self.driver.find_elements(By.XPATH, xpath)), 0)

    def test_Should_Be_Able_To_Identify_Elements_By_Class(self):
        self._load_page("xhtmlTest")
        header = self.driver.find_element(By.XPATH, "//h1[@class='header']")
        self.assertEqual(header.text, "XHTML Might Be The Future")

    def test_Should_Be_Able_To_Find_An_Element_By_XPath_With_Multiple_Attributes(self):
        self._load_page("formPage")
        element = self.driver.find_element(
            By.XPATH, "//form[@name='optional']/input[@type='submit' and @value='Click!']")
        self.assertEqual(element.tag_name.lower(), "input")
        self.assertEqual(element.get_attribute("value"), "Click!")

    def test_Finding_ALink_By_Xpath_Should_Locate_An_Element_With_The_Given_Text(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.XPATH, "//a[text()='click me']")
        self.assertEqual(element.text, "click me")

    def test_Finding_ALink_By_Xpath_Using_Contains_Keyword_Should_Work(self):
        self._load_page("nestedElements")
        element = self.driver.find_element(By.XPATH, "//a[contains(.,'hello world')]")
        self.assertTrue("hello world" in element.text)

    @pytest.mark.ignore_firefox
    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    def test_Should_Be_Able_To_Find_Element_By_XPath_With_Namespace(self):
        self._load_page("svgPage")
        element = self.driver.find_element(By.XPATH, "//svg:svg//svg:text")
        self.assertEqual(element.text, "Test Chart")

    @pytest.mark.ignore_firefox
    @pytest.mark.ignore_marionette
    @pytest.mark.ignore_phantomjs
    def test_Should_Be_Able_To_Find_Element_By_XPath_In_Xml_Document(self):
        self._load_page("simpleXmlDocument")
        element = self.driver.find_element(By.XPATH, "//foo")
        self.assertEqual(element.text, "baz")

    # By.xpath negative

    def test_Should_Throw_An_Exception_When_There_Is_No_Link_To_Click(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.XPATH, "//a[@id='Not here']")

    def test_Should_Throw_InvalidSelectorException_When_XPath_Is_Syntactically_Invalid_In_Driver_Find_Element(self):
        self._load_page("formPage")
        with pytest.raises(InvalidSelectorException):
            self.driver.find_element(By.XPATH, "this][isnot][valid")

    def test_Should_Throw_InvalidSelectorException_When_XPath_Is_Syntactically_Invalid_In_Driver_Find_Elements(self):
        self._load_page("formPage")
        with pytest.raises(InvalidSelectorException):
            self.driver.find_elements(By.XPATH, "this][isnot][valid")

    def test_Should_Throw_InvalidSelectorException_When_XPath_Is_Syntactically_Invalid_In_Element_Find_Element(self):
        self._load_page("formPage")
        body = self.driver.find_element(By.TAG_NAME, "body")
        with pytest.raises(InvalidSelectorException):
            body.find_element(By.XPATH, "this][isnot][valid")

    def test_Should_Throw_InvalidSelectorException_When_XPath_Is_Syntactically_Invalid_In_Element_Find_Elements(self):
        self._load_page("formPage")
        body = self.driver.find_element(By.TAG_NAME, "body")
        with pytest.raises(InvalidSelectorException):
            body.find_elements(By.XPATH, "this][isnot][valid")

    def test_Should_Throw_InvalidSelectorException_When_XPath_Returns_Wrong_Type_In_Driver_Find_Element(self):
        self._load_page("formPage")
        with pytest.raises(InvalidSelectorException):
            self.driver.find_element(By.XPATH, "count(//input)")

    def test_Should_Throw_InvalidSelectorException_When_XPath_Returns_Wrong_Type_In_Driver_Find_Elements(self):
        self._load_page("formPage")
        with pytest.raises(InvalidSelectorException):
            self.driver.find_elements(By.XPATH, "count(//input)")

    def test_Should_Throw_InvalidSelectorException_When_XPath_Returns_Wrong_Type_In_Element_Find_Element(self):
        self._load_page("formPage")
        body = self.driver.find_element(By.TAG_NAME, "body")
        with pytest.raises(InvalidSelectorException):
            body.find_element(By.XPATH, "count(//input)")

    def test_Should_Throw_InvalidSelectorException_When_XPath_Returns_Wrong_Type_In_Element_Find_Elements(self):
        self._load_page("formPage")
        body = self.driver.find_element(By.TAG_NAME, "body")
        with pytest.raises(InvalidSelectorException):
            body.find_elements(By.XPATH, "count(//input)")

    # By.css_Selector positive

    def test_Should_Be_Able_To_Find_ASingle_Element_By_Css_Selector(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.CSS_SELECTOR, "div.content")
        self.assertEqual(element.tag_name.lower(), "div")
        self.assertEqual(element.get_attribute("class"), "content")

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_Css_Selector(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.CSS_SELECTOR, "p")
        self.assertGreater(len(elements), 1)

    def test_Should_Be_Able_To_Find_ASingle_Element_By_Compound_Css_Selector(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.CSS_SELECTOR, "div.extraDiv, div.content")
        self.assertEqual(element.tag_name.lower(), "div")
        self.assertEqual(element.get_attribute("class"), "content")

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_Compound_Css_Selector(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.CSS_SELECTOR, "div.extraDiv, div.content")
        self.assertGreater(len(elements), 1)
        self.assertEqual(elements[0].get_attribute("class"), "content")
        self.assertEqual(elements[1].get_attribute("class"), "extraDiv")

    def test_Should_Be_Able_To_Find_An_Element_By_Boolean_Attribute_Using_Css_Selector(self):
        self.driver.get(self._page_url("locators_tests/boolean_attribute_selected"))
        element = self.driver.find_element(By.CSS_SELECTOR, "option[selected='selected']")
        self.assertEqual(element.get_attribute("value"), "two")

    def test_Should_Be_Able_To_Find_An_Element_By_Boolean_Attribute_Using_Short_Css_Selector(self):
        self.driver.get(self._page_url("locators_tests/boolean_attribute_selected"))
        element = self.driver.find_element(By.CSS_SELECTOR, "option[selected]")
        self.assertEqual(element.get_attribute("value"), "two")

    def test_Should_Be_Able_To_Find_An_Element_By_Boolean_Attribute_Using_Short_Css_Selector_On_Html4Page(self):
        self.driver.get(self._page_url("locators_tests/boolean_attribute_selected_html4"))
        element = self.driver.find_element(By.CSS_SELECTOR, "option[selected]")
        self.assertEqual(element.get_attribute("value"), "two")

    # By.css_Selector negative

    def test_Should_Not_Find_Element_By_Css_Selector_When_There_Is_No_Such_Element(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.CSS_SELECTOR, ".there-is-no-such-class")

    def test_Should_Not_Find_Elements_By_Css_Selector_When_There_Is_No_Such_Element(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.CSS_SELECTOR, ".there-is-no-such-class")
        self.assertEqual(len(elements), 0)

    @pytest.mark.ignore_phantomjs
    def test_Finding_ASingle_Element_By_Empty_Css_Selector_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.CSS_SELECTOR, "")

    @pytest.mark.ignore_phantomjs
    def test_Finding_Multiple_Elements_By_Empty_Css_Selector_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_elements(By.CSS_SELECTOR, "")

    @pytest.mark.ignore_phantomjs
    def test_Finding_ASingle_Element_By_Invalid_Css_Selector_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.CSS_SELECTOR, "//a/b/c[@id='1']")

    @pytest.mark.ignore_phantomjs
    def test_Finding_Multiple_Elements_By_Invalid_Css_Selector_Should_Throw(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_elements(By.CSS_SELECTOR, "//a/b/c[@id='1']")

    # By.link_Text positive

    def test_Should_Be_Able_To_Find_ALink_By_Text(self):
        self._load_page("xhtmlTest")
        link = self.driver.find_element(By.LINK_TEXT, "click me")
        self.assertEqual(link.text, "click me")

    def test_Should_Be_Able_To_Find_Multiple_Links_By_Text(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.LINK_TEXT, "click me")
        self.assertEqual(len(elements), 2)

    def test_Should_Find_Element_By_Link_Text_Containing_Equals_Sign(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.LINK_TEXT, "Link=equalssign")
        self.assertEqual(element.get_attribute("id"), "linkWithEqualsSign")

    def test_Should_Find_Multiple_Elements_By_Link_Text_Containing_Equals_Sign(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.LINK_TEXT, "Link=equalssign")
        self.assertEquals(1, len(elements))
        self.assertEqual(elements[0].get_attribute("id"), "linkWithEqualsSign")

    def finds_By_Link_Text_On_Xhtml_Page(self):
        self.driver.get(self.webserver.where_is("actualXhtmlPage.xhtml"))
        link_Text = "Foo"
        element = self.driver.find_element(By.LINK_TEXT, link_Text)
        self.assertEqual(element.text, link_Text)

    def test_Link_With_Formatting_Tags(self):
        self._load_page("simpleTest")
        elem = self.driver.find_element(By.ID, "links")

        res = elem.find_element(By.PARTIAL_LINK_TEXT, "link with formatting tags")
        self.assertEqual(res.text, "link with formatting tags")

    def test_Driver_Can_Get_Link_By_Link_Test_Ignoring_Trailing_Whitespace(self):
        self._load_page("simpleTest")
        link = self.driver.find_element(By.LINK_TEXT, "link with trailing space")
        self.assertEqual(link.get_attribute("id"), "linkWithTrailingSpace")
        self.assertEqual(link.text, "link with trailing space")

    # By.link_Text negative

    def test_Should_Not_Be_Able_To_Locate_By_Link_Text_ASingle_Element_That_Does_Not_Exist(self):
        self._load_page("xhtmlTest")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.LINK_TEXT, "Not here either")

    def test_Should_Not_Be_Able_To_Locate_By_Link_Text_Multiple_Elements_That_Do_Not_Exist(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.LINK_TEXT, "Not here either")
        self.assertEqual(len(elements), 0)

    # By.partial_Link_Text positive

    def test_Should_Be_Able_To_Find_Multiple_Elements_By_Partial_Link_Text(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.PARTIAL_LINK_TEXT, "ick me")
        self.assertEqual(len(elements), 2)

    def test_Should_Be_Able_To_Find_ASingle_Element_By_Partial_Link_Text(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.PARTIAL_LINK_TEXT, "anon")
        self.assertTrue("anon" in element.text)

    def test_Should_Find_Element_By_Partial_Link_Text_Containing_Equals_Sign(self):
        self._load_page("xhtmlTest")
        element = self.driver.find_element(By.PARTIAL_LINK_TEXT, "Link=")
        self.assertEqual(element.get_attribute("id"), "linkWithEqualsSign")

    def test_Should_Find_Multiple_Elements_By_Partial_Link_Text_Containing_Equals_Sign(self):
        self._load_page("xhtmlTest")
        elements = self.driver.find_elements(By.PARTIAL_LINK_TEXT, "Link=")
        self.assertEqual(len(elements), 1)
        self.assertEqual(elements[0].get_attribute("id"), "linkWithEqualsSign")

    # Misc tests

    def test_Driver_Should_Be_Able_To_Find_Elements_After_Loading_More_Than_One_Page_At_ATime(self):
        self._load_page("formPage")
        self._load_page("xhtmlTest")
        link = self.driver.find_element(By.LINK_TEXT, "click me")
        self.assertEqual(link.text, "click me")

    # You don't want to ask why this is here

    def test_When_Finding_By_Name_Should_Not_Return_By_Id(self):
        self._load_page("formPage")

        element = self.driver.find_element(By.NAME, "id-name1")
        self.assertEqual(element.get_attribute("value"), "name")

        element = self.driver.find_element(By.ID, "id-name1")
        self.assertEqual(element.get_attribute("value"), "id")

        element = self.driver.find_element(By.NAME, "id-name2")
        self.assertEqual(element.get_attribute("value"), "name")

        element = self.driver.find_element(By.ID, "id-name2")
        self.assertEqual(element.get_attribute("value"), "id")

    def test_Should_Be_Able_To_Find_AHidden_Elements_By_Name(self):
        self._load_page("formPage")
        element = self.driver.find_element(By.NAME, "hidden")
        self.assertEqual(element.get_attribute("name"), "hidden")

    def test_Should_Not_Be_Able_To_Find_An_Element_On_ABlank_Page(self):
        self.driver.get("about:blank")
        with pytest.raises(NoSuchElementException):
            self.driver.find_element(By.TAG_NAME, "a")

    def _page_url(self, name):
        return self.webserver.where_is(name + '.html')

    def _load_simple_page(self):
        self._load_page("simpleTest")

    def _load_page(self, name):
        self.driver.get(self._page_url(name))
