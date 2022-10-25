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

import time

import pytest

from selenium.common.exceptions import InvalidElementStateException
from selenium.common.exceptions import InvalidSelectorException
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def throw_sere(driver):
    raise StaleElementReferenceException("test")


def test_should_fail_with_invalid_selector_exception(driver, pages):
    pages.load("dynamic.html")
    with pytest.raises(InvalidSelectorException):
        WebDriverWait(driver, 0.7).until(EC.presence_of_element_located((By.XPATH, "//*[contains(@id,'something'")))


def test_should_explicitly_wait_for_a_single_element(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element(By.ID, "adder")
    add.click()
    WebDriverWait(driver, 3).until(
        EC.presence_of_element_located((By.ID, "box0"))
    )  # All is well if this doesn't throw.


def test_should_still_fail_to_find_an_element_with_explicit_wait(driver, pages):
    pages.load("dynamic.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.presence_of_element_located((By.ID, "box0")))


def test_should_explicitly_wait_until_at_least_one_element_is_found_when_searching_for_many(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element(By.ID, "adder")

    add.click()
    add.click()

    elements = WebDriverWait(driver, 3).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "redbox")))
    assert len(elements) >= 1


def test_should_fail_to_find_elements_when_explicit_waiting(driver, pages):
    pages.load("dynamic.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "redbox")))


def test_should_wait_until_at_least_one_visible_elements_is_found_when_searching_for_many(driver, pages):
    pages.load("hidden_partially.html")
    add_visible = driver.find_element(By.ID, "addVisible")
    add_hidden = driver.find_element(By.ID, "addHidden")

    add_visible.click()
    add_visible.click()
    add_hidden.click()

    class wait_for_two_elements:
        def __init__(self, locator):
            self.locator = locator

        def __call__(self, driver):
            elements = [element for element in driver.find_elements(*self.locator) if EC._element_if_visible(element)]
            return elements if len(elements) == 2 else False

    elements = WebDriverWait(driver, 3).until(wait_for_two_elements((By.CLASS_NAME, "redbox")))
    assert len(elements) == 2


def test_should_fail_to_find_visible_elements_when_explicit_waiting(driver, pages):
    pages.load("hidden_partially.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.visibility_of_any_elements_located((By.CLASS_NAME, "redbox")))


def test_should_wait_until_all_visible_elements_are_found_when_searching_for_many(driver, pages):
    pages.load("hidden_partially.html")
    add_visible = driver.find_element(By.ID, "addVisible")

    add_visible.click()
    add_visible.click()

    elements = WebDriverWait(driver, 3).until(EC.visibility_of_all_elements_located((By.CLASS_NAME, "redbox")))
    assert len(elements) == 2


def test_should_fail_if_not_all_elements_are_visible(driver, pages):
    pages.load("hidden_partially.html")
    add_visible = driver.find_element(By.ID, "addVisible")
    add_hidden = driver.find_element(By.ID, "addHidden")

    add_visible.click()
    add_hidden.click()
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.visibility_of_all_elements_located((By.CLASS_NAME, "redbox")))


def test_should_wait_only_as_long_as_timeout_specified_when_implicit_waits_are_set(driver, pages):
    pages.load("dynamic.html")
    driver.implicitly_wait(0.5)
    start = time.time()
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(EC.presence_of_element_located((By.ID, "box0")))
        assert time.time() - start < 1.5


def test_should_wait_at_least_once(driver, pages):
    pages.load("simpleTest.html")
    elements = WebDriverWait(driver, 0).until(lambda d: d.find_elements(By.TAG_NAME, "h1"))
    assert len(elements) >= 1


def test_wait_until_not_returns_if_evaluates_to_false(driver, pages):
    assert WebDriverWait(driver, 1).until_not(lambda d: False) is False


def test_wait_should_still_fail_if_produce_ignored_exception(driver, pages):
    ignored = (InvalidElementStateException, StaleElementReferenceException)
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1, 0.7, ignored_exceptions=ignored).until(throw_sere)


def test_wait_should_still_fail_if_produce_child_of_ignored_exception(driver, pages):
    ignored = WebDriverException
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1, 0.7, ignored_exceptions=ignored).until(throw_sere)


def test_wait_until_not_should_not_fail_if_produce_ignored_exception(driver, pages):
    ignored = (InvalidElementStateException, StaleElementReferenceException)
    assert WebDriverWait(driver, 1, 0.7, ignored_exceptions=ignored).until_not(throw_sere)


def test_expected_condition_title_is(driver, pages):
    pages.load("blank.html")
    WebDriverWait(driver, 1).until(EC.title_is("blank"))
    driver.execute_script("setTimeout(function(){document.title='not blank'}, 200)")
    WebDriverWait(driver, 2).until(EC.title_is("not blank"))
    assert driver.title == "not blank"
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.title_is("blank"))


def test_expected_condition_title_contains(driver, pages):
    pages.load("blank.html")
    driver.execute_script("setTimeout(function(){document.title='not blank'}, 200)")
    WebDriverWait(driver, 2).until(EC.title_contains("not"))
    assert driver.title == "not blank"
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.title_contains("blanket"))


@pytest.mark.xfail_safari
def test_expected_condition_visibility_of_element_located(driver, pages):
    pages.load("javascriptPage.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.visibility_of_element_located((By.ID, "clickToHide")))
    driver.find_element(By.ID, "clickToShow").click()
    element = WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.ID, "clickToHide")))
    assert element.is_displayed() is True


@pytest.mark.xfail_safari
def test_expected_condition_visibility_of(driver, pages):
    pages.load("javascriptPage.html")
    hidden = driver.find_element(By.ID, "clickToHide")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.visibility_of(hidden))
    driver.find_element(By.ID, "clickToShow").click()
    element = WebDriverWait(driver, 5).until(EC.visibility_of(hidden))
    assert element.is_displayed() is True


def test_expected_condition_text_to_be_present_in_element(driver, pages):
    pages.load("booleanAttributes.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.text_to_be_present_in_element((By.ID, "unwrappable"), "Expected"))
    driver.execute_script(
        "setTimeout(function(){var el = document.getElementById('unwrappable'); el.textContent = el.innerText = 'Unwrappable Expected text'}, 200)"
    )
    WebDriverWait(driver, 2).until(EC.text_to_be_present_in_element((By.ID, "unwrappable"), "Expected"))
    assert "Unwrappable Expected text" == driver.find_element(By.ID, "unwrappable").text


def test_expected_condition_text_to_be_present_in_element_value(driver, pages):
    pages.load("booleanAttributes.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(EC.text_to_be_present_in_element_value((By.ID, "inputRequired"), "Expected"))
    driver.execute_script(
        "setTimeout(function(){document.getElementById('inputRequired').value = 'Example Expected text'}, 200)"
    )
    WebDriverWait(driver, 2).until(EC.text_to_be_present_in_element_value((By.ID, "inputRequired"), "Expected"))
    assert "Example Expected text" == driver.find_element(By.ID, "inputRequired").get_attribute("value")


def test_expected_condition_text_to_be_present_in_element_attribute(driver, pages):
    pages.load("booleanAttributes.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(
            EC.text_to_be_present_in_element_attribute((By.ID, "inputRequired"), "value", "Expected")
        )
    driver.execute_script(
        "setTimeout(function(){document.getElementById('inputRequired').value = 'Example Expected text'}, 200)"
    )
    WebDriverWait(driver, 2).until(
        EC.text_to_be_present_in_element_attribute((By.ID, "inputRequired"), "value", "Expected")
    )
    assert "Example Expected text" == driver.find_element(By.ID, "inputRequired").get_attribute("value")


def test_expected_condition_frame_to_be_available_and_switch_to_it_by_locator(driver, pages):
    pages.load("blank.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(EC.frame_to_be_available_and_switch_to_it((By.ID, "myFrame")))
    driver.execute_script(
        "setTimeout(function(){var f = document.createElement('iframe'); f.id='myFrame'; f.src = '"
        + pages.url("iframeWithAlert.html")
        + "'; document.body.appendChild(f)}, 200)"
    )
    WebDriverWait(driver, 2).until(EC.frame_to_be_available_and_switch_to_it((By.ID, "myFrame")))
    assert "click me" == driver.find_element(By.ID, "alertInFrame").text


def test_expected_condition_invisiblity_of_element(driver, pages):
    pages.load("javascriptPage.html")
    target = driver.find_element(By.ID, "clickToHide")
    driver.execute_script("delayedShowHide(0, true)")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.invisibility_of_element(target))
    driver.execute_script("delayedShowHide(200, false)")
    element = WebDriverWait(driver, 2).until(EC.invisibility_of_element(target))
    assert element.is_displayed() is False
    assert target == element


def test_expected_condition_invisiblity_of_element_located(driver, pages):
    pages.load("javascriptPage.html")
    driver.execute_script("delayedShowHide(0, true)")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.invisibility_of_element_located((By.ID, "clickToHide")))
    driver.execute_script("delayedShowHide(200, false)")
    element = WebDriverWait(driver, 2).until(EC.invisibility_of_element_located((By.ID, "clickToHide")))
    assert element.is_displayed() is False


@pytest.mark.xfail_safari
def test_expected_condition_element_to_be_clickable(driver, pages):
    pages.load("javascriptPage.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_to_be_clickable((By.ID, "clickToHide")))
    driver.execute_script("delayedShowHide(200, true)")
    WebDriverWait(driver, 2).until(EC.element_to_be_clickable((By.ID, "clickToHide")))
    element = driver.find_element(By.ID, "clickToHide")
    element.click()
    WebDriverWait(driver, 4.5).until(EC.invisibility_of_element_located((By.ID, "clickToHide")))
    assert element.is_displayed() is False


def test_expected_condition_staleness_of(driver, pages):
    pages.load("dynamicallyModifiedPage.html")
    element = driver.find_element(By.ID, "element-to-remove")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.staleness_of(element))
    driver.find_element(By.ID, "buttonDelete").click()
    assert "element" == element.text
    WebDriverWait(driver, 2).until(EC.staleness_of(element))
    with pytest.raises(StaleElementReferenceException):
        element.text


def test_expected_condition_element_to_be_selected(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "checky")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_to_be_selected(element))
    driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
    WebDriverWait(driver, 2).until(EC.element_to_be_selected(element))
    assert element.is_selected() is True


def test_expected_condition_element_located_to_be_selected(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "checky")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_located_to_be_selected((By.ID, "checky")))
    driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
    WebDriverWait(driver, 2).until(EC.element_located_to_be_selected((By.ID, "checky")))
    assert element.is_selected() is True


def test_expected_condition_element_selection_state_to_be(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "checky")
    WebDriverWait(driver, 0.7).until(EC.element_selection_state_to_be(element, False))
    assert element.is_selected() is False
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_selection_state_to_be(element, True))
    driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
    WebDriverWait(driver, 2).until(EC.element_selection_state_to_be(element, True))
    assert element.is_selected() is True


def test_expected_condition_element_located_selection_state_to_be(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element(By.ID, "checky")
    WebDriverWait(driver, 0.7).until(EC.element_located_selection_state_to_be((By.ID, "checky"), False))
    assert element.is_selected() is False
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_located_selection_state_to_be((By.ID, "checky"), True))
    driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
    WebDriverWait(driver, 2).until(EC.element_located_selection_state_to_be((By.ID, "checky"), True))
    assert element.is_selected() is True


def test_expected_condition_alert_is_present(driver, pages):
    pages.load("blank.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.alert_is_present())
    driver.execute_script("setTimeout(function(){alert('alerty')}, 200)")
    WebDriverWait(driver, 2).until(EC.alert_is_present())
    alert = driver.switch_to.alert
    assert "alerty" == alert.text
    alert.dismiss()


def test_expected_condition_attribute_to_be_include_in_element(driver, pages):
    pages.load("booleanAttributes.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(EC.element_attribute_to_include((By.ID, "inputRequired"), "test"))
    value = WebDriverWait(driver, 2).until(EC.element_attribute_to_include((By.ID, "inputRequired"), "value"))
    assert value is not None
