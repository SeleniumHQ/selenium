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
from selenium.webdriver.common.keys import Keys


def test_should_fire_key_press_events(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("a")
    result = driver.find_element(by=By.ID, value="result")
    assert "press:" in result.text


def test_should_fire_key_down_events(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("I")
    result = driver.find_element(by=By.ID, value="result")
    assert "down" in result.text


def test_should_fire_key_up_events(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("a")
    result = driver.find_element(by=By.ID, value="result")
    assert "up:" in result.text


def test_should_type_lower_case_letters(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("abc def")
    assert keyReporter.get_attribute("value") == "abc def"


def test_should_be_able_to_type_capital_letters(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("ABC DEF")
    assert keyReporter.get_attribute("value") == "ABC DEF"


def test_should_be_able_to_type_quote_marks(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys('"')
    assert keyReporter.get_attribute("value") == '"'


def test_should_be_able_to_type_the_at_character(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("@")
    assert keyReporter.get_attribute("value") == "@"


def test_should_be_able_to_mix_upper_and_lower_case_letters(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("me@eXample.com")
    assert keyReporter.get_attribute("value") == "me@eXample.com"


def test_arrow_keys_should_not_be_printable(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys(Keys.ARROW_LEFT)
    assert keyReporter.get_attribute("value") == ""


def test_list_of_arrow_keys_should_not_be_printable(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys([Keys.ARROW_LEFT])
    assert keyReporter.get_attribute("value") == ""


def test_should_be_able_to_use_arrow_keys(driver, pages):
    pages.load("javascriptPage.html")
    keyReporter = driver.find_element(by=By.ID, value="keyReporter")
    keyReporter.send_keys("Tet", Keys.ARROW_LEFT, "s")
    assert keyReporter.get_attribute("value") == "Test"


@pytest.mark.xfail_safari
def test_will_simulate_akey_up_when_entering_text_into_input_elements(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyUp")
    element.send_keys("I like cheese")
    result = driver.find_element(by=By.ID, value="result")
    assert result.text == "I like cheese"


@pytest.mark.xfail_safari
def test_will_simulate_akey_down_when_entering_text_into_input_elements(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyDown")
    element.send_keys("I like cheese")
    result = driver.find_element(by=By.ID, value="result")
    #  Because the key down gets the result before the input element is
    #  filled, we're a letter short here
    assert result.text == "I like chees"


@pytest.mark.xfail_safari
def test_will_simulate_akey_press_when_entering_text_into_input_elements(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyPress")
    element.send_keys("I like cheese")
    result = driver.find_element(by=By.ID, value="result")
    #  Because the key down gets the result before the input element is
    #  filled, we're a letter short here
    assert result.text == "I like chees"


@pytest.mark.xfail_safari
def test_will_simulate_akey_up_when_entering_text_into_text_areas(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyUpArea")
    element.send_keys("I like cheese")
    result = driver.find_element(by=By.ID, value="result")
    assert result.text == "I like cheese"


@pytest.mark.xfail_safari
def test_will_simulate_akey_down_when_entering_text_into_text_areas(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyDownArea")
    element.send_keys("I like cheese")
    result = driver.find_element(by=By.ID, value="result")
    #  Because the key down gets the result before the input element is
    #  filled, we're a letter short here
    assert result.text == "I like chees"


@pytest.mark.xfail_safari
def test_will_simulate_akey_press_when_entering_text_into_text_areas(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyPressArea")
    element.send_keys("I like cheese")
    result = driver.find_element(by=By.ID, value="result")
    #  Because the key down gets the result before the input element is
    #  filled, we're a letter short here
    assert result.text == "I like chees"


def test_should_report_key_code_of_arrow_keys_up_down_events(driver, pages):
    pages.load("javascriptPage.html")
    result = driver.find_element(by=By.ID, value="result")
    element = driver.find_element(by=By.ID, value="keyReporter")
    element.send_keys(Keys.ARROW_DOWN)
    assert "down: 40" in result.text.strip()
    assert "up: 40" in result.text.strip()

    element.send_keys(Keys.ARROW_UP)
    assert "down: 38" in result.text.strip()
    assert "up: 38" in result.text.strip()

    element.send_keys(Keys.ARROW_LEFT)
    assert "down: 37" in result.text.strip()
    assert "up: 37" in result.text.strip()

    element.send_keys(Keys.ARROW_RIGHT)
    assert "down: 39" in result.text.strip()
    assert "up: 39" in result.text.strip()

    #  And leave no rubbish/printable keys in the "keyReporter"
    assert element.get_attribute("value") == ""


def test_numeric_non_shift_keys(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyReporter")
    numericLineCharsNonShifted = "`1234567890-=[]\\,.'/42"
    element.send_keys(numericLineCharsNonShifted)
    assert element.get_attribute("value") == numericLineCharsNonShifted


@pytest.mark.xfail_firefox(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
@pytest.mark.xfail_remote(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
def test_numeric_shift_keys(driver, pages):
    pages.load("javascriptPage.html")
    result = driver.find_element(by=By.ID, value="result")
    element = driver.find_element(by=By.ID, value="keyReporter")
    numericShiftsEtc = '~!@#$%^&*()_+{}:i"<>?|END~'
    element.send_keys(numericShiftsEtc)
    assert element.get_attribute("value") == numericShiftsEtc
    assert "up: 16" in result.text.strip()


def test_lower_case_alpha_keys(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyReporter")
    lowerAlphas = "abcdefghijklmnopqrstuvwxyz"
    element.send_keys(lowerAlphas)
    assert element.get_attribute("value") == lowerAlphas


@pytest.mark.xfail_firefox(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
@pytest.mark.xfail_remote(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
def test_uppercase_alpha_keys(driver, pages):
    pages.load("javascriptPage.html")
    result = driver.find_element(by=By.ID, value="result")
    element = driver.find_element(by=By.ID, value="keyReporter")
    upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    element.send_keys(upperAlphas)
    assert element.get_attribute("value") == upperAlphas
    assert "up: 16" in result.text.strip()


@pytest.mark.xfail_firefox(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
@pytest.mark.xfail_remote(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
def test_all_printable_keys(driver, pages):
    pages.load("javascriptPage.html")
    result = driver.find_element(by=By.ID, value="result")
    element = driver.find_element(by=By.ID, value="keyReporter")
    allPrintable = "!\"#$%&'()*+,-./0123456789:<=>?@ ABCDEFGHIJKLMNOPQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
    element.send_keys(allPrintable)

    assert element.get_attribute("value") == allPrintable
    assert "up: 16" in result.text.strip()


def test_arrow_keys_and_page_up_and_down(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyReporter")
    element.send_keys(f"a{Keys.LEFT}b{Keys.RIGHT}{Keys.UP}{Keys.DOWN}{Keys.PAGE_UP}{Keys.PAGE_DOWN}1")
    assert element.get_attribute("value") == "ba1"


# def test_home_and_end_and_page_up_and_page_down_keys(driver, pages):
#  // FIXME: macs don't have HOME keys, would PGUP work?
#  if (Platform.getCurrent().is(Platform.MAC)) {
#    return
#  }

#  pages.load("javascriptPage.html")

#  element = driver.find_element(by=By.ID, value="keyReporter")

#  element.send_keys("abc" + Keys.HOME + "0" + Keys.LEFT + Keys.RIGHT +
#                   Keys.PAGE_UP + Keys.PAGE_DOWN + Keys.END + "1" + Keys.HOME +
#                   "0" + Keys.PAGE_UP + Keys.END + "111" + Keys.HOME + "00")
#  assert element.get_attribute("value") == "0000abc1111"


def test_delete_and_backspace_keys(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyReporter")
    element.send_keys("abcdefghi")
    assert element.get_attribute("value") == "abcdefghi"

    element.send_keys(Keys.LEFT, Keys.LEFT, Keys.DELETE)
    assert element.get_attribute("value") == "abcdefgi"

    element.send_keys(Keys.LEFT, Keys.LEFT, Keys.BACK_SPACE)
    assert element.get_attribute("value") == "abcdfgi"


@pytest.mark.xfail_firefox(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
@pytest.mark.xfail_remote(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
def test_special_space_keys(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyReporter")
    element.send_keys("abcd" + Keys.SPACE + "fgh" + Keys.SPACE + "ij")
    assert element.get_attribute("value") == "abcd fgh ij"


@pytest.mark.xfail_firefox(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
@pytest.mark.xfail_remote(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
@pytest.mark.xfail_safari
def test_numberpad_and_function_keys(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyReporter")
    element.send_keys(
        "abcd{}{}{}{}{}{}{}{}{}{}{}{}abcd".format(
            Keys.MULTIPLY,
            Keys.SUBTRACT,
            Keys.ADD,
            Keys.DECIMAL,
            Keys.SEPARATOR,
            Keys.NUMPAD0,
            Keys.NUMPAD9,
            Keys.ADD,
            Keys.SEMICOLON,
            Keys.EQUALS,
            Keys.DIVIDE,
            Keys.NUMPAD3,
        )
    )
    assert element.get_attribute("value") == "abcd*-+.,09+;=/3abcd"

    element.clear()
    element.send_keys("FUNCTION" + Keys.F2 + "-KEYS" + Keys.F2)
    element.send_keys("" + Keys.F2 + "-TOO" + Keys.F2)
    assert element.get_attribute("value") == "FUNCTION-KEYS-TOO"


@pytest.mark.xfail_safari
def test_shift_selection_deletes(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyReporter")

    element.send_keys("abcd efgh")
    assert element.get_attribute("value") == "abcd efgh"

    element.send_keys(Keys.SHIFT, Keys.LEFT, Keys.LEFT, Keys.LEFT)
    element.send_keys(Keys.DELETE)
    assert element.get_attribute("value") == "abcd e"


def test_should_type_into_input_elements_that_have_no_type_attribute(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(by=By.ID, value="no-type")
    element.send_keys("Should Say Cheese")
    assert element.get_attribute("value") == "Should Say Cheese"


def test_should_type_an_integer(driver, pages):
    pages.load("javascriptPage.html")
    element = driver.find_element(by=By.ID, value="keyReporter")
    element.send_keys(1234)
    assert element.get_attribute("value") == "1234"
