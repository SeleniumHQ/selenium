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
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def test_should_click_on_submit_input_elements(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.ID, "submitButton").click()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))


def test_clicking_on_unclickable_elements_does_nothing(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.XPATH, "//body").click()


def test_should_be_able_to_click_image_buttons(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.ID, "imageButton").click()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))


def test_should_submit_input_in_form(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.NAME, "login").submit()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))


def test_should_submit_any_input_element_within_form(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.ID, "checky").submit()
    WebDriverWait(driver, 3).until(EC.title_is("We Arrive Here"))


def test_should_submit_any_element_within_form(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.XPATH, "//form/p").submit()
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))


def test_should_submit_element_with_id_submit(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.ID, "submit").submit()
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))


def test_should_submit_element_with_name_submit(driver, pages):
    pages.load("formPage.html")
    driver.find_element(By.NAME, "submit").submit()
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))


def test_should_not_submit_button_outside_form(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(WebDriverException):
        driver.find_element(By.NAME, "SearchableText").submit()


def test_should_be_able_to_enter_text_into_atext_area_by_setting_its_value(driver, pages):
    pages.load("javascriptPage.html")
    textarea = driver.find_element(By.ID, "keyUpArea")
    cheesey = "Brie and cheddar"
    textarea.send_keys(cheesey)
    assert textarea.get_attribute("value") == cheesey


def test_should_enter_data_into_form_fields(driver, pages):
    pages.load("xhtmlTest.html")
    element = driver.find_element(By.XPATH, "//form[@name='someForm']/input[@id='username']")
    originalValue = element.get_attribute("value")
    assert originalValue == "change"

    element.clear()
    element.send_keys("some text")

    element = driver.find_element(By.XPATH, "//form[@name='someForm']/input[@id='username']")
    newFormValue = element.get_attribute("value")
    assert newFormValue == "some text"


def test_should_be_able_to_select_acheck_box(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element(By.ID, "checky")
    assert checkbox.is_selected() is False
    checkbox.click()
    assert checkbox.is_selected() is True
    checkbox.click()
    assert checkbox.is_selected() is False


def test_should_toggle_the_checked_state_of_acheckbox(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element(By.ID, "checky")
    assert checkbox.is_selected() is False
    checkbox.click()
    assert checkbox.is_selected() is True
    checkbox.click()
    assert checkbox.is_selected() is False


def test_toggling_acheckbox_should_return_its_current_state(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element(By.ID, "checky")
    assert checkbox.is_selected() is False
    checkbox.click()
    assert checkbox.is_selected() is True
    checkbox.click()
    assert checkbox.is_selected() is False


def test_should_be_able_to_select_aradio_button(driver, pages):
    pages.load("formPage.html")
    radioButton = driver.find_element(By.ID, "peas")
    assert radioButton.is_selected() is False
    radioButton.click()
    assert radioButton.is_selected() is True


def test_should_be_able_to_select_aradio_button_by_clicking_on_it(driver, pages):
    pages.load("formPage.html")
    radioButton = driver.find_element(By.ID, "peas")
    assert radioButton.is_selected() is False
    radioButton.click()
    assert radioButton.is_selected() is True


def test_should_return_state_of_radio_buttons_before_interaction(driver, pages):
    pages.load("formPage.html")
    radioButton = driver.find_element(By.ID, "cheese_and_peas")
    assert radioButton.is_selected() is True

    radioButton = driver.find_element(By.ID, "cheese")
    assert radioButton.is_selected() is False


def test_toggling_an_option_should_toggle_options_in_amulti_select(driver, pages):
    pages.load("formPage.html")

    select = driver.find_element(By.NAME, "multi")
    option = select.find_elements(By.TAG_NAME, "option")[0]

    selected = option.is_selected()
    option.click()
    assert not selected == option.is_selected()

    option.click()
    assert selected == option.is_selected()


def test_should_throw_an_exception_when_selecting_an_unselectable_element(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.XPATH, "//title")
    with pytest.raises(WebDriverException):
        element.click()


def test_sending_keyboard_events_should_append_text_in_inputs(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "working")
    element.send_keys("Some")
    value = element.get_attribute("value")
    assert value == "Some"

    element.send_keys(" text")
    value = element.get_attribute("value")
    assert value == "Some text"


def test_should_be_able_to_clear_text_from_input_elements(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "working")
    element.send_keys("Some text")
    value = element.get_attribute("value")
    assert len(value) > 0

    element.clear()
    value = element.get_attribute("value")
    assert len(value) == 0


def test_empty_text_boxes_should_return_an_empty_string_not_null(driver, pages):
    pages.load("formPage.html")
    emptyTextBox = driver.find_element(By.ID, "working")
    assert emptyTextBox.get_attribute("value") == ""

    emptyTextArea = driver.find_element(By.ID, "emptyTextArea")
    assert emptyTextArea.get_attribute("value") == ""


def test_should_be_able_to_clear_text_from_text_areas(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "withText")
    element.send_keys("Some text")
    value = element.get_attribute("value")
    assert len(value) > 0

    element.clear()
    value = element.get_attribute("value")
    assert len(value) == 0


def test_radio_should_not_be_selected_after_selecting_sibling(driver, pages):
    pages.load("formPage.html")
    cheese = driver.find_element(By.ID, "cheese")
    peas = driver.find_element(By.ID, "peas")

    cheese.click()
    assert cheese.is_selected() is True
    assert peas.is_selected() is False

    peas.click()
    assert cheese.is_selected() is False
    assert peas.is_selected() is True
