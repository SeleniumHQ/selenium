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


def test_should_be_possible_to_deselect_asingle_option_from_aselect_which_allows_multiple_choice(driver, pages):
    pages.load("formPage.html")
    multiSelect = driver.find_element(By.ID, "multi")
    options = multiSelect.find_elements(By.TAG_NAME, "option")

    option = options[0]
    assert option.is_selected() is True
    option.click()
    assert option.is_selected() is False
    option.click()
    assert option.is_selected() is True

    option = options[2]
    assert option.is_selected() is True


def test_should_be_able_to_change_the_selected_option_in_aselec(driver, pages):
    pages.load("formPage.html")
    selectBox = driver.find_element(By.XPATH, "//select[@name='selectomatic']")
    options = selectBox.find_elements(By.TAG_NAME, "option")
    one = options[0]
    two = options[1]
    assert one.is_selected() is True
    assert two.is_selected() is False

    two.click()
    assert one.is_selected() is False
    assert two.is_selected() is True


def test_should_be_able_to_select_more_than_one_option_from_aselect_which_allows_multiple_choice(driver, pages):
    pages.load("formPage.html")

    multiSelect = driver.find_element(By.ID, "multi")
    options = multiSelect.find_elements(By.TAG_NAME, "option")
    for option in options:
        if not option.is_selected():
            option.click()

    for i in range(len(options)):
        option = options[i]
        assert option.is_selected() is True


def test_should_select_first_option_if_none_is_selected(driver, pages):
    pages.load("formPage.html")
    selectBox = driver.find_element(By.XPATH, "//select[@name='select-default']")
    options = selectBox.find_elements(By.TAG_NAME, "option")
    one = options[0]
    two = options[1]
    assert one.is_selected() is True
    assert two.is_selected() is False

    two.click()
    assert one.is_selected() is False
    assert two.is_selected() is True


def test_can_select_elements_in_opt_group(driver, pages):
    pages.load("selectPage.html")
    element = driver.find_element(By.ID, "two-in-group")
    element.click()
    assert element.is_selected() is True


def test_can_get_value_from_option_via_attribute_when_attribute_doesnt_exist(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.CSS_SELECTOR, "select[name='select-default'] option")
    assert element.get_attribute("value") == "One"
    element = driver.find_element(By.ID, "blankOption")
    assert element.get_attribute("value") == ""


def test_can_get_value_from_option_via_attribute_when_attribute_is_empty_string(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "optionEmptyValueSet")
    assert element.get_attribute("value") == ""
