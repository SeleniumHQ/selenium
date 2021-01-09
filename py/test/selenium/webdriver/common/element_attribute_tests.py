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
from selenium.webdriver.common.by import By


def testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed(driver, pages):
    pages.load("simpleTest.html")
    head = driver.find_element(By.XPATH, "/html")
    attribute = head.get_attribute("cheese")
    assert attribute is None


def testShouldReturnNullWhenGettingSrcAttributeOfInvalidImgTag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element(By.ID, "invalidImgTag")
    img_attr = img.get_attribute("src")
    assert img_attr is None


def testShouldReturnAnAbsoluteUrlWhenGettingSrcAttributeOfAValidImgTag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element(By.ID, "validImgTag")
    img_attr = img.get_attribute("src")
    assert "icon.gif" in img_attr


def testShouldReturnAnAbsoluteUrlWhenGettingHrefAttributeOfAValidAnchorTag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element(By.ID, "validAnchorTag")
    img_attr = img.get_attribute("href")
    assert "icon.gif" in img_attr


def testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty(driver, pages):
    pages.load("simpleTest.html")
    body = driver.find_element(By.XPATH, "//body")
    assert "" == body.get_attribute("style")


def testShouldReturnTheValueOfTheDisabledAttributeAsFalseIfNotSet(driver, pages):
    pages.load("formPage.html")
    inputElement = driver.find_element(By.XPATH, "//input[@id='working']")
    assert inputElement.get_attribute("disabled") is None
    assert inputElement.is_enabled()

    pElement = driver.find_element(By.ID, "peas")
    assert pElement.get_attribute("disabled") is None
    assert pElement.is_enabled()


def testShouldReturnTheValueOfTheIndexAttributeEvenIfItIsMissing(driver, pages):
    pages.load("formPage.html")
    multiSelect = driver.find_element(By.ID, "multi")
    options = multiSelect.find_elements(By.TAG_NAME, "option")
    assert "1" == options[1].get_attribute("index")


def testShouldIndicateTheElementsThatAreDisabledAreNotIs_enabled(driver, pages):
    pages.load("formPage.html")
    inputElement = driver.find_element(By.XPATH, "//input[@id='notWorking']")
    assert not inputElement.is_enabled()

    inputElement = driver.find_element(By.XPATH, "//input[@id='working']")
    assert inputElement.is_enabled()


def testElementsShouldBeDisabledIfTheyAreDisabledUsingRandomDisabledStrings(driver, pages):
    pages.load("formPage.html")
    disabledTextElement1 = driver.find_element(By.ID, "disabledTextElement1")
    assert not disabledTextElement1.is_enabled()

    disabledTextElement2 = driver.find_element(By.ID, "disabledTextElement2")
    assert not disabledTextElement2.is_enabled()

    disabledSubmitElement = driver.find_element(By.ID, "disabledSubmitElement")
    assert not disabledSubmitElement.is_enabled()


def testShouldIndicateWhenATextAreaIsDisabled(driver, pages):
    pages.load("formPage.html")
    textArea = driver.find_element(By.XPATH, "//textarea[@id='notWorkingArea']")
    assert not textArea.is_enabled()


@pytest.mark.xfail_safari
def testShouldThrowExceptionIfSendingKeysToElementDisabledUsingRandomDisabledStrings(driver, pages):
    pages.load("formPage.html")
    disabledTextElement1 = driver.find_element(By.ID, "disabledTextElement1")
    with pytest.raises(WebDriverException):
        disabledTextElement1.send_keys("foo")
    assert "" == disabledTextElement1.text

    disabledTextElement2 = driver.find_element(By.ID, "disabledTextElement2")
    with pytest.raises(WebDriverException):
        disabledTextElement2.send_keys("bar")
    assert "" == disabledTextElement2.text


def testShouldIndicateWhenASelectIsDisabled(driver, pages):
    pages.load("formPage.html")
    enabled = driver.find_element(By.NAME, "selectomatic")
    disabled = driver.find_element(By.NAME, "no-select")

    assert enabled.is_enabled()
    assert not disabled.is_enabled()


def testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element(By.XPATH, "//input[@id='checky']")
    assert checkbox.get_attribute("checked") is None
    checkbox.click()
    assert "true" == checkbox.get_attribute("checked")


def testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute(driver, pages):
    pages.load("formPage.html")
    neverSelected = driver.find_element(By.ID, "cheese")
    initiallyNotSelected = driver.find_element(By.ID, "peas")
    initiallySelected = driver.find_element(By.ID, "cheese_and_peas")

    assert neverSelected.get_attribute("checked") is None
    assert initiallyNotSelected.get_attribute("checked") is None
    assert "true" == initiallySelected.get_attribute("checked")

    initiallyNotSelected.click()
    assert neverSelected.get_attribute("selected") is None
    assert "true" == initiallyNotSelected.get_attribute("checked")
    assert initiallySelected.get_attribute("checked") is None


def testShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute(driver, pages):
    pages.load("formPage.html")
    selectBox = driver.find_element(By.XPATH, "//select[@name='selectomatic']")
    options = selectBox.find_elements(By.TAG_NAME, "option")
    one = options[0]
    two = options[1]
    assert one.is_selected()
    assert not two.is_selected()
    assert "true" == one.get_attribute("selected")
    assert two.get_attribute("selected") is None


def testShouldReturnValueOfClassAttributeOfAnElement(driver, pages):
    pages.load("xhtmlTest.html")
    heading = driver.find_element(By.XPATH, "//h1")
    classname = heading.get_attribute("class")
    assert "header" == classname

# Disabled due to issues with Frames
# def testShouldReturnValueOfClassAttributeOfAnElementAfterSwitchingIFrame(driver, pages):
#    pages.load("iframes.html")
#    driver.switch_to.frame("iframe1")
#
#    wallace = driver.find_element(By.XPATH, "//div[@id='wallace']")
#    classname = wallace.get_attribute("class")
#    assert "gromit" == classname


def testShouldReturnTheContentsOfATextAreaAsItsValue(driver, pages):
    pages.load("formPage.html")
    value = driver.find_element(By.ID, "withText").get_attribute("value")
    assert "Example text" == value


def testShouldReturnTheContentsOfATextAreaAsItsValueWhenSetToNonNorminalTrue(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element(By.ID, "withText")
    driver.execute_script("arguments[0].value = 'tRuE'", e)
    value = e.get_attribute("value")
    assert "tRuE" == value


def testShouldTreatReadonlyAsAValue(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.NAME, "readonly")
    readOnlyAttribute = element.get_attribute("readonly")

    textInput = driver.find_element(By.NAME, "x")
    notReadOnly = textInput.get_attribute("readonly")

    assert readOnlyAttribute != notReadOnly


def testShouldGetNumericAtribute(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "withText")
    assert "5" == element.get_attribute("rows")


def testCanReturnATextApproximationOfTheStyleAttribute(driver, pages):
    pages.load("javascriptPage.html")
    style = driver.find_element(By.ID, "red-item").get_attribute("style")
    assert "background-color" in style.lower()


def testShouldCorrectlyReportValueOfColspan(driver, pages):
    pages.load("tables.html")

    th1 = driver.find_element(By.ID, "th1")
    td2 = driver.find_element(By.ID, "td2")

    assert "th1" == th1.get_attribute("id")
    assert "3" == th1.get_attribute("colspan")

    assert "td2" == td2.get_attribute("id")
    assert "2" == td2.get_attribute("colspan")


def testCanRetrieveTheCurrentValueOfATextFormField_textInput(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "working")
    assert "" == element.get_attribute("value")
    element.send_keys("hello world")
    assert "hello world" == element.get_attribute("value")


def testCanRetrieveTheCurrentValueOfATextFormField_emailInput(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "email")
    assert "" == element.get_attribute("value")
    element.send_keys("hello@example.com")
    assert "hello@example.com" == element.get_attribute("value")


def testCanRetrieveTheCurrentValueOfATextFormField_textArea(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "emptyTextArea")
    assert "" == element.get_attribute("value")
    element.send_keys("hello world")
    assert "hello world" == element.get_attribute("value")


def testShouldReturnNullForNonPresentBooleanAttributes(driver, pages):
    pages.load("booleanAttributes.html")
    element1 = driver.find_element(By.ID, "working")
    assert element1.get_attribute("required") is None


@pytest.mark.xfail_ie
def testShouldReturnTrueForPresentBooleanAttributes(driver, pages):
    pages.load("booleanAttributes.html")
    element1 = driver.find_element(By.ID, "emailRequired")
    assert "true" == element1.get_attribute("required")
    element2 = driver.find_element(By.ID, "emptyTextAreaRequired")
    assert "true" == element2.get_attribute("required")
    element3 = driver.find_element(By.ID, "inputRequired")
    assert "true" == element3.get_attribute("required")
    element4 = driver.find_element(By.ID, "textAreaRequired")
    assert "true" == element4.get_attribute("required")


@pytest.mark.xfail_chrome
@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def testShouldGetUnicodeCharsFromAttribute(driver, pages):
    pages.load("formPage.html")
    title = driver.find_element(By.ID, "vsearchGadget").get_attribute("title")
    assert 'Hvad s\xf8ger du?' == title


@pytest.mark.xfail_chrome
@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def testShouldGetValuesAndNotMissItems(driver, pages):
    pages.load("attributes.html")
    expected = "4b273a33fbbd29013nN93dy4F1A~"
    result = driver.find_element(By.CSS_SELECTOR, "li").get_attribute("value")
    assert expected == result
