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
import unittest
from selenium.webdriver.common.by import By


class TextHandlingTests(unittest.TestCase):

    newLine = "\n"

    def testShouldReturnTheTextContentOfASingleElementWithNoChildren(self):
        self._loadSimplePage()
        selectText = self.driver.find_element(by=By.ID, value="oneline").text
        self.assertEqual(selectText, "A single line of text")

        getText = self.driver.find_element(by=By.ID, value="oneline").text
        self.assertEqual(getText, "A single line of text")

    def testShouldReturnTheEntireTextContentOfChildElements(self):
        self._loadSimplePage()
        text = self.driver.find_element(by=By.ID, value="multiline").text

        self.assertTrue("A div containing" in text)
        self.assertTrue("More than one line of text" in text)
        self.assertTrue("and block level elements" in text)

    # @Ignore(SELENESE)
    def testShouldIgnoreScriptElements(self):
        self._loadPage("javascriptEnhancedForm")
        labelForUsername = self.driver.find_element(by=By.ID, value="labelforusername")
        text = labelForUsername.text

        self.assertEqual(len(labelForUsername.find_elements(by=By.TAG_NAME, value="script")), 1)
        self.assertTrue("document.getElementById" not in text)
        self.assertEqual(text, "Username:")

    def testShouldRepresentABlockLevelElementAsANewline(self):
        self._loadSimplePage()
        text = self.driver.find_element(by=By.ID, value="multiline").text

        self.assertTrue(text.startswith("A div containing" + self.newLine))
        self.assertTrue("More than one line of text" + self.newLine in text)
        self.assertTrue(text.endswith("and block level elements"))

    def testShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace(self):
        self._loadSimplePage()
        text = self.driver.find_element(by=By.ID, value="lotsofspaces").text

        self.assertEqual(text, "This line has lots of spaces.")

    def testShouldTrimText(self):
        self._loadSimplePage()
        text = self.driver.find_element(by=By.ID, value="multiline").text

        self.assertTrue(text.startswith("A div containing"))
        self.assertTrue(text.endswith("block level elements"))

    def testShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter(self):
        self._loadSimplePage()
        text = self.driver.find_element(by=By.ID, value="nbsp").text

        self.assertEqual(text, "This line has a non-breaking space")

    # @Ignore({IPHONE, SELENESE})
    def testShouldTreatANonBreakingSpaceAsAnyOtherWhitespaceCharacterWhenCollapsingWhitespace(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("only works on chrome >= 16")
        self._loadSimplePage()
        element = self.driver.find_element(by=By.ID, value="nbspandspaces")
        text = element.text

        self.assertEqual(text, "This line has a   non-breaking space and spaces")

    # @Ignore(IPHONE)
    def testHavingInlineElementsShouldNotAffectHowTextIsReturned(self):
        self._loadSimplePage()
        text = self.driver.find_element(by=By.ID, value="inline").text

        self.assertEqual(text, "This line has text within elements that are meant to be displayed inline")

    def testShouldReturnTheEntireTextOfInlineElements(self):
        self._loadSimplePage()
        text = self.driver.find_element(by=By.ID, value="span").text

        self.assertEqual(text, "An inline element")

    # @Ignore(value = {SELENESE, IPHONE, IE}, reason = "iPhone: sendKeys is broken")
    def testShouldBeAbleToSetMoreThanOneLineOfTextInATextArea(self):
        self._loadPage("formPage")
        textarea = self.driver.find_element(by=By.ID, value="withText")
        textarea.clear()

        expectedText = "I like cheese" + self.newLine + self.newLine + "It's really nice"

        textarea.send_keys(expectedText)

        seenText = textarea.get_attribute("value")
        self.assertEqual(seenText, expectedText)

    def testShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst(self):
        self._loadPage("formPage")
        input_ = self.driver.find_element(by=By.ID, value="working")
        expectedValue = "10/03/2007 to 30/07/1993"
        input_.send_keys(expectedValue)
        seenValue = input_.get_attribute("value")

        self.assertEqual(seenValue, expectedValue)

    def testShouldReturnEmptyStringWhenTextIsOnlySpaces(self):
        self._loadPage("xhtmlTest")

        text = self.driver.find_element(by=By.ID, value="spaces").text
        self.assertEqual(text, "")

    def testShouldReturnEmptyStringWhenTextIsEmpty(self):
        self._loadPage("xhtmlTest")

        text = self.driver.find_element(by=By.ID, value="empty").text
        self.assertEqual(text, "")

    def testShouldReturnEmptyStringWhenTagIsSelfClosing(self):
        pytest.skip("Skipping till issue 1225 is fixed")
        self._loadPage("xhtmlTest")

        text = self.driver.find_element(by=By.ID, value="self-closed").text
        self.assertEqual(text, "")

    def testShouldHandleSiblingBlockLevelElements(self):
        self._loadSimplePage()

        text = self.driver.find_element(by=By.ID, value="twoblocks").text

        self.assertEqual(text, "Some text" + self.newLine + "Some more text")

    def testShouldHandleWhitespaceInInlineElements(self):
        self._loadSimplePage()

        text = self.driver.find_element(by=By.ID, value="inlinespan").text

        self.assertEqual(text, "line has text")

    # @Ignore(value = {SELENESE, IPHONE})
    def testReadALargeAmountOfData(self):
        self._loadPage("macbeth")
        source = self.driver.page_source.strip().lower()

        self.assertTrue(source.endswith("</html>"))

    # @Ignore({SELENESE, IPHONE})
    def testShouldOnlyIncludeVisibleText(self):
        self._loadPage("javascriptPage")

        empty = self.driver.find_element(by=By.ID, value="suppressedParagraph").text
        explicit = self.driver.find_element(by=By.ID, value="outer").text

        self.assertEqual("", empty)
        self.assertEqual("sub-element that is explicitly visible", explicit)

    def testShouldGetTextFromTableCells(self):
        self._loadPage("tables")

        tr = self.driver.find_element(by=By.ID, value="hidden_text")
        text = tr.text

        self.assertTrue("some text" in text)
        self.assertFalse("some more text" in text)

    def testShouldGetTextWhichIsAValidJSONObject(self):
        self._loadSimplePage()
        element = self.driver.find_element(by=By.ID, value="simpleJsonText")
        self.assertEqual("{a=\"b\", c=1, d=true}", element.text)
        # self.assertEqual("{a=\"b\", \"c\"=d, e=true, f=\\123\\\\g\\\\\"\"\"\\\'}", element.text)

    def testShouldGetTextWhichIsAValidComplexJSONObject(self):
        self._loadSimplePage()
        element = self.driver.find_element(by=By.ID, value="complexJsonText")
        self.assertEqual("""{a=\"\\\\b\\\\\\\"\'\\\'\"}""", element.text)

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
