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
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common.exceptions import ElementNotVisibleException
from selenium.common.exceptions import NoAlertPresentException
from selenium.common.exceptions import UnexpectedAlertPresentException


pytestmark = pytest.mark.ignore_phantomjs(
    reason='PhantomJS does not support alerts')


@pytest.fixture(autouse=True)
def test_page(pages):
    pages.load('alerts')


def test_should_be_able_to_override_the_window_alert_method(driver):
    driver.execute_script(
        'window.alert = function(msg) { '
        'document.getElementById("text").innerHTML = msg; }')
    driver.find_element(by=By.ID, value='alert').click()
    assert 'cheese' == driver.find_element_by_id('text').text


def test_should_allow_users_to_accept_an_alert_manually(driver):
    driver.find_element(by=By.ID, value='alert').click()
    alert = _wait_for_alert(driver)
    alert.accept()
    #  If we can perform any action, we're good to go
    assert 'Testing Alerts' == driver.title


def test_should_allow_users_to_accept_an_alert_with_no_text_manually(driver):
    driver.find_element(By.ID, 'empty-alert').click()
    alert = _wait_for_alert(driver)
    alert.accept()
    #  If we can perform any action, we're good to go
    assert 'Testing Alerts' == driver.title


def test_should_get_text_of_alert_opened_in_set_timeout(driver):
    driver.find_element_by_id('slow-alert').click()
    # DO NOT WAIT OR SLEEP HERE
    # This is a regression test for a bug where only the first switchTo call
    # would throw, and only if it happens before the alert actually loads.
    alert = _wait_for_alert(driver)
    assert 'Slow' == alert.text


@pytest.mark.ignore_chrome
def test_should_allow_users_to_dismiss_an_alert_manually(driver):
    driver.find_element(by=By.ID, value='alert').click()
    alert = _wait_for_alert(driver)
    alert.dismiss()
    #  If we can perform any action, we're good to go
    assert 'Testing Alerts' == driver.title


def test_should_allow_a_user_to_accept_a_prompt(driver):
    driver.find_element(by=By.ID, value='prompt').click()
    alert = _wait_for_alert(driver)
    alert.accept()
    #  If we can perform any action, we're good to go
    assert 'Testing Alerts' == driver.title


def test_should_allow_a_user_to_dismiss_a_prompt(driver):
    driver.find_element(by=By.ID, value='prompt').click()
    alert = _wait_for_alert(driver)
    alert.dismiss()
    #  If we can perform any action, we're good to go
    assert 'Testing Alerts' == driver.title


def test_should_allow_a_user_to_set_the_value_of_a_prompt(driver):
    driver.find_element(by=By.ID, value='prompt').click()
    alert = _wait_for_alert(driver)
    alert.send_keys('cheese')
    alert.accept()
    result = driver.find_element(by=By.ID, value='text').text
    assert 'cheese' == result


def test_setting_the_value_of_an_alert_throws(driver):
    driver.find_element(By.ID, 'alert').click()
    alert = _wait_for_alert(driver)
    with pytest.raises(ElementNotVisibleException):
        alert.send_keys('cheese')
    alert.accept()


def test_alert_should_not_allow_additional_commands_if_dimissed(driver):
    driver.find_element(By.ID, 'alert').click()
    alert = _wait_for_alert(driver)
    alert.dismiss()
    with pytest.raises(NoAlertPresentException):
        alert.text


def test_should_allow_users_to_accept_an_alert_in_a_frame(driver):
    driver.switch_to.frame(driver.find_element(By.NAME, 'iframeWithAlert'))
    driver.find_element_by_id('alertInFrame').click()
    alert = _wait_for_alert(driver)
    alert.accept()
    assert 'Testing Alerts' == driver.title


def test_should_allow_users_to_accept_an_alert_in_a_nested_frame(driver):
    driver.switch_to.frame(driver.find_element(By.NAME, 'iframeWithIframe'))
    driver.switch_to.frame(driver.find_element(By.NAME, 'iframeWithAlert'))
    driver.find_element_by_id('alertInFrame').click()
    alert = _wait_for_alert(driver)
    alert.accept()
    assert 'Testing Alerts' == driver.title


def test_should_throw_an_exception_if_an_alert_has_not_been_dealt_with_and_dismiss_the_alert():
    pass
    # //TODO(David) Complete this test


def test_prompt_should_use_default_value_if_no_keys_sent(driver):
    driver.find_element(By.ID, 'prompt-with-default').click()
    alert = _wait_for_alert(driver)
    alert.accept()
    txt = driver.find_element(By.ID, 'text').text
    assert 'This is a default value' == txt


def test_prompt_should_have_null_value_if_dismissed(driver):
    driver.find_element(By.ID, 'prompt-with-default').click()
    alert = _wait_for_alert(driver)
    alert.dismiss()
    assert 'null' == driver.find_element(By.ID, 'text').text


def test_handles_two_alerts_from_one_interaction(driver):
    driver.find_element(By.ID, 'double-prompt').click()

    alert1 = _wait_for_alert(driver)
    alert1.send_keys('brie')
    alert1.accept()

    alert2 = _wait_for_alert(driver)
    alert2.send_keys('cheddar')
    alert2.accept()

    assert 'brie' == driver.find_element(By.ID, 'text1').text
    assert 'cheddar' == driver.find_element(By.ID, 'text2').text


def test_should_handle_alert_on_page_load(driver):
    driver.find_element(By.ID, 'open-page-with-onload-alert').click()
    alert = _wait_for_alert(driver)
    value = alert.text
    alert.accept()
    assert 'onload' == value


def test_should_allow_the_user_to_get_the_text_of_an_alert(driver):
    driver.find_element(by=By.ID, value='alert').click()
    alert = _wait_for_alert(driver)
    value = alert.text
    alert.accept()
    assert 'cheese' == value


def test_unexpected_alert_present_exception_contains_alert_text(driver, pages):
    driver.find_element(by=By.ID, value='alert').click()
    alert = _wait_for_alert(driver)
    value = alert.text
    with pytest.raises(UnexpectedAlertPresentException) as excinfo:
        pages.load('simpleTest')
    assert excinfo.value.alert_text == value
    assert str(excinfo.value).startswith('Alert Text: %s' % value)


def _wait_for_alert(driver):
    return WebDriverWait(driver, 3).until(EC.alert_is_present())
