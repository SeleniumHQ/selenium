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

from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def testShouldClickOnSubmitInputElements(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.ID, "submitButton").click()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))


def testClickingOnUnclickableElementsDoesNothing(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.XPATH, "//body").click()


def testShouldBeAbleToClickImageButtons(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.ID, "imageButton").click()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))


def testShouldBeAbleToSubmitForms(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.NAME, "login").submit()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))


def testShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.ID, "checky").submit()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))


def testShouldSubmitAFormWhenAnyElementWithinThatFormIsSubmitted(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.XPATH, "//form/p").submit()
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))


def testShouldNotBeAbleToSubmitAFormThatDoesNotExist(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(NoSuchElementException):
        driver.find_element(By.NAME, "there is no spoon").submit()


def testShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue(driver, pages):
    pages.load("javascriptPage.html")
    textarea = driver.find_element(By.ID, "keyUpArea")
    cheesey = "Brie and cheddar"
    textarea.send_keys(cheesey)
    assert textarea.get_attribute("value") == cheesey


def testShouldEnterDataIntoFormFields(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.XPATH, "//form[@name='someForm']/input[@id='username']")
    originalValue = element.get_attribute("value")
    assert originalValue == "change"

    element.clear()
    element.send_keys("some text")

    element = driver.find_element(By.XPATH, "//form[@name='someForm']/input[@id='username']")
    newFormValue = element.get_attribute("value")
    assert newFormValue == "some text"


def testShouldBeAbleToSelectACheckBox(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element(By.ID, "checky")
    assert checkbox.is_selected() is False
    checkbox.click()
    assert checkbox.is_selected() is True
    checkbox.click()
    assert checkbox.is_selected() is False


def testShouldToggleTheCheckedStateOfACheckbox(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element(By.ID, "checky")
    assert checkbox.is_selected() is False
    checkbox.click()
    assert checkbox.is_selected() is True
    checkbox.click()
    assert checkbox.is_selected() is False


def testTogglingACheckboxShouldReturnItsCurrentState(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element(By.ID, "checky")
    assert checkbox.is_selected() is False
    checkbox.click()
    assert checkbox.is_selected() is True
    checkbox.click()
    assert checkbox.is_selected() is False


def testShouldBeAbleToSelectARadioButton(driver, pages):
    pages.load("formPage.html")
    radioButton = driver.find_element(By.ID, "peas")
    assert radioButton.is_selected() is False
    radioButton.click()
    assert radioButton.is_selected() is True


def testShouldBeAbleToSelectARadioButtonByClickingOnIt(driver, pages):
    pages.load("formPage.html")
    radioButton = driver.find_element(By.ID, "peas")
    assert radioButton.is_selected() is False
    radioButton.click()
    assert radioButton.is_selected() is True


def testShouldReturnStateOfRadioButtonsBeforeInteration(driver, pages):
    pages.load("formPage.html")
    radioButton = driver.find_element(By.ID, "cheese_and_peas")
    assert radioButton.is_selected() is True

    radioButton = driver.find_element(By.ID, "cheese")
    assert radioButton.is_selected() is False


def testTogglingAnOptionShouldToggleOptionsInAMultiSelect(driver, pages):
    pages.load("formPage.html")

    select = driver.find_element(By.NAME, "multi")
    option = select.find_elements(By.TAG_NAME, "option")[0]

    selected = option.is_selected()
    option.click()
    assert not selected == option.is_selected()

    option.click()
    assert selected == option.is_selected()


def testShouldThrowAnExceptionWhenSelectingAnUnselectableElement(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.XPATH, "//title")
    with pytest.raises(WebDriverException):
        element.click()


def testSendingKeyboardEventsShouldAppendTextInInputs(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "working")
    element.send_keys("Some")
    value = element.get_attribute("value")
    assert value == "Some"

    element.send_keys(" text")
    value = element.get_attribute("value")
    assert value == "Some text"


def testShouldBeAbleToClearTextFromInputElements(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "working")
    element.send_keys("Some text")
    value = element.get_attribute("value")
    assert len(value) > 0

    element.clear()
    value = element.get_attribute("value")
    assert len(value) == 0


def testEmptyTextBoxesShouldReturnAnEmptyStringNotNull(driver, pages):
    pages.load("formPage.html")
    emptyTextBox = driver.find_element(By.ID, "working")
    assert emptyTextBox.get_attribute("value") == ""

    emptyTextArea = driver.find_element(By.ID, "emptyTextArea")
    assert emptyTextArea.get_attribute("value") == ""


def testShouldBeAbleToClearTextFromTextAreas(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "withText")
    element.send_keys("Some text")
    value = element.get_attribute("value")
    assert len(value) > 0

    element.clear()
    value = element.get_attribute("value")
    assert len(value) == 0


def testRadioShouldNotBeSelectedAfterSelectingSibling(driver, pages):
    pages.load("formPage.html")
    cheese = driver.find_element(By.ID, "cheese")
    peas = driver.find_element(By.ID, "peas")

    cheese.click()
    assert cheese.is_selected() is True
    assert peas.is_selected() is False

    peas.click()
    assert cheese.is_selected() is False
    assert peas.is_selected() is True
