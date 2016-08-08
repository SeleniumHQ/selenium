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


class TestTextHandling(object):

    newLine = "\n"

    def testShouldReturnTheTextContentOfASingleElementWithNoChildren(self, driver, pages):
        pages.load("simpleTest.html")
        selectText = driver.find_element(by=By.ID, value="oneline").text
        assert selectText == "A single line of text"

        getText = driver.find_element(by=By.ID, value="oneline").text
        assert getText == "A single line of text"

    def testShouldReturnTheEntireTextContentOfChildElements(self, driver, pages):
        pages.load("simpleTest.html")
        text = driver.find_element(by=By.ID, value="multiline").text

        assert "A div containing" in text
        assert "More than one line of text" in text
        assert "and block level elements" in text

    # @Ignore(SELENESE)
    def testShouldIgnoreScriptElements(self, driver, pages):
        pages.load("javascriptEnhancedForm.html")
        labelForUsername = driver.find_element(by=By.ID, value="labelforusername")
        text = labelForUsername.text

        assert len(labelForUsername.find_elements(by=By.TAG_NAME, value="script")) == 1
        assert "document.getElementById" not in text
        assert text == "Username:"

    def testShouldRepresentABlockLevelElementAsANewline(self, driver, pages):
        pages.load("simpleTest.html")
        text = driver.find_element(by=By.ID, value="multiline").text

        assert text.startswith("A div containing" + self.newLine)
        assert "More than one line of text" + self.newLine in text
        assert text.endswith("and block level elements")

    def testShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace(self, driver, pages):
        pages.load("simpleTest.html")
        text = driver.find_element(by=By.ID, value="lotsofspaces").text

        assert text == "This line has lots of spaces."

    def testShouldTrimText(self, driver, pages):
        pages.load("simpleTest.html")
        text = driver.find_element(by=By.ID, value="multiline").text

        assert text.startswith("A div containing")
        assert text.endswith("block level elements")

    def testShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter(self, driver, pages):
        pages.load("simpleTest.html")
        text = driver.find_element(by=By.ID, value="nbsp").text

        assert text == "This line has a non-breaking space"

    # @Ignore({IPHONE, SELENESE})
    def testShouldTreatANonBreakingSpaceAsAnyOtherWhitespaceCharacterWhenCollapsingWhitespace(self, driver, pages):
        if driver.capabilities['browserName'] == 'chrome' and int(driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("only works on chrome >= 16")
        pages.load("simpleTest.html")
        element = driver.find_element(by=By.ID, value="nbspandspaces")
        text = element.text

        assert text == "This line has a   non-breaking space and spaces"

    # @Ignore(IPHONE)
    def testHavingInlineElementsShouldNotAffectHowTextIsReturned(self, driver, pages):
        pages.load("simpleTest.html")
        text = driver.find_element(by=By.ID, value="inline").text

        assert text == "This line has text within elements that are meant to be displayed inline"

    def testShouldReturnTheEntireTextOfInlineElements(self, driver, pages):
        pages.load("simpleTest.html")
        text = driver.find_element(by=By.ID, value="span").text

        assert text == "An inline element"

    # @Ignore(value = {SELENESE, IPHONE, IE}, reason = "iPhone: sendKeys is broken")
    def testShouldBeAbleToSetMoreThanOneLineOfTextInATextArea(self, driver, pages):
        pages.load("formPage.html")
        textarea = driver.find_element(by=By.ID, value="withText")
        textarea.clear()

        expectedText = "I like cheese" + self.newLine + self.newLine + "It's really nice"

        textarea.send_keys(expectedText)

        seenText = textarea.get_attribute("value")
        assert seenText == expectedText

    def testShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst(self, driver, pages):
        pages.load("formPage.html")
        input_ = driver.find_element(by=By.ID, value="working")
        expectedValue = "10/03/2007 to 30/07/1993"
        input_.send_keys(expectedValue)
        seenValue = input_.get_attribute("value")

        assert seenValue == expectedValue

    def testShouldReturnEmptyStringWhenTextIsOnlySpaces(self, driver, pages):
        pages.load("xhtmlTest.html")

        text = driver.find_element(by=By.ID, value="spaces").text
        assert text == ""

    def testShouldReturnEmptyStringWhenTextIsEmpty(self, driver, pages):
        pages.load("xhtmlTest.html")

        text = driver.find_element(by=By.ID, value="empty").text
        assert text == ""

    def testShouldReturnEmptyStringWhenTagIsSelfClosing(self, driver, pages):
        pytest.skip("Skipping till issue 1225 is fixed")
        pages.load("xhtmlTest.html")

        text = driver.find_element(by=By.ID, value="self-closed").text
        assert text == ""

    def testShouldHandleSiblingBlockLevelElements(self, driver, pages):
        pages.load("simpleTest.html")

        text = driver.find_element(by=By.ID, value="twoblocks").text
        assert text == "Some text" + self.newLine + "Some more text"

    def testShouldHandleWhitespaceInInlineElements(self, driver, pages):
        pages.load("simpleTest.html")

        text = driver.find_element(by=By.ID, value="inlinespan").text
        assert text == "line has text"

    # @Ignore(value = {SELENESE, IPHONE})
    def testReadALargeAmountOfData(self, driver, pages):
        pages.load("macbeth.html")
        source = driver.page_source.strip().lower()

        assert source.endswith("</html>")

    # @Ignore({SELENESE, IPHONE})
    def testShouldOnlyIncludeVisibleText(self, driver, pages):
        pages.load("javascriptPage.html")

        empty = driver.find_element(by=By.ID, value="suppressedParagraph").text
        explicit = driver.find_element(by=By.ID, value="outer").text

        assert "" == empty
        assert "sub-element that is explicitly visible" == explicit

    def testShouldGetTextFromTableCells(self, driver, pages):
        pages.load("tables.html")

        tr = driver.find_element(by=By.ID, value="hidden_text")
        text = tr.text

        assert "some text" in text
        assert "some more text" not in text

    def testShouldGetTextWhichIsAValidJSONObject(self, driver, pages):
        pages.load("simpleTest.html")
        element = driver.find_element(by=By.ID, value="simpleJsonText")
        assert "{a=\"b\", c=1, d=true}" == element.text
        # assert "{a=\"b\", \"c\"=d, e=true, f=\\123\\\\g\\\\\"\"\"\\\'}", element.text)

    def testShouldGetTextWhichIsAValidComplexJSONObject(self, driver, pages):
        pages.load("simpleTest.html")
        element = driver.find_element(by=By.ID, value="complexJsonText")
        assert """{a=\"\\\\b\\\\\\\"\'\\\'\"}""" == element.text
