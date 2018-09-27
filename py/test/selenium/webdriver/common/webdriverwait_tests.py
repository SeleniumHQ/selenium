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

from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import WebDriverException
from selenium.common.exceptions import InvalidElementStateException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def throwSERE(driver):
    raise StaleElementReferenceException("test")


def testShouldExplicitlyWaitForASingleElement(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element_by_id("adder")
    add.click()
    WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "box0")))  # All is well if this doesn't throw.


def testShouldStillFailToFindAnElementWithExplicitWait(driver, pages):
    pages.load("dynamic.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.presence_of_element_located((By.ID, "box0")))


def testShouldExplicitlyWaituntilAtLeastOneElementIsFoundWhenSearchingForMany(driver, pages):
    pages.load("dynamic.html")
    add = driver.find_element_by_id("adder")

    add.click()
    add.click()

    elements = WebDriverWait(driver, 2).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "redbox")))
    assert len(elements) >= 1


def testShouldFailToFindElementsWhenExplicitWaiting(driver, pages):
    pages.load("dynamic.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "redbox")))


def testShouldWaitUntilAtLeastOneVisibleElementsIsFoundWhenSearchingForMany(driver, pages):
    pages.load("hidden_partially.html")
    add_visible = driver.find_element_by_id("addVisible")
    add_hidden = driver.find_element_by_id("addHidden")

    add_visible.click()
    add_visible.click()
    add_hidden.click()

    class wait_for_two_elements(object):

        def __init__(self, locator):
            self.locator = locator

        def __call__(self, driver):
            elements = [element for element in EC._find_elements(driver, self.locator) if EC._element_if_visible(element)]
            return elements if len(elements) == 2 else False

    elements = WebDriverWait(driver, 2).until(wait_for_two_elements((By.CLASS_NAME, "redbox")))
    assert len(elements) == 2


def testShouldFailToFindVisibleElementsWhenExplicitWaiting(driver, pages):
    pages.load("hidden_partially.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.visibility_of_any_elements_located((By.CLASS_NAME, "redbox")))


def testShouldWaitUntilAllVisibleElementsAreFoundWhenSearchingForMany(driver, pages):
    pages.load("hidden_partially.html")
    add_visible = driver.find_element_by_id("addVisible")

    add_visible.click()
    add_visible.click()

    elements = WebDriverWait(driver, 2).until(EC.visibility_of_all_elements_located((By.CLASS_NAME, "redbox")))
    assert len(elements) == 2


def testShouldFailIfNotAllElementsAreVisible(driver, pages):
    pages.load("hidden_partially.html")
    add_visible = driver.find_element_by_id("addVisible")
    add_hidden = driver.find_element_by_id("addHidden")

    add_visible.click()
    add_hidden.click()
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.visibility_of_all_elements_located((By.CLASS_NAME, "redbox")))


def testShouldWaitOnlyAsLongAsTimeoutSpecifiedWhenImplicitWaitsAreSet(driver, pages):
    pages.load("dynamic.html")
    driver.implicitly_wait(0.5)
    start = time.time()
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(EC.presence_of_element_located((By.ID, "box0")))
        assert time.time() - start < 1.5


def testShouldWaitAtLeastOnce(driver, pages):
    pages.load("simpleTest.html")
    elements = WebDriverWait(driver, 0).until(lambda d: d.find_elements_by_tag_name('h1'))
    assert len(elements) >= 1


def testWaitUntilNotReturnsIfEvaluatesToFalse(driver, pages):
    assert WebDriverWait(driver, 1).until_not(lambda d: False) is False


def testWaitShouldStillFailIfProduceIgnoredException(driver, pages):
    ignored = (InvalidElementStateException, StaleElementReferenceException)
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1, 0.7, ignored_exceptions=ignored).until(throwSERE)


def testWaitShouldStillFailIfProduceChildOfIgnoredException(driver, pages):
    ignored = (WebDriverException)
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1, 0.7, ignored_exceptions=ignored).until(throwSERE)


def testWaitUntilNotShouldNotFailIfProduceIgnoredException(driver, pages):
    ignored = (InvalidElementStateException, StaleElementReferenceException)
    assert WebDriverWait(driver, 1, 0.7, ignored_exceptions=ignored).until_not(throwSERE)


def testExpectedConditionTitleIs(driver, pages):
    pages.load("blank.html")
    WebDriverWait(driver, 1).until(EC.title_is("blank"))
    driver.execute_script("setTimeout(function(){document.title='not blank'}, 200)")
    WebDriverWait(driver, 1).until(EC.title_is("not blank"))
    assert driver.title == 'not blank'
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.title_is("blank"))


def testExpectedConditionTitleContains(driver, pages):
    pages.load("blank.html")
    driver.execute_script("setTimeout(function(){document.title='not blank'}, 200)")
    WebDriverWait(driver, 1).until(EC.title_contains("not"))
    assert driver.title == 'not blank'
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.title_contains("blanket"))


def testExpectedConditionVisibilityOfElementLocated(driver, pages):
    pages.load("javascriptPage.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.visibility_of_element_located((By.ID, 'clickToHide')))
    driver.find_element_by_id('clickToShow').click()
    element = WebDriverWait(driver, 5).until(EC.visibility_of_element_located((By.ID, 'clickToHide')))
    assert element.is_displayed() is True


def testExpectedConditionVisibilityOf(driver, pages):
    pages.load("javascriptPage.html")
    hidden = driver.find_element_by_id('clickToHide')
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.visibility_of(hidden))
    driver.find_element_by_id('clickToShow').click()
    element = WebDriverWait(driver, 5).until(EC.visibility_of(hidden))
    assert element.is_displayed() is True


def testExpectedConditionTextToBePresentInElement(driver, pages):
    pages.load('booleanAttributes.html')
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.text_to_be_present_in_element((By.ID, 'unwrappable'), 'Expected'))
    driver.execute_script("setTimeout(function(){var el = document.getElementById('unwrappable'); el.textContent = el.innerText = 'Unwrappable Expected text'}, 200)")
    WebDriverWait(driver, 1).until(EC.text_to_be_present_in_element((By.ID, 'unwrappable'), 'Expected'))
    assert 'Unwrappable Expected text' == driver.find_element_by_id('unwrappable').text


def testExpectedConditionTextToBePresentInElementValue(driver, pages):
    pages.load('booleanAttributes.html')
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(EC.text_to_be_present_in_element_value((By.ID, 'inputRequired'), 'Expected'))
    driver.execute_script("setTimeout(function(){document.getElementById('inputRequired').value = 'Example Expected text'}, 200)")
    WebDriverWait(driver, 1).until(EC.text_to_be_present_in_element_value((By.ID, 'inputRequired'), 'Expected'))
    assert 'Example Expected text' == driver.find_element_by_id('inputRequired').get_attribute('value')


def testExpectedConditionFrameToBeAvailableAndSwitchToItByName(driver, pages):
    pages.load("blank.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(EC.frame_to_be_available_and_switch_to_it('myFrame'))
    driver.execute_script("setTimeout(function(){var f = document.createElement('iframe'); f.id='myFrame'; f.src = '" + pages.url('iframeWithAlert.html') + "'; document.body.appendChild(f)}, 200)")
    WebDriverWait(driver, 1).until(EC.frame_to_be_available_and_switch_to_it('myFrame'))
    assert 'click me' == driver.find_element_by_id('alertInFrame').text


def testExpectedConditionFrameToBeAvailableAndSwitchToItByLocator(driver, pages):
    pages.load("blank.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 1).until(EC.frame_to_be_available_and_switch_to_it((By.ID, 'myFrame')))
    driver.execute_script("setTimeout(function(){var f = document.createElement('iframe'); f.id='myFrame'; f.src = '" + pages.url('iframeWithAlert.html') + "'; document.body.appendChild(f)}, 200)")
    WebDriverWait(driver, 1).until(EC.frame_to_be_available_and_switch_to_it((By.ID, 'myFrame')))
    assert 'click me' == driver.find_element_by_id('alertInFrame').text


def testExpectedConditionInvisiblityOfElement(driver, pages):
    pages.load("javascriptPage.html")
    target = driver.find_element_by_id('clickToHide')
    driver.execute_script("delayedShowHide(0, true)")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.invisibility_of_element(target))
    driver.execute_script("delayedShowHide(200, false)")
    element = WebDriverWait(driver, 0.7).until(EC.invisibility_of_element(target))
    assert element.is_displayed() is False
    assert target == element


def testExpectedConditionInvisiblityOfElementLocated(driver, pages):
    pages.load("javascriptPage.html")
    driver.execute_script("delayedShowHide(0, true)")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.invisibility_of_element_located((By.ID, 'clickToHide')))
    driver.execute_script("delayedShowHide(200, false)")
    element = WebDriverWait(driver, 0.7).until(EC.invisibility_of_element_located((By.ID, 'clickToHide')))
    assert element.is_displayed() is False


def testExpectedConditionElementToBeClickable(driver, pages):
    pages.load("javascriptPage.html")
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_to_be_clickable((By.ID, 'clickToHide')))
    driver.execute_script("delayedShowHide(200, true)")
    WebDriverWait(driver, 0.7).until(EC.element_to_be_clickable((By.ID, 'clickToHide')))
    element = driver.find_element_by_id('clickToHide')
    element.click()
    WebDriverWait(driver, 3.5).until(EC.invisibility_of_element_located((By.ID, 'clickToHide')))
    assert element.is_displayed() is False


def testExpectedConditionStalenessOf(driver, pages):
    pages.load('dynamicallyModifiedPage.html')
    element = driver.find_element_by_id('element-to-remove')
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.staleness_of(element))
    driver.find_element_by_id('buttonDelete').click()
    assert 'element' == element.text
    WebDriverWait(driver, 0.7).until(EC.staleness_of(element))
    with pytest.raises(StaleElementReferenceException):
        element.text


def testExpectedConditionElementToBeSelected(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_id('checky')
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_to_be_selected(element))
    driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
    WebDriverWait(driver, 0.7).until(EC.element_to_be_selected(element))
    assert element.is_selected() is True


def testExpectedConditionElementLocatedToBeSelected(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_id('checky')
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_located_to_be_selected((By.ID, 'checky')))
    driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
    WebDriverWait(driver, 0.7).until(EC.element_located_to_be_selected((By.ID, 'checky')))
    assert element.is_selected() is True


def testExpectedConditionElementSelectionStateToBe(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_id('checky')
    WebDriverWait(driver, 0.7).until(EC.element_selection_state_to_be(element, False))
    assert element.is_selected() is False
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_selection_state_to_be(element, True))
    driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
    WebDriverWait(driver, 0.7).until(EC.element_selection_state_to_be(element, True))
    assert element.is_selected() is True


def testExpectedConditionElementLocatedSelectionStateToBe(driver, pages):
    pages.load("formPage.html")
    element = driver.find_element_by_id('checky')
    WebDriverWait(driver, 0.7).until(EC.element_located_selection_state_to_be((By.ID, 'checky'), False))
    assert element.is_selected() is False
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.element_located_selection_state_to_be((By.ID, 'checky'), True))
    driver.execute_script("setTimeout(function(){document.getElementById('checky').checked = true}, 200)")
    WebDriverWait(driver, 0.7).until(EC.element_located_selection_state_to_be((By.ID, 'checky'), True))
    assert element.is_selected() is True


def testExpectedConditionAlertIsPresent(driver, pages):
    pages.load('blank.html')
    with pytest.raises(TimeoutException):
        WebDriverWait(driver, 0.7).until(EC.alert_is_present())
    driver.execute_script("setTimeout(function(){alert('alerty')}, 200)")
    WebDriverWait(driver, 0.7).until(EC.alert_is_present())
    alert = driver.switch_to.alert
    assert 'alerty' == alert.text
    alert.dismiss()
