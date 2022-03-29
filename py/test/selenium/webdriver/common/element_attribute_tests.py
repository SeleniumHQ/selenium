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


def test_should_return_null_when_getting_the_value_of_an_attribute_that_is_not_listed(driver, pages):
    pages.load("simpleTest.html")
    head = driver.find_element(By.XPATH, "/html")
    attribute = head.get_attribute("cheese")
    assert attribute is None


def test_should_return_null_when_getting_src_attribute_of_invalid_img_tag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element(By.ID, "invalidImgTag")
    img_attr = img.get_attribute("src")
    assert img_attr is None


def test_should_return_an_absolute_url_when_getting_src_attribute_of_avalid_img_tag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element(By.ID, "validImgTag")
    img_attr = img.get_attribute("src")
    assert "icon.gif" in img_attr


def test_should_return_an_absolute_url_when_getting_href_attribute_of_avalid_anchor_tag(driver, pages):
    pages.load("simpleTest.html")
    img = driver.find_element(By.ID, "validAnchorTag")
    img_attr = img.get_attribute("href")
    assert "icon.gif" in img_attr


def test_should_return_empty_attribute_values_when_present_and_the_value_is_actually_empty(driver, pages):
    pages.load("simpleTest.html")
    body = driver.find_element(By.XPATH, "//body")
    assert "" == body.get_attribute("style")


def test_should_return_the_value_of_the_disabled_attribute_as_false_if_not_set(driver, pages):
    pages.load("formPage.html")
    inputElement = driver.find_element(By.XPATH, "//input[@id='working']")
    assert inputElement.get_attribute("disabled") is None
    assert inputElement.is_enabled()

    pElement = driver.find_element(By.ID, "peas")
    assert pElement.get_attribute("disabled") is None
    assert pElement.is_enabled()


def test_should_return_the_value_of_the_index_attribute_even_if_it_is_missing(driver, pages):
    pages.load("formPage.html")
    multiSelect = driver.find_element(By.ID, "multi")
    options = multiSelect.find_elements(By.TAG_NAME, "option")
    assert "1" == options[1].get_attribute("index")


def test_should_indicate_the_elements_that_are_disabled_are_not_is_enabled(driver, pages):
    pages.load("formPage.html")
    inputElement = driver.find_element(By.XPATH, "//input[@id='notWorking']")
    assert not inputElement.is_enabled()

    inputElement = driver.find_element(By.XPATH, "//input[@id='working']")
    assert inputElement.is_enabled()


def test_elements_should_be_disabled_if_they_are_disabled_using_random_disabled_strings(driver, pages):
    pages.load("formPage.html")
    disabledTextElement1 = driver.find_element(By.ID, "disabledTextElement1")
    assert not disabledTextElement1.is_enabled()

    disabledTextElement2 = driver.find_element(By.ID, "disabledTextElement2")
    assert not disabledTextElement2.is_enabled()

    disabledSubmitElement = driver.find_element(By.ID, "disabledSubmitElement")
    assert not disabledSubmitElement.is_enabled()


def test_should_indicate_when_atext_area_is_disabled(driver, pages):
    pages.load("formPage.html")
    textArea = driver.find_element(By.XPATH, "//textarea[@id='notWorkingArea']")
    assert not textArea.is_enabled()


@pytest.mark.xfail_safari
def test_should_throw_exception_if_sending_keys_to_element_disabled_using_random_disabled_strings(driver, pages):
    pages.load("formPage.html")
    disabledTextElement1 = driver.find_element(By.ID, "disabledTextElement1")
    with pytest.raises(WebDriverException):
        disabledTextElement1.send_keys("foo")
    assert "" == disabledTextElement1.text

    disabledTextElement2 = driver.find_element(By.ID, "disabledTextElement2")
    with pytest.raises(WebDriverException):
        disabledTextElement2.send_keys("bar")
    assert "" == disabledTextElement2.text


def test_should_indicate_when_aselect_is_disabled(driver, pages):
    pages.load("formPage.html")
    enabled = driver.find_element(By.NAME, "selectomatic")
    disabled = driver.find_element(By.NAME, "no-select")

    assert enabled.is_enabled()
    assert not disabled.is_enabled()


def test_should_return_the_value_of_checked_for_acheckbox_even_if_it_lacks_that_attribute(driver, pages):
    pages.load("formPage.html")
    checkbox = driver.find_element(By.XPATH, "//input[@id='checky']")
    assert checkbox.get_attribute("checked") is None
    checkbox.click()
    assert "true" == checkbox.get_attribute("checked")


def test_should_return_the_value_of_selected_for_radio_buttons_even_if_they_lack_that_attribute(driver, pages):
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


def test_should_return_the_value_of_selected_for_options_in_selects_even_if_they_lack_that_attribute(driver, pages):
    pages.load("formPage.html")
    selectBox = driver.find_element(By.XPATH, "//select[@name='selectomatic']")
    options = selectBox.find_elements(By.TAG_NAME, "option")
    one = options[0]
    two = options[1]
    assert one.is_selected()
    assert not two.is_selected()
    assert "true" == one.get_attribute("selected")
    assert two.get_attribute("selected") is None


def test_should_return_value_of_class_attribute_of_an_element(driver, pages):
    pages.load("xhtmlTest.html")
    heading = driver.find_element(By.XPATH, "//h1")
    classname = heading.get_attribute("class")
    assert "header" == classname

# Disabled due to issues with Frames
# def test_should_return_value_of_class_attribute_of_an_element_after_switching_iframe(driver, pages):
#    pages.load("iframes.html")
#    driver.switch_to.frame("iframe1")
#
#    wallace = driver.find_element(By.XPATH, "//div[@id='wallace']")
#    classname = wallace.get_attribute("class")
#    assert "gromit" == classname


def test_should_return_the_contents_of_atext_area_as_its_value(driver, pages):
    pages.load("formPage.html")
    value = driver.find_element(By.ID, "withText").get_attribute("value")
    assert "Example text" == value


def test_should_return_the_contents_of_atext_area_as_its_value_when_set_to_non_norminal_true(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element(By.ID, "withText")
    driver.execute_script("arguments[0].value = 'tRuE'", e)
    value = e.get_attribute("value")
    assert "tRuE" == value


def test_should_treat_readonly_as_avalue(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.NAME, "readonly")
    readOnlyAttribute = element.get_attribute("readonly")

    textInput = driver.find_element(By.NAME, "x")
    notReadOnly = textInput.get_attribute("readonly")

    assert readOnlyAttribute != notReadOnly


def test_should_get_numeric_attribute(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "withText")
    assert "5" == element.get_attribute("rows")


def test_can_return_atext_approximation_of_the_style_attribute(driver, pages):
    pages.load("javascriptPage.html")
    style = driver.find_element(By.ID, "red-item").get_attribute("style")
    assert "background-color" in style.lower()


def test_should_correctly_report_value_of_colspan(driver, pages):
    pages.load("tables.html")

    th1 = driver.find_element(By.ID, "th1")
    td2 = driver.find_element(By.ID, "td2")

    assert "th1" == th1.get_attribute("id")
    assert "3" == th1.get_attribute("colspan")

    assert "td2" == td2.get_attribute("id")
    assert "2" == td2.get_attribute("colspan")


def test_can_retrieve_the_current_value_of_atext_form_field_text_input(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "working")
    assert "" == element.get_attribute("value")
    element.send_keys("hello world")
    assert "hello world" == element.get_attribute("value")


def test_can_retrieve_the_current_value_of_atext_form_field_email_input(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "email")
    assert "" == element.get_attribute("value")
    element.send_keys("hello@example.com")
    assert "hello@example.com" == element.get_attribute("value")


def test_can_retrieve_the_current_value_of_atext_form_field_text_area(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "emptyTextArea")
    assert "" == element.get_attribute("value")
    element.send_keys("hello world")
    assert "hello world" == element.get_attribute("value")


def test_should_return_null_for_non_present_boolean_attributes(driver, pages):
    pages.load("booleanAttributes.html")
    element1 = driver.find_element(By.ID, "working")
    assert element1.get_attribute("required") is None


@pytest.mark.xfail_ie
def test_should_return_true_for_present_boolean_attributes(driver, pages):
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
def test_should_get_unicode_chars_from_attribute(driver, pages):
    pages.load("formPage.html")
    title = driver.find_element(By.ID, "vsearchGadget").get_attribute("title")
    assert 'Hvad s\xf8ger du?' == title


@pytest.mark.xfail_chrome
@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_should_get_values_and_not_miss_items(driver, pages):
    pages.load("attributes.html")
    expected = "4b273a33fbbd29013nN93dy4F1A~"
    result = driver.find_element(By.CSS_SELECTOR, "li").get_attribute("value")
    assert expected == result
