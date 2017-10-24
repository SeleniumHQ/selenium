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

from selenium.common.exceptions import WebDriverException


def testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed(driver, pages):
    pages.load("simpleTest.html")
    head = driver.find_element_by_xpath("/html")
    attribute = head.get_attribute("cheese")
    assert attribute is None


def testShouldReturnNullWhenGettingSrcAttributeOfInvalidImgTag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element_by_id("invalidImgTag")
    img_attr = img.get_attribute("src")
    assert img_attr is None


def testShouldReturnAnAbsoluteUrlWhenGettingSrcAttributeOfAValidImgTag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element_by_id("validImgTag")
    img_attr = img.get_attribute("src")
    assert "icon.gif" in img_attr


def testShouldReturnAnAbsoluteUrlWhenGettingHrefAttributeOfAValidAnchorTag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element_by_id("validAnchorTag")
    img_attr = img.get_attribute("href")
    assert "icon.gif" in img_attr


def testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty(driver, pages):
    pages.load("simpleTest.html")
    body = driver.find_element_by_xpath("//body")
    assert "" == body.get_attribute("style")


def testShouldReturnTheValueOfTheDisabledAttributeAsFalseIfNotSet(driver, pages):
    pages.load("formPage.html")
    inputElement = driver.find_element_by_xpath("//input[@id='working']")
    assert inputElement.get_attribute("disabled") is None
    assert inputElement.is_enabled()

    pElement = driver.find_element_by_id("peas")
    assert pElement.get_attribute("disabled") is None
    assert pElement.is_enabled()


def testShouldReturnTheValueOfTheIndexAttrbuteEvenIfItIsMissing(driver, pages):
    pages.load("formPage.html")
    multiSelect = driver.find_element_by_id("multi")
    options = multiSelect.find_elements_by_tag_name("option")
    assert "1" == options[1].get_attribute("index")


def testShouldIndicateTheElementsThatAreDisabledAreNotis_enabled(driver, pages):
    pages.load("formPage.html")
    inputElement = driver.find_element_by_xpath("//input[@id='notWorking']")
    assert not inputElement.is_enabled()

    inputElement = driver.find_element_by_xpath("//input[@id='working']")
    assert inputElement.is_enabled()


def testElementsShouldBeDisabledIfTheyAreDisabledUsingRandomDisabledStrings(driver, pages):
    pages.load("formPage.html")
    disabledTextElement1 = driver.find_element_by_id("disabledTextElement1")
    assert not disabledTextElement1.is_enabled()

    disabledTextElement2 = driver.find_element_by_id("disabledTextElement2")
    assert not disabledTextElement2.is_enabled()

    disabledSubmitElement = driver.find_element_by_id("disabledSubmitElement")
    assert not disabledSubmitElement.is_enabled()


def testShouldIndicateWhenATextAreaIsDisabled(driver, pages):
    pages.load("formPage.html")
    textArea = driver.find_element_by_xpath("//textarea[@id='notWorkingArea']")
    assert not textArea.is_enabled()


@pytest.mark.xfail_marionette(
    reason='https://bugzilla.mozilla.org/show_bug.cgi?id=1309234')
def testShouldThrowExceptionIfSendingKeysToElementDisabledUsingRandomDisabledStrings(driver, pages):
    pages.load("formPage.html")
    disabledTextElement1 = driver.find_element_by_id("disabledTextElement1")
    with pytest.raises(WebDriverException):
        disabledTextElement1.send_keys("foo")
    assert "" == disabledTextElement1.text

    disabledTextElement2 = driver.find_element_by_id("disabledTextElement2")
    with pytest.raises(WebDriverException):
        disabledTextElement2.send_keys("bar")
    assert "" == disabledTextElement2.text


def testShouldIndicateWhenASelectIsDisabled(driver, pages):
    pages.load("formPage.html")
    enabled = driver.find_element_by_name("selectomatic")
    disabled = driver.find_element_by_name("no-select")

    assert enabled.is_enabled()
    assert not disabled.is_enabled()


def testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element_by_xpath("//input[@id='checky']")
    assert checkbox.get_attribute("checked") is None
    checkbox.click()
    assert "true" == checkbox.get_attribute("checked")


def testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute(driver, pages):
    pages.load("formPage.html")
    neverSelected = driver.find_element_by_id("cheese")
    initiallyNotSelected = driver.find_element_by_id("peas")
    initiallySelected = driver.find_element_by_id("cheese_and_peas")

    assert neverSelected.get_attribute("checked") is None
    assert initiallyNotSelected.get_attribute("checked") is None
    assert "true" == initiallySelected.get_attribute("checked")

    initiallyNotSelected.click()
    assert neverSelected.get_attribute("selected") is None
    assert "true" == initiallyNotSelected.get_attribute("checked")
    assert initiallySelected.get_attribute("checked") is None


def testShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute(driver, pages):
    pages.load("formPage.html")
    selectBox = driver.find_element_by_xpath("//select[@name='selectomatic']")
    options = selectBox.find_elements_by_tag_name("option")
    one = options[0]
    two = options[1]
    assert one.is_selected()
    assert not two.is_selected()
    assert "true" == one.get_attribute("selected")
    assert two.get_attribute("selected") is None


def testShouldReturnValueOfClassAttributeOfAnElement(driver, pages):
    pages.load("xhtmlTest.html")
    heading = driver.find_element_by_xpath("//h1")
    classname = heading.get_attribute("class")
    assert "header" == classname

# Disabled due to issues with Frames
# def testShouldReturnValueOfClassAttributeOfAnElementAfterSwitchingIFrame(driver, pages):
#    pages.load("iframes.html")
#    driver.switch_to.frame("iframe1")
#
#    wallace = driver.find_element_by_xpath("//div[@id='wallace']")
#    classname = wallace.get_attribute("class")
#    assert "gromit" == classname


def testShouldReturnTheContentsOfATextAreaAsItsValue(driver, pages):
    pages.load("formPage.html")
    value = driver.find_element_by_id("withText").get_attribute("value")
    assert "Example text" == value


def testShouldReturnTheContentsOfATextAreaAsItsValueWhenSetToNonNorminalTrue(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element_by_id("withText")
    driver.execute_script("arguments[0].value = 'tRuE'", e)
    value = e.get_attribute("value")
    assert "tRuE" == value


def testShouldTreatReadonlyAsAValue(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_name("readonly")
    readOnlyAttribute = element.get_attribute("readonly")

    textInput = driver.find_element_by_name("x")
    notReadOnly = textInput.get_attribute("readonly")

    assert readOnlyAttribute != notReadOnly


def testShouldGetNumericAtribute(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_id("withText")
    assert "5" == element.get_attribute("rows")


def testCanReturnATextApproximationOfTheStyleAttribute(driver, pages):
    pages.load("javascriptPage.html")
    style = driver.find_element_by_id("red-item").get_attribute("style")
    assert "background-color" in style.lower()


def testShouldCorrectlyReportValueOfColspan(driver, pages):
    pages.load("tables.html")

    th1 = driver.find_element_by_id("th1")
    td2 = driver.find_element_by_id("td2")

    assert "th1" == th1.get_attribute("id")
    assert "3" == th1.get_attribute("colspan")

    assert "td2" == td2.get_attribute("id")
    assert "2" == td2.get_attribute("colspan")


def testCanRetrieveTheCurrentValueOfATextFormField_textInput(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_id("working")
    assert "" == element.get_attribute("value")
    element.send_keys("hello world")
    assert "hello world" == element.get_attribute("value")


def testCanRetrieveTheCurrentValueOfATextFormField_emailInput(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_id("email")
    assert "" == element.get_attribute("value")
    element.send_keys("hello@example.com")
    assert "hello@example.com" == element.get_attribute("value")


def testCanRetrieveTheCurrentValueOfATextFormField_textArea(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_id("emptyTextArea")
    assert "" == element.get_attribute("value")
    element.send_keys("hello world")
    assert "hello world" == element.get_attribute("value")


def testShouldReturnNullForNonPresentBooleanAttributes(driver, pages):
    pages.load("booleanAttributes.html")
    element1 = driver.find_element_by_id("working")
    assert element1.get_attribute("required") is None


@pytest.mark.xfail_ie
def testShouldReturnTrueForPresentBooleanAttributes(driver, pages):
    pages.load("booleanAttributes.html")
    element1 = driver.find_element_by_id("emailRequired")
    assert "true" == element1.get_attribute("required")
    element2 = driver.find_element_by_id("emptyTextAreaRequired")
    assert "true" == element2.get_attribute("required")
    element3 = driver.find_element_by_id("inputRequired")
    assert "true" == element3.get_attribute("required")
    element4 = driver.find_element_by_id("textAreaRequired")
    assert "true" == element4.get_attribute("required")


def tesShouldGetUnicodeCharsFromAttribute(driver, pages):
    pages.load("formPage.html")
    title = driver.find_element_by_id("vsearchGadget").get_attribute("title")
    assert 'Hvad s\xf8ger du?' == title
