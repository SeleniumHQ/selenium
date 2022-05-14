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

import sys

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common.exceptions import (
    InvalidElementStateException,
    NoAlertPresentException,
    UnexpectedAlertPresentException)


@pytest.fixture(autouse=True)
def close_alert(driver):
    yield
    try:
        driver.switch_to.alert.dismiss()
    except Exception:
        pass


def test_should_be_able_to_override_the_window_alert_method(driver, pages):
    pages.load("alerts.html")
    driver.execute_script(
        "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }")
    driver.find_element(by=By.ID, value="alert").click()
    try:
        assert driver.find_element(By.ID, 'text').text == "cheese"
    except Exception as e:
        # if we're here, likely the alert is displayed
        # not dismissing it will affect other tests
        try:
            _wait_for_alert(driver).dismiss()
        except Exception:
            pass
        raise e


def test_should_allow_users_to_accept_an_alert_manually(driver, pages):
    pages.load("alerts.html")
    driver.find_element(by=By.ID, value="alert").click()
    alert = _wait_for_alert(driver)
    alert.accept()
    #  If we can perform any action, we're good to go
    assert "Testing Alerts" == driver.title


def test_should_allow_users_to_accept_an_alert_with_no_text_manually(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "empty-alert").click()
    alert = _wait_for_alert(driver)
    alert.accept()

    #  If we can perform any action, we're good to go
    assert "Testing Alerts" == driver.title


def test_should_get_text_of_alert_opened_in_set_timeout(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "slow-alert").click()

    # DO NOT WAIT OR SLEEP HERE
    # This is a regression test for a bug where only the first switchTo call would throw,
    # and only if it happens before the alert actually loads.

    alert = _wait_for_alert(driver)
    try:
        assert "Slow" == alert.text
    finally:
        alert.accept()


def test_should_allow_users_to_dismiss_an_alert_manually(driver, pages):
    pages.load("alerts.html")
    driver.find_element(by=By.ID, value="alert").click()
    alert = _wait_for_alert(driver)
    alert.dismiss()
    #  If we can perform any action, we're good to go
    assert "Testing Alerts" == driver.title


def test_should_allow_auser_to_accept_aprompt(driver, pages):
    pages.load("alerts.html")
    driver.find_element(by=By.ID, value="prompt").click()
    alert = _wait_for_alert(driver)
    alert.accept()

    #  If we can perform any action, we're good to go
    assert "Testing Alerts" == driver.title


def test_should_allow_auser_to_dismiss_aprompt(driver, pages):
    pages.load("alerts.html")
    driver.find_element(by=By.ID, value="prompt").click()
    alert = _wait_for_alert(driver)
    alert.dismiss()

    #  If we can perform any action, we're good to go
    assert "Testing Alerts" == driver.title


def test_should_allow_auser_to_set_the_value_of_aprompt(driver, pages):
    pages.load("alerts.html")
    driver.find_element(by=By.ID, value="prompt").click()
    alert = _wait_for_alert(driver)
    alert.send_keys("cheese")
    alert.accept()

    result = driver.find_element(by=By.ID, value="text").text
    assert "cheese" == result


@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_setting_the_value_of_an_alert_throws(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "alert").click()

    alert = _wait_for_alert(driver)
    with pytest.raises(InvalidElementStateException):
        alert.send_keys("cheese")
    alert.accept()


@pytest.mark.xfail_chrome(
    condition=sys.platform == 'darwin',
    reason='https://bugs.chromium.org/p/chromedriver/issues/detail?id=26',
    run=False)
@pytest.mark.xfail_chromiumedge(
    condition=sys.platform == 'darwin',
    reason='https://bugs.chromium.org/p/chromedriver/issues/detail?id=26',
    run=False)
def test_alert_should_not_allow_additional_commands_if_dimissed(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "alert").click()

    alert = _wait_for_alert(driver)
    alert.dismiss()

    with pytest.raises(NoAlertPresentException):
        alert.text


@pytest.mark.xfail_firefox(reason='Fails on travis')
@pytest.mark.xfail_remote(reason='Fails on travis')
@pytest.mark.xfail_safari
def test_should_allow_users_to_accept_an_alert_in_aframe(driver, pages):
    pages.load("alerts.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "iframeWithAlert"))
    driver.find_element(By.ID, "alertInFrame").click()

    alert = _wait_for_alert(driver)
    alert.accept()

    assert "Testing Alerts" == driver.title


@pytest.mark.xfail_firefox(reason='Fails on travis')
@pytest.mark.xfail_remote(reason='Fails on travis')
@pytest.mark.xfail_safari
def test_should_allow_users_to_accept_an_alert_in_anested_frame(driver, pages):
    pages.load("alerts.html")
    driver.switch_to.frame(driver.find_element(By.NAME, "iframeWithIframe"))
    driver.switch_to.frame(driver.find_element(By.NAME, "iframeWithAlert"))

    driver.find_element(By.ID, "alertInFrame").click()

    alert = _wait_for_alert(driver)
    alert.accept()

    assert "Testing Alerts" == driver.title


def test_should_throw_an_exception_if_an_alert_has_not_been_dealt_with_and_dismiss_the_alert():
    pass
    # //TODO(David) Complete this test


def test_prompt_should_use_default_value_if_no_keys_sent(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "prompt-with-default").click()

    alert = _wait_for_alert(driver)
    alert.accept()

    txt = driver.find_element(By.ID, "text").text
    assert "This is a default value" == txt


def test_prompt_should_have_null_value_if_dismissed(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "prompt-with-default").click()
    alert = _wait_for_alert(driver)
    alert.dismiss()

    assert "null" == driver.find_element(By.ID, "text").text


def test_handles_two_alerts_from_one_interaction(driver, pages):
    pages.load("alerts.html")

    driver.find_element(By.ID, "double-prompt").click()

    alert1 = _wait_for_alert(driver)
    alert1.send_keys("brie")
    alert1.accept()

    alert2 = _wait_for_alert(driver)
    alert2.send_keys("cheddar")
    alert2.accept()

    assert driver.find_element(By.ID, "text1").text == "brie"
    assert driver.find_element(By.ID, "text2").text == "cheddar"


@pytest.mark.xfail_safari
def test_should_handle_alert_on_page_load(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "open-page-with-onload-alert").click()
    alert = _wait_for_alert(driver)
    value = alert.text
    alert.accept()
    assert "onload" == value


def test_should_handle_alert_on_page_load_using_get(driver, pages):
    pages.load("pageWithOnLoad.html")
    alert = _wait_for_alert(driver)
    value = alert.text
    alert.accept()

    assert "onload" == value
    WebDriverWait(driver, 3).until(EC.text_to_be_present_in_element((By.TAG_NAME, "p"), "Page with onload event handler"))


@pytest.mark.xfail_chrome(reason='Non W3C conformant')
@pytest.mark.xfail_chromiumedge(reason='Non W3C conformant')
def test_should_handle_alert_on_page_before_unload(driver, pages):
    pages.load("pageWithOnBeforeUnloadMessage.html")

    element = driver.find_element(By.ID, "navigate")
    element.click()
    WebDriverWait(driver, 3).until(EC.title_is("Testing Alerts"))


def test_should_allow_the_user_to_get_the_text_of_an_alert(driver, pages):
    pages.load("alerts.html")
    driver.find_element(by=By.ID, value="alert").click()
    alert = _wait_for_alert(driver)
    value = alert.text
    alert.accept()
    assert "cheese" == value


def test_should_allow_the_user_to_get_the_text_of_aprompt(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "prompt").click()

    alert = _wait_for_alert(driver)
    value = alert.text
    alert.accept()

    assert "Enter something" == value


def test_alert_should_not_allow_additional_commands_if_dismissed(driver, pages):
    pages.load("alerts.html")
    driver.find_element(By.ID, "alert").click()

    alert = _wait_for_alert(driver)
    alert.accept()

    with pytest.raises(NoAlertPresentException):
        alert.text


@pytest.mark.xfail_firefox(
    reason='https://bugzilla.mozilla.org/show_bug.cgi?id=1279211')
@pytest.mark.xfail_remote(
    reason='https://bugzilla.mozilla.org/show_bug.cgi?id=1279211')
@pytest.mark.xfail_chrome
def test_unexpected_alert_present_exception_contains_alert_text(driver, pages):
    pages.load("alerts.html")
    driver.find_element(by=By.ID, value="alert").click()
    alert = _wait_for_alert(driver)
    value = alert.text
    with pytest.raises(UnexpectedAlertPresentException) as e:
        pages.load("simpleTest.html")
    assert value == e.value.alert_text
    assert f"Alert Text: {value}" in str(e)


def _wait_for_alert(driver):
    return WebDriverWait(driver, 3).until(EC.alert_is_present())
