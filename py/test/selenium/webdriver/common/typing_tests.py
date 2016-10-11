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

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

import pytest


class TestTyping(object):

    def testShouldFireKeyPressEvents(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("a")
        result = driver.find_element(by=By.ID, value="result")
        assert "press:" in result.text

    def testShouldFireKeyDownEvents(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("I")
        result = driver.find_element(by=By.ID, value="result")
        assert "down" in result.text

    def testShouldFireKeyUpEvents(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("a")
        result = driver.find_element(by=By.ID, value="result")
        assert "up:" in result.text

    def testShouldTypeLowerCaseLetters(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("abc def")
        assert keyReporter.get_attribute("value") == "abc def"

    def testShouldBeAbleToTypeCapitalLetters(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("ABC DEF")
        assert keyReporter.get_attribute("value") == "ABC DEF"

    def testShouldBeAbleToTypeQuoteMarks(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("\"")
        assert keyReporter.get_attribute("value") == "\""

    def testShouldBeAbleToTypeTheAtCharacter(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("@")
        assert keyReporter.get_attribute("value") == "@"

    def testShouldBeAbleToMixUpperAndLowerCaseLetters(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("me@eXample.com")
        assert keyReporter.get_attribute("value") == "me@eXample.com"

    def testArrowKeysShouldNotBePrintable(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys(Keys.ARROW_LEFT)
        assert keyReporter.get_attribute("value") == ""

    def testListOfArrowKeysShouldNotBePrintable(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys([Keys.ARROW_LEFT])
        assert keyReporter.get_attribute("value") == ""

    def testShouldBeAbleToUseArrowKeys(self, driver, pages):
        pages.load("javascriptPage.html")
        keyReporter = driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("Tet", Keys.ARROW_LEFT, "s")
        assert keyReporter.get_attribute("value") == "Test"

    def testWillSimulateAKeyUpWhenEnteringTextIntoInputElements(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyUp")
        element.send_keys("I like cheese")
        result = driver.find_element(by=By.ID, value="result")
        assert result.text == "I like cheese"

    def testWillSimulateAKeyDownWhenEnteringTextIntoInputElements(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyDown")
        element.send_keys("I like cheese")
        result = driver.find_element(by=By.ID, value="result")
        #  Because the key down gets the result before the input element is
        #  filled, we're a letter short here
        assert result.text == "I like chees"

    def testWillSimulateAKeyPressWhenEnteringTextIntoInputElements(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyPress")
        element.send_keys("I like cheese")
        result = driver.find_element(by=By.ID, value="result")
        #  Because the key down gets the result before the input element is
        #  filled, we're a letter short here
        assert result.text == "I like chees"

    def testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyUpArea")
        element.send_keys("I like cheese")
        result = driver.find_element(by=By.ID, value="result")
        assert result.text == "I like cheese"

    def testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyDownArea")
        element.send_keys("I like cheese")
        result = driver.find_element(by=By.ID, value="result")
        #  Because the key down gets the result before the input element is
        #  filled, we're a letter short here
        assert result.text == "I like chees"

    def testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyPressArea")
        element.send_keys("I like cheese")
        result = driver.find_element(by=By.ID, value="result")
        #  Because the key down gets the result before the input element is
        #  filled, we're a letter short here
        assert result.text == "I like chees"

    # @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE, ANDROID},
    #      reason = "untested user agents")
    def testShouldReportKeyCodeOfArrowKeysUpDownEvents(self, driver, pages):
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

    def testNumericNonShiftKeys(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyReporter")
        numericLineCharsNonShifted = "`1234567890-=[]\\,.'/42"
        element.send_keys(numericLineCharsNonShifted)
        assert element.get_attribute("value") == numericLineCharsNonShifted

    def testNumericShiftKeys(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c:
            pytest.xfail("Marionette issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
        pages.load("javascriptPage.html")
        result = driver.find_element(by=By.ID, value="result")
        element = driver.find_element(by=By.ID, value="keyReporter")
        numericShiftsEtc = "~!@#$%^&*()_+{}:i\"<>?|END~"
        element.send_keys(numericShiftsEtc)
        assert element.get_attribute("value") == numericShiftsEtc
        assert "up: 16" in result.text.strip()

    def testLowerCaseAlphaKeys(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyReporter")
        lowerAlphas = "abcdefghijklmnopqrstuvwxyz"
        element.send_keys(lowerAlphas)
        assert element.get_attribute("value") == lowerAlphas

    def testUppercaseAlphaKeys(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c:
            pytest.xfail("Marionette issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
        pages.load("javascriptPage.html")
        result = driver.find_element(by=By.ID, value="result")
        element = driver.find_element(by=By.ID, value="keyReporter")
        upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        element.send_keys(upperAlphas)
        assert element.get_attribute("value") == upperAlphas
        assert "up: 16" in result.text.strip()

    def testAllPrintableKeys(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c:
            pytest.xfail("Marionette issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
        pages.load("javascriptPage.html")
        result = driver.find_element(by=By.ID, value="result")
        element = driver.find_element(by=By.ID, value="keyReporter")
        allPrintable = "!\"#$%&'()*+,-./0123456789:<=>?@ ABCDEFGHIJKLMNOPQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
        element.send_keys(allPrintable)

        assert element.get_attribute("value") == allPrintable
        assert "up: 16" in result.text.strip()

    def testArrowKeysAndPageUpAndDown(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys(
            "a" + Keys.LEFT + "b" + Keys.RIGHT +
            Keys.UP + Keys.DOWN + Keys.PAGE_UP + Keys.PAGE_DOWN + "1")
        assert element.get_attribute("value") == "ba1"

    # def testHomeAndEndAndPageUpAndPageDownKeys(self, driver, pages):
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

    # @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE, ANDROID},
    #      reason = "untested user agents")
    def testDeleteAndBackspaceKeys(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys("abcdefghi")
        assert element.get_attribute("value") == "abcdefghi"

        element.send_keys(Keys.LEFT, Keys.LEFT, Keys.DELETE)
        assert element.get_attribute("value") == "abcdefgi"

        element.send_keys(Keys.LEFT, Keys.LEFT, Keys.BACK_SPACE)
        assert element.get_attribute("value") == "abcdfgi"

    # @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
    def testSpecialSpaceKeys(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c:
            pytest.xfail("Marionette issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys("abcd" + Keys.SPACE + "fgh" + Keys.SPACE + "ij")
        assert element.get_attribute("value") == "abcd fgh ij"

    def testNumberpadAndFunctionKeys(self, driver, pages):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c:
            pytest.xfail("Marionette issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1255258")
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys(
            "abcd" + Keys.MULTIPLY + Keys.SUBTRACT + Keys.ADD +
            Keys.DECIMAL + Keys.SEPARATOR + Keys.NUMPAD0 + Keys.NUMPAD9 +
            Keys.ADD + Keys.SEMICOLON + Keys.EQUALS + Keys.DIVIDE +
            Keys.NUMPAD3 + "abcd")
        assert element.get_attribute("value") == "abcd*-+.,09+;=/3abcd"

        element.clear()
        element.send_keys("FUNCTION" + Keys.F2 + "-KEYS" + Keys.F2)
        element.send_keys("" + Keys.F2 + "-TOO" + Keys.F2)
        assert element.get_attribute("value") == "FUNCTION-KEYS-TOO"

    def testShiftSelectionDeletes(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyReporter")

        element.send_keys("abcd efgh")
        assert element.get_attribute("value") == "abcd efgh"

        element.send_keys(Keys.SHIFT, Keys.LEFT, Keys.LEFT, Keys.LEFT)
        element.send_keys(Keys.DELETE)
        assert element.get_attribute("value") == "abcd e"

    def testShouldTypeIntoInputElementsThatHaveNoTypeAttribute(self, driver, pages):
        pages.load("formPage.html")
        element = driver.find_element(by=By.ID, value="no-type")
        element.send_keys("Should Say Cheese")
        assert element.get_attribute("value") == "Should Say Cheese"

    def testShouldTypeAnInteger(self, driver, pages):
        pages.load("javascriptPage.html")
        element = driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys(1234)
        assert element.get_attribute("value") == "1234"
