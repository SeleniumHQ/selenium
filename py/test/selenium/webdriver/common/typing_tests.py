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
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys


class TypingTests(unittest.TestCase):

    def testShouldFireKeyPressEvents(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("a")
        result = self.driver.find_element(by=By.ID, value="result")
        self.assertTrue("press:" in result.text, "Expected: {0} . Result is {1}".format("press:", result.text))

    def testShouldFireKeyDownEvents(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("I")
        result = self.driver.find_element(by=By.ID, value="result")
        self.assertTrue("down" in result.text, "Expected: {0} . Result is {1}".format("down", result.text))

    def testShouldFireKeyUpEvents(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("a")
        result = self.driver.find_element(by=By.ID, value="result")
        self.assertTrue("up:" in result.text, "Expected: {0} . Result is {1}".format("up:", result.text))

    def testShouldTypeLowerCaseLetters(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("abc def")
        self.assertEqual(keyReporter.get_attribute("value"), "abc def")

    def testShouldBeAbleToTypeCapitalLetters(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("ABC DEF")
        self.assertEqual(keyReporter.get_attribute("value"), "ABC DEF")

    def testShouldBeAbleToTypeQuoteMarks(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("\"")
        self.assertEqual(keyReporter.get_attribute("value"), "\"")

    def testShouldBeAbleToTypeTheAtCharacter(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("@")
        self.assertEqual(keyReporter.get_attribute("value"), "@")

    def testShouldBeAbleToMixUpperAndLowerCaseLetters(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("me@eXample.com")
        self.assertEqual(keyReporter.get_attribute("value"), "me@eXample.com")

    def testArrowKeysShouldNotBePrintable(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys(Keys.ARROW_LEFT)
        self.assertEqual(keyReporter.get_attribute("value"), "")

    def testListOfArrowKeysShouldNotBePrintable(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys([Keys.ARROW_LEFT])
        self.assertEqual(keyReporter.get_attribute("value"), "")

    def testShouldBeAbleToUseArrowKeys(self):
        self._loadPage("javascriptPage")
        keyReporter = self.driver.find_element(by=By.ID, value="keyReporter")
        keyReporter.send_keys("Tet", Keys.ARROW_LEFT, "s")
        self.assertEqual(keyReporter.get_attribute("value"), "Test")

    def testWillSimulateAKeyUpWhenEnteringTextIntoInputElements(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyUp")
        element.send_keys("I like cheese")
        result = self.driver.find_element(by=By.ID, value="result")
        self.assertEqual(result.text, "I like cheese")

    def testWillSimulateAKeyDownWhenEnteringTextIntoInputElements(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyDown")
        element.send_keys("I like cheese")
        result = self.driver.find_element(by=By.ID, value="result")
        #  Because the key down gets the result before the input element is
        #  filled, we're a letter short here
        self.assertEqual(result.text, "I like chees")

    def testWillSimulateAKeyPressWhenEnteringTextIntoInputElements(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyPress")
        element.send_keys("I like cheese")
        result = self.driver.find_element(by=By.ID, value="result")
        #  Because the key down gets the result before the input element is
        #  filled, we're a letter short here
        self.assertEqual(result.text, "I like chees")

    def testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyUpArea")
        element.send_keys("I like cheese")
        result = self.driver.find_element(by=By.ID, value="result")
        self.assertEqual(result.text, "I like cheese")

    def testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyDownArea")
        element.send_keys("I like cheese")
        result = self.driver.find_element(by=By.ID, value="result")
        #  Because the key down gets the result before the input element is
        #  filled, we're a letter short here
        self.assertEqual(result.text, "I like chees")

    def testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyPressArea")
        element.send_keys("I like cheese")
        result = self.driver.find_element(by=By.ID, value="result")
        #  Because the key down gets the result before the input element is
        #  filled, we're a letter short here
        self.assertEqual(result.text, "I like chees")

    # @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE, ANDROID},
    #      reason = "untested user agents")
    def testShouldReportKeyCodeOfArrowKeysUpDownEvents(self):
        self._loadPage("javascriptPage")
        result = self.driver.find_element(by=By.ID, value="result")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys(Keys.ARROW_DOWN)
        self.assertTrue("down: 40" in result.text.strip(), "Expected: {0} . Result is {1}".format("down: 40", result.text))
        self.assertTrue("up: 40" in result.text.strip(), "Expected: {0} . Result is {1}".format("up: 40", result.text))

        element.send_keys(Keys.ARROW_UP)
        self.assertTrue("down: 38" in result.text.strip(), "Expected: {0} . Result is {1}".format("down: 38", result.text))
        self.assertTrue("up: 38" in result.text.strip(), "Expected: {0} . Result is {1}".format("up: 38", result.text))

        element.send_keys(Keys.ARROW_LEFT)
        self.assertTrue("down: 37" in result.text.strip(), "Expected: {0} . Result is {1}".format("down: 37", result.text))
        self.assertTrue("up: 37" in result.text.strip(), "Expected: {0} . Result is {1}".format("up: 37", result.text))

        element.send_keys(Keys.ARROW_RIGHT)
        self.assertTrue("down: 39" in result.text.strip(), "Expected: {0} . Result is {1}".format("down: 39", result.text))
        self.assertTrue("up: 39" in result.text.strip(), "Expected: {0} . Result is {1}".format("up: 39", result.text))

        #  And leave no rubbish/printable keys in the "keyReporter"
        self.assertEqual(element.get_attribute("value"), "")

    def testNumericNonShiftKeys(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        numericLineCharsNonShifted = "`1234567890-=[]\\,.'/42"
        element.send_keys(numericLineCharsNonShifted)
        self.assertEqual(element.get_attribute("value"), numericLineCharsNonShifted)

    # @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE, ANDROID},
    # reason = "untested user agent")
    def testNumericShiftKeys(self):
        self._loadPage("javascriptPage")
        result = self.driver.find_element(by=By.ID, value="result")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        numericShiftsEtc = "~!@#$%^&*()_+{}:i\"<>?|END~"
        element.send_keys(numericShiftsEtc)
        self.assertEqual(element.get_attribute("value"), numericShiftsEtc)
        self.assertTrue("up: 16" in result.text.strip(), "Expected: {0} . Result is {1}".format("up: 16", result.text))

    def testLowerCaseAlphaKeys(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        lowerAlphas = "abcdefghijklmnopqrstuvwxyz"
        element.send_keys(lowerAlphas)
        self.assertEqual(element.get_attribute("value"), lowerAlphas)

    def testUppercaseAlphaKeys(self):
        self._loadPage("javascriptPage")
        result = self.driver.find_element(by=By.ID, value="result")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        element.send_keys(upperAlphas)
        self.assertEqual(element.get_attribute("value"), upperAlphas)
        self.assertTrue("up: 16" in result.text.strip(), "Expected: {0} . Result is {1}".format("up: 16", result.text))

    def testAllPrintableKeys(self):
        self._loadPage("javascriptPage")
        result = self.driver.find_element(by=By.ID, value="result")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        allPrintable = "!\"#$%&'()*+,-./0123456789:<=>?@ ABCDEFGHIJKLMNOPQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
        element.send_keys(allPrintable)

        self.assertTrue(element.get_attribute("value"), allPrintable)
        self.assertTrue("up: 16" in result.text.strip(), "Expected: {0} . Result is {1}".format("up: 16", result.text))

    def testArrowKeysAndPageUpAndDown(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys(
            "a" + Keys.LEFT + "b" + Keys.RIGHT +
            Keys.UP + Keys.DOWN + Keys.PAGE_UP + Keys.PAGE_DOWN + "1")
        self.assertEqual(element.get_attribute("value"), "ba1")

    # def testHomeAndEndAndPageUpAndPageDownKeys(self):
    #  // FIXME: macs don't have HOME keys, would PGUP work?
    #  if (Platform.getCurrent().is(Platform.MAC)) {
    #    return
    #  }

    #  self._loadPage("javascriptPage")

    #  element = self.driver.find_element(by=By.ID, value="keyReporter")

    #  element.send_keys("abc" + Keys.HOME + "0" + Keys.LEFT + Keys.RIGHT +
    #                   Keys.PAGE_UP + Keys.PAGE_DOWN + Keys.END + "1" + Keys.HOME +
    #                   "0" + Keys.PAGE_UP + Keys.END + "111" + Keys.HOME + "00")
    #  self.assertThat(element.get_attribute("value"), is("0000abc1111"))

    # @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE, ANDROID},
    #      reason = "untested user agents")
    def testDeleteAndBackspaceKeys(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys("abcdefghi")
        self.assertEqual(element.get_attribute("value"), "abcdefghi")

        element.send_keys(Keys.LEFT, Keys.LEFT, Keys.DELETE)
        self.assertEqual(element.get_attribute("value"), "abcdefgi")

        element.send_keys(Keys.LEFT, Keys.LEFT, Keys.BACK_SPACE)
        self.assertEqual(element.get_attribute("value"), "abcdfgi")

    # @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
    def testSpecialSpaceKeys(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys("abcd" + Keys.SPACE + "fgh" + Keys.SPACE + "ij")
        self.assertEqual(element.get_attribute("value"), "abcd fgh ij")

    def testNumberpadAndFunctionKeys(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys(
            "abcd" + Keys.MULTIPLY + Keys.SUBTRACT + Keys.ADD +
            Keys.DECIMAL + Keys.SEPARATOR + Keys.NUMPAD0 + Keys.NUMPAD9 +
            Keys.ADD + Keys.SEMICOLON + Keys.EQUALS + Keys.DIVIDE +
            Keys.NUMPAD3 + "abcd")
        self.assertEqual(element.get_attribute("value"), "abcd*-+.,09+;=/3abcd")

        element.clear()
        element.send_keys("FUNCTION" + Keys.F2 + "-KEYS" + Keys.F2)
        element.send_keys("" + Keys.F2 + "-TOO" + Keys.F2)
        self.assertEqual(element.get_attribute("value"), "FUNCTION-KEYS-TOO")

    def testShiftSelectionDeletes(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyReporter")

        element.send_keys("abcd efgh")
        self.assertEqual(element.get_attribute("value"), "abcd efgh")

        element.send_keys(Keys.SHIFT, Keys.LEFT, Keys.LEFT, Keys.LEFT)
        element.send_keys(Keys.DELETE)
        self.assertEqual(element.get_attribute("value"), "abcd e")

    def testShouldTypeIntoInputElementsThatHaveNoTypeAttribute(self):
        self._loadPage("formPage")
        element = self.driver.find_element(by=By.ID, value="no-type")
        element.send_keys("Should Say Cheese")
        self.assertEqual(element.get_attribute("value"), "Should Say Cheese")

    def testShouldTypeAnInteger(self):
        self._loadPage("javascriptPage")
        element = self.driver.find_element(by=By.ID, value="keyReporter")
        element.send_keys(1234)
        self.assertEqual(element.get_attribute("value"), "1234")

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
