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
from selenium.common.exceptions import InvalidElementStateException
from selenium.common.exceptions import NoAlertPresentException
from selenium.common.exceptions import UnexpectedAlertPresentException


class TestAlerts(object):

    def testShouldBeAbleToOverrideTheWindowAlertMethod(self, driver, pages):
        pages.load("alerts.html")
        driver.execute_script(
            "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }")
        driver.find_element(by=By.ID, value="alert").click()
        try:
            assert driver.find_element_by_id('text').text == "cheese"
        except Exception as e:
            # if we're here, likely the alert is displayed
            # not dismissing it will affect other tests
            try:
                self._waitForAlert(driver).dismiss()
            except Exception:
                pass
            raise e

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowUsersToAcceptAnAlertManually(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(by=By.ID, value="alert").click()
        alert = self._waitForAlert(driver)
        alert.accept()
        #  If we can perform any action, we're good to go
        assert "Testing Alerts" == driver.title

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowUsersToAcceptAnAlertWithNoTextManually(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(By.ID, "empty-alert").click()
        alert = self._waitForAlert(driver)
        alert.accept()

        #  If we can perform any action, we're good to go
        assert "Testing Alerts" == driver.title

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldGetTextOfAlertOpenedInSetTimeout(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element_by_id("slow-alert").click()

        # DO NOT WAIT OR SLEEP HERE
        # This is a regression test for a bug where only the first switchTo call would throw,
        # and only if it happens before the alert actually loads.

        alert = self._waitForAlert(driver)
        try:
            assert "Slow" == alert.text
        finally:
            alert.accept()

    @pytest.mark.xfail_chrome
    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowUsersToDismissAnAlertManually(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(by=By.ID, value="alert").click()
        alert = self._waitForAlert(driver)
        alert.dismiss()
        #  If we can perform any action, we're good to go
        assert "Testing Alerts" == driver.title

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowAUserToAcceptAPrompt(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(by=By.ID, value="prompt").click()
        alert = self._waitForAlert(driver)
        alert.accept()

        #  If we can perform any action, we're good to go
        assert "Testing Alerts" == driver.title

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowAUserToDismissAPrompt(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(by=By.ID, value="prompt").click()
        alert = self._waitForAlert(driver)
        alert.dismiss()

        #  If we can perform any action, we're good to go
        assert "Testing Alerts" == driver.title

    @pytest.mark.xfail_marionette(reason='https://github.com/mozilla/geckodriver/issues/17')
    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowAUserToSetTheValueOfAPrompt(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(by=By.ID, value="prompt").click()
        alert = self._waitForAlert(driver)
        alert.send_keys("cheese")
        alert.accept()

        result = driver.find_element(by=By.ID, value="text").text
        assert "cheese" == result

    @pytest.mark.xfail_marionette(reason='https://github.com/mozilla/geckodriver/issues/17')
    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testSettingTheValueOfAnAlertThrows(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(By.ID, "alert").click()

        alert = self._waitForAlert(driver)
        with pytest.raises(InvalidElementStateException):
            alert.send_keys("cheese")
        alert.accept()

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testAlertShouldNotAllowAdditionalCommandsIfDimissed(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs driver does not support alerts")
        pages.load("alerts.html")
        driver.find_element(By.ID, "alert").click()

        alert = self._waitForAlert(driver)
        alert.dismiss()

        with pytest.raises(NoAlertPresentException):
            alert.text

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowUsersToAcceptAnAlertInAFrame(self, driver, pages):
        pages.load("alerts.html")
        driver.switch_to.frame(driver.find_element(By.NAME, "iframeWithAlert"))
        driver.find_element_by_id("alertInFrame").click()

        alert = self._waitForAlert(driver)
        alert.accept()

        assert "Testing Alerts" == driver.title

    @pytest.mark.xfail_marionette(reason='https://bugzilla.mozilla.org/show_bug.cgi?id=1279211')
    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowUsersToAcceptAnAlertInANestedFrame(self, driver, pages):
        pages.load("alerts.html")
        driver.switch_to.frame(driver.find_element(By.NAME, "iframeWithIframe"))
        driver.switch_to.frame(driver.find_element(By.NAME, "iframeWithAlert"))

        driver.find_element_by_id("alertInFrame").click()

        alert = self._waitForAlert(driver)
        alert.accept()

        assert "Testing Alerts" == driver.title

    def testShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWithAndDismissTheAlert(self):
        pass
        # //TODO(David) Complete this test

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testPromptShouldUseDefaultValueIfNoKeysSent(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(By.ID, "prompt-with-default").click()

        alert = self._waitForAlert(driver)
        alert.accept()

        txt = driver.find_element(By.ID, "text").text
        assert "This is a default value" == txt

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testPromptShouldHaveNullValueIfDismissed(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(By.ID, "prompt-with-default").click()
        alert = self._waitForAlert(driver)
        alert.dismiss()

        assert "null" == driver.find_element(By.ID, "text").text

    @pytest.mark.xfail_marionette(reason='https://github.com/mozilla/geckodriver/issues/17')
    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testHandlesTwoAlertsFromOneInteraction(self, driver, pages):
        pages.load("alerts.html")

        driver.find_element(By.ID, "double-prompt").click()

        alert1 = self._waitForAlert(driver)
        alert1.send_keys("brie")
        alert1.accept()

        alert2 = self._waitForAlert(driver)
        alert2.send_keys("cheddar")
        alert2.accept()

        assert driver.find_element(By.ID, "text1").text == "brie"
        assert driver.find_element(By.ID, "text2").text == "cheddar"

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldHandleAlertOnPageLoad(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(By.ID, "open-page-with-onload-alert").click()
        alert = self._waitForAlert(driver)
        value = alert.text
        alert.accept()
        assert "onload" == value

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldHandleAlertOnPageLoadUsingGet(self, driver, pages):
        pages.load("pageWithOnLoad.html")
        alert = self._waitForAlert(driver)
        value = alert.text
        alert.accept()

        assert "onload" == value
        WebDriverWait(driver, 3).until(EC.text_to_be_present_in_element((By.TAG_NAME, "p"), "Page with onload event handler"))

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldHandleAlertOnPageBeforeUnload(self, driver, pages):
        pages.load("pageWithOnBeforeUnloadMessage.html")

        element = driver.find_element(By.ID, "navigate")
        element.click()

        alert = self._waitForAlert(driver)
        alert.dismiss()
        assert "pageWithOnBeforeUnloadMessage.html" in driver.current_url

        element.click()
        alert = self._waitForAlert(driver)
        alert.accept()
        WebDriverWait(driver, 3).until(EC.title_is("Testing Alerts"))

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def _testShouldHandleAlertOnPageBeforeUnloadAtQuit(self, driver, pages):
        # TODO: Add the ability to get a new session
        pages.load("pageWithOnBeforeUnloadMessage.html")

        element = driver.find_element(By.ID, "navigate")
        element.click()

        self._waitForAlert(driver)

        driver.quit()

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowTheUserToGetTheTextOfAnAlert(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(by=By.ID, value="alert").click()
        alert = self._waitForAlert(driver)
        value = alert.text
        alert.accept()
        assert "cheese" == value

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testShouldAllowTheUserToGetTheTextOfAPrompt(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(By.ID, "prompt").click()

        alert = self._waitForAlert(driver)
        value = alert.text
        alert.accept()

        assert "Enter something" == value

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testAlertShouldNotAllowAdditionalCommandsIfDismissed(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(By.ID, "alert").click()

        alert = self._waitForAlert(driver)
        alert.accept()

        with pytest.raises(NoAlertPresentException):
            alert.text

    @pytest.mark.xfail_phantomjs(reason='PhantomJS driver does not support alerts')
    def testUnexpectedAlertPresentExceptionContainsAlertText(self, driver, pages):
        pages.load("alerts.html")
        driver.find_element(by=By.ID, value="alert").click()
        alert = self._waitForAlert(driver)
        value = alert.text
        with pytest.raises(UnexpectedAlertPresentException) as e:
            pages.load("simpleTest.html")
        assert value == e.value.alert_text
        assert "Alert Text: {}".format(value) in str(e)

    def _waitForAlert(self, driver):
        return WebDriverWait(driver, 3).until(EC.alert_is_present())
