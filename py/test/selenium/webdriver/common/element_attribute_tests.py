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


class ElementAttributeTests(unittest.TestCase):

    def testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed(self):
        self._loadSimplePage()
        head = self.driver.find_element_by_xpath("/html")
        attribute = head.get_attribute("cheese")
        self.assertTrue(attribute is None)

    def testShouldReturnNullWhenGettingSrcAttributeOfInvalidImgTag(self):
        self._loadSimplePage()
        img = self.driver.find_element_by_id("invalidImgTag")
        img_attr = img.get_attribute("src")
        self.assertEqual(img_attr, None)

    def testShouldReturnAnAbsoluteUrlWhenGettingSrcAttributeOfAValidImgTag(self):
        self._loadSimplePage()
        img = self.driver.find_element_by_id("validImgTag")
        img_attr = img.get_attribute("src")
        self.assertTrue("icon.gif" in img_attr)

    def testShouldReturnAnAbsoluteUrlWhenGettingHrefAttributeOfAValidAnchorTag(self):
        self._loadSimplePage()
        img = self.driver.find_element_by_id("validAnchorTag")
        img_attr = img.get_attribute("href")
        self.assertTrue("icon.gif" in img_attr)

    def testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty(self):
        self._loadSimplePage()
        body = self.driver.find_element_by_xpath("//body")
        self.assertEqual("", body.get_attribute("style"))

    def testShouldReturnTheValueOfTheDisabledAttributeAsFalseIfNotSet(self):
        self._loadPage("formPage")
        inputElement = self.driver.find_element_by_xpath("//input[@id='working']")
        self.assertEqual(None, inputElement.get_attribute("disabled"))
        self.assertTrue(inputElement.is_enabled())

        pElement = self.driver.find_element_by_id("peas")
        self.assertEqual(None, pElement.get_attribute("disabled"))
        self.assertTrue(pElement.is_enabled())

    def testShouldReturnTheValueOfTheIndexAttrbuteEvenIfItIsMissing(self):
        self._loadPage("formPage")
        multiSelect = self.driver.find_element_by_id("multi")
        options = multiSelect.find_elements_by_tag_name("option")
        self.assertEqual("1", options[1].get_attribute("index"))

    def testShouldIndicateTheElementsThatAreDisabledAreNotis_enabled(self):
        self._loadPage("formPage")
        inputElement = self.driver.find_element_by_xpath("//input[@id='notWorking']")
        self.assertFalse(inputElement.is_enabled())

        inputElement = self.driver.find_element_by_xpath("//input[@id='working']")
        self.assertTrue(inputElement.is_enabled())

    def testElementsShouldBeDisabledIfTheyAreDisabledUsingRandomDisabledStrings(self):
        self._loadPage("formPage")
        disabledTextElement1 = self.driver.find_element_by_id("disabledTextElement1")
        self.assertFalse(disabledTextElement1.is_enabled())

        disabledTextElement2 = self.driver.find_element_by_id("disabledTextElement2")
        self.assertFalse(disabledTextElement2.is_enabled())

        disabledSubmitElement = self.driver.find_element_by_id("disabledSubmitElement")
        self.assertFalse(disabledSubmitElement.is_enabled())

    def testShouldIndicateWhenATextAreaIsDisabled(self):
        self._loadPage("formPage")
        textArea = self.driver.find_element_by_xpath("//textarea[@id='notWorkingArea']")
        self.assertFalse(textArea.is_enabled())

    def testShouldThrowExceptionIfSendingKeysToElementDisabledUsingRandomDisabledStrings(self):
        self._loadPage("formPage")
        disabledTextElement1 = self.driver.find_element_by_id("disabledTextElement1")
        try:
            disabledTextElement1.send_keys("foo")
            self.fail("Should have thrown exception")
        except:
            pass

        self.assertEqual("", disabledTextElement1.text)

        disabledTextElement2 = self.driver.find_element_by_id("disabledTextElement2")
        try:
            disabledTextElement2.send_keys("bar")
            self.fail("Should have thrown exception")
        except:
            pass
        self.assertEqual("", disabledTextElement2.text)

    def testShouldIndicateWhenASelectIsDisabled(self):
        self._loadPage("formPage")
        enabled = self.driver.find_element_by_name("selectomatic")
        disabled = self.driver.find_element_by_name("no-select")

        self.assertTrue(enabled.is_enabled())
        self.assertFalse(disabled.is_enabled())

    def testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute(self):
        self._loadPage("formPage")
        checkbox = self.driver.find_element_by_xpath("//input[@id='checky']")
        self.assertTrue(checkbox.get_attribute("checked") is None)
        checkbox.click()
        self.assertEqual("true", checkbox.get_attribute("checked"))

    def testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute(self):
        self._loadPage("formPage")
        neverSelected = self.driver.find_element_by_id("cheese")
        initiallyNotSelected = self.driver.find_element_by_id("peas")
        initiallySelected = self.driver.find_element_by_id("cheese_and_peas")

        self.assertTrue(neverSelected.get_attribute("checked") is None, )
        self.assertTrue(initiallyNotSelected.get_attribute("checked") is None, )
        self.assertEqual("true", initiallySelected.get_attribute("checked"))

        initiallyNotSelected.click()
        self.assertEqual(neverSelected.get_attribute("selected"), None)
        self.assertEqual("true", initiallyNotSelected.get_attribute("checked"))
        self.assertEqual(initiallySelected.get_attribute("checked"), None)

    def testShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute(self):
        self._loadPage("formPage")
        selectBox = self.driver.find_element_by_xpath("//select[@name='selectomatic']")
        options = selectBox.find_elements_by_tag_name("option")
        one = options[0]
        two = options[1]
        self.assertTrue(one.is_selected())
        self.assertFalse(two.is_selected())
        self.assertEqual("true", one.get_attribute("selected"))
        self.assertEqual(two.get_attribute("selected"), None)

    def testShouldReturnValueOfClassAttributeOfAnElement(self):
        self._loadPage("xhtmlTest")
        heading = self.driver.find_element_by_xpath("//h1")
        classname = heading.get_attribute("class")
        self.assertEqual("header", classname)

    # Disabled due to issues with Frames
    # def testShouldReturnValueOfClassAttributeOfAnElementAfterSwitchingIFrame(self):
    #    self._loadPage("iframes")
    #    self.driver.switch_to.frame("iframe1")
    #
    #    wallace = self.driver.find_element_by_xpath("//div[@id='wallace']")
    #    classname = wallace.get_attribute("class")
    #    self.assertEqual("gromit", classname)

    def testShouldReturnTheContentsOfATextAreaAsItsValue(self):
        self._loadPage("formPage")
        value = self.driver.find_element_by_id("withText").get_attribute("value")
        self.assertEqual("Example text", value)

    def testShouldReturnTheContentsOfATextAreaAsItsValueWhenSetToNonNorminalTrue(self):
        self._loadPage("formPage")
        e = self.driver.find_element_by_id("withText")
        self.driver.execute_script("arguments[0].value = 'tRuE'", e)
        value = e.get_attribute("value")
        self.assertEqual("tRuE", value)

    def testShouldTreatReadonlyAsAValue(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_name("readonly")
        readOnlyAttribute = element.get_attribute("readonly")

        textInput = self.driver.find_element_by_name("x")
        notReadOnly = textInput.get_attribute("readonly")

        self.assertNotEqual(readOnlyAttribute, notReadOnly)

    def testShouldGetNumericAtribute(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_id("withText")
        self.assertEqual("5", element.get_attribute("rows"))

    def testCanReturnATextApproximationOfTheStyleAttribute(self):
        self._loadPage("javascriptPage")
        style = self.driver.find_element_by_id("red-item").get_attribute("style")
        self.assertTrue("background-color" in style.lower())

    def testShouldCorrectlyReportValueOfColspan(self):
        self._loadPage("tables")

        th1 = self.driver.find_element_by_id("th1")
        td2 = self.driver.find_element_by_id("td2")

        self.assertEqual("th1", th1.get_attribute("id"))
        self.assertEqual("3", th1.get_attribute("colspan"))

        self.assertEqual("td2", td2.get_attribute("id"))
        self.assertEquals("2", td2.get_attribute("colspan"))

    def testCanRetrieveTheCurrentValueOfATextFormField_textInput(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_id("working")
        self.assertEqual("", element.get_attribute("value"))
        element.send_keys("hello world")
        self.assertEqual("hello world", element.get_attribute("value"))

    def testCanRetrieveTheCurrentValueOfATextFormField_emailInput(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_id("email")
        self.assertEqual("", element.get_attribute("value"))
        element.send_keys("hello@example.com")
        self.assertEqual("hello@example.com", element.get_attribute("value"))

    def testCanRetrieveTheCurrentValueOfATextFormField_textArea(self):
        self._loadPage("formPage")
        element = self.driver.find_element_by_id("emptyTextArea")
        self.assertEqual("", element.get_attribute("value"))
        element.send_keys("hello world")
        self.assertEqual("hello world", element.get_attribute("value"))

    @pytest.mark.ignore_chrome
    def testShouldReturnNullForNonPresentBooleanAttributes(self):
        self._loadPage("booleanAttributes")
        element1 = self.driver.find_element_by_id("working")
        self.assertEqual(None, element1.get_attribute("required"))

    @pytest.mark.ignore_ie
    def testShouldReturnTrueForPresentBooleanAttributes(self):
        self._loadPage("booleanAttributes")
        element1 = self.driver.find_element_by_id("emailRequired")
        self.assertEqual("true", element1.get_attribute("required"))
        element2 = self.driver.find_element_by_id("emptyTextAreaRequired")
        self.assertEqual("true", element2.get_attribute("required"))
        element3 = self.driver.find_element_by_id("inputRequired")
        self.assertEqual("true", element3.get_attribute("required"))
        element4 = self.driver.find_element_by_id("textAreaRequired")
        self.assertEqual("true", element4.get_attribute("required"))

    def tesShouldGetUnicodeCharsFromAttribute(self):
        self._loadPage("formPage")
        title = self.driver.find_element_by_id("vsearchGadget").get_attribute("title")
        self.assertEqual('Hvad s\xf8ger du?', title)

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
