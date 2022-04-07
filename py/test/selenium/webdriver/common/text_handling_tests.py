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


newLine = "\n"


def test_should_return_the_text_content_of_asingle_element_with_no_children(driver, pages):
    pages.load("simpleTest.html")
    selectText = driver.find_element(by=By.ID, value="oneline").text
    assert selectText == "A single line of text"

    getText = driver.find_element(by=By.ID, value="oneline").text
    assert getText == "A single line of text"


def test_should_return_the_entire_text_content_of_child_elements(driver, pages):
    pages.load("simpleTest.html")
    text = driver.find_element(by=By.ID, value="multiline").text

    assert "A div containing" in text
    assert "More than one line of text" in text
    assert "and block level elements" in text


@pytest.mark.xfail_safari
def test_should_ignore_script_elements(driver, pages):
    pages.load("javascriptEnhancedForm.html")
    labelForUsername = driver.find_element(by=By.ID, value="labelforusername")
    text = labelForUsername.text

    assert len(labelForUsername.find_elements(by=By.TAG_NAME, value="script")) == 1
    assert "document.getElementById" not in text
    assert text == "Username:"


@pytest.mark.xfail_safari
def test_should_represent_ablock_level_element_as_anewline(driver, pages):
    pages.load("simpleTest.html")
    text = driver.find_element(by=By.ID, value="multiline").text

    assert text.startswith("A div containing" + newLine)
    assert "More than one line of text" + newLine in text
    assert text.endswith("and block level elements")


@pytest.mark.xfail_safari
def test_should_collapse_multiple_whitespace_characters_into_asingle_space(driver, pages):
    pages.load("simpleTest.html")
    text = driver.find_element(by=By.ID, value="lotsofspaces").text

    assert text == "This line has lots of spaces."


@pytest.mark.xfail_safari
def test_should_trim_text(driver, pages):
    pages.load("simpleTest.html")
    text = driver.find_element(by=By.ID, value="multiline").text

    assert text.startswith("A div containing")
    assert text.endswith("block level elements")


@pytest.mark.xfail_safari
def test_should_convert_anon_breaking_space_into_anormal_space_character(driver, pages):
    pages.load("simpleTest.html")
    text = driver.find_element(by=By.ID, value="nbsp").text

    assert text == "This line has a non-breaking space"


@pytest.mark.xfail_safari
def test_should_treat_anon_breaking_space_as_any_other_whitespace_character_when_collapsing_whitespace(driver, pages):
    pages.load("simpleTest.html")
    element = driver.find_element(by=By.ID, value="nbspandspaces")
    text = element.text

    assert text == "This line has a   non-breaking space and spaces"


@pytest.mark.xfail_safari
def test_having_inline_elements_should_not_affect_how_text_is_returned(driver, pages):
    pages.load("simpleTest.html")
    text = driver.find_element(by=By.ID, value="inline").text

    assert text == "This line has text within elements that are meant to be displayed inline"


@pytest.mark.xfail_safari
def test_should_return_the_entire_text_of_inline_elements(driver, pages):
    pages.load("simpleTest.html")
    text = driver.find_element(by=By.ID, value="span").text

    assert text == "An inline element"


def test_should_be_able_to_set_more_than_one_line_of_text_in_atext_area(driver, pages):
    pages.load("formPage.html")
    textarea = driver.find_element(by=By.ID, value="withText")
    textarea.clear()

    expectedText = "I like cheese" + newLine + newLine + "It's really nice"

    textarea.send_keys(expectedText)

    seenText = textarea.get_attribute("value")
    assert seenText == expectedText


def test_should_be_able_to_enter_dates_after_filling_in_other_values_first(driver, pages):
    pages.load("formPage.html")
    input_ = driver.find_element(by=By.ID, value="working")
    expectedValue = "10/03/2007 to 30/07/1993"
    input_.send_keys(expectedValue)
    seenValue = input_.get_attribute("value")

    assert seenValue == expectedValue


@pytest.mark.xfail_safari
def test_should_return_empty_string_when_text_is_only_spaces(driver, pages):
    pages.load("xhtmlTest.html")

    text = driver.find_element(by=By.ID, value="spaces").text
    assert text == ""


def test_should_return_empty_string_when_text_is_empty(driver, pages):
    pages.load("xhtmlTest.html")

    text = driver.find_element(by=By.ID, value="empty").text
    assert text == ""


@pytest.mark.xfail
def test_should_return_empty_string_when_tag_is_self_closing(driver, pages):
    pages.load("xhtmlFormPage.xhtml")

    text = driver.find_element(by=By.ID, value="self-closed").text
    assert text == ""


@pytest.mark.xfail_safari
def test_should_handle_sibling_block_level_elements(driver, pages):
    pages.load("simpleTest.html")

    text = driver.find_element(by=By.ID, value="twoblocks").text
    assert text == "Some text" + newLine + "Some more text"


@pytest.mark.xfail_safari
def test_should_handle_whitespace_in_inline_elements(driver, pages):
    pages.load("simpleTest.html")

    text = driver.find_element(by=By.ID, value="inlinespan").text
    assert text == "line has text"


def test_read_alarge_amount_of_data(driver, pages):
    pages.load("macbeth.html")
    source = driver.page_source.strip().lower()

    assert source.endswith("</html>")


@pytest.mark.xfail_safari
def test_should_only_include_visible_text(driver, pages):
    pages.load("javascriptPage.html")

    empty = driver.find_element(by=By.ID, value="suppressedParagraph").text
    explicit = driver.find_element(by=By.ID, value="outer").text

    assert "" == empty
    assert "sub-element that is explicitly visible" == explicit


@pytest.mark.xfail_safari
def test_should_get_text_from_table_cells(driver, pages):
    pages.load("tables.html")

    tr = driver.find_element(by=By.ID, value="hidden_text")
    text = tr.text

    assert "some text" in text
    assert "some more text" not in text


def test_should_get_text_which_is_avalid_jsonobject(driver, pages):
    pages.load("simpleTest.html")
    element = driver.find_element(by=By.ID, value="simpleJsonText")
    assert "{a=\"b\", c=1, d=true}" == element.text
    # assert "{a=\"b\", \"c\"=d, e=true, f=\\123\\\\g\\\\\"\"\"\\\'}", element.text)


def test_should_get_text_which_is_avalid_complex_jsonobject(driver, pages):
    pages.load("simpleTest.html")
    element = driver.find_element(by=By.ID, value="complexJsonText")
    assert """{a=\"\\\\b\\\\\\\"\'\\\'\"}""" == element.text
