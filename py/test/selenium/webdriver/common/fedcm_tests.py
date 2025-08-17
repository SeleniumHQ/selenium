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

from selenium.common.exceptions import NoAlertPresentException


@pytest.mark.xfail_safari(reason="FedCM not supported")
@pytest.mark.xfail_chrome(reason="https://issues.chromium.org/u/0/issues/425801332")
@pytest.mark.xfail_firefox(reason="FedCM not supported")
@pytest.mark.xfail_ie(reason="FedCM not supported")
@pytest.mark.xfail_remote(reason="FedCM not supported, since remote uses Firefox")
class TestFedCM:
    @pytest.fixture(autouse=True)
    def setup(self, driver, webserver):
        driver.get(webserver.where_is("fedcm/fedcm.html", localhost=True))
        self.dialog = driver.dialog

    def test_no_dialog_title(driver):
        with pytest.raises(NoAlertPresentException):
            driver.dialog.title

    def test_no_dialog_subtitle(driver):
        with pytest.raises(NoAlertPresentException):
            driver.dialog.subtitle

    def test_no_dialog_type(driver):
        with pytest.raises(NoAlertPresentException):
            driver.dialog.type

    def test_no_dialog_get_accounts(driver):
        with pytest.raises(NoAlertPresentException):
            driver.dialog.get_accounts()

    def test_no_dialog_select_account(driver):
        with pytest.raises(NoAlertPresentException):
            driver.dialog.select_account(1)

    def test_no_dialog_cancel(driver):
        with pytest.raises(NoAlertPresentException):
            driver.dialog.dismiss()

    def test_no_dialog_click_continue(driver):
        with pytest.raises(NoAlertPresentException):
            driver.dialog.accept()

    def test_trigger_and_verify_dialog_title(self, driver):
        driver.execute_script("triggerFedCm();")
        dialog = driver.fedcm_dialog()
        assert dialog.title == "Sign in to localhost with localhost"
        dialog.dismiss()

    def test_trigger_and_verify_dialog_subtitle(self, driver):
        driver.execute_script("triggerFedCm();")
        dialog = driver.fedcm_dialog()
        assert dialog.subtitle is None
        dialog.dismiss()

    def test_trigger_and_verify_dialog_type(self, driver):
        driver.execute_script("triggerFedCm();")
        dialog = driver.fedcm_dialog()
        assert dialog.type == "AccountChooser"
        dialog.dismiss()

    def test_trigger_and_verify_account_list(self, driver):
        driver.execute_script("triggerFedCm();")
        dialog = driver.fedcm_dialog()
        accounts = dialog.get_accounts()
        assert len(accounts) > 0
        assert accounts[0].name == "John Doe"
        dialog.dismiss()

    def test_select_account(self, driver):
        driver.execute_script("triggerFedCm();")
        dialog = driver.fedcm_dialog()
        dialog.select_account(1)
        driver.fedcm_dialog()  # Wait for dialog to become interactable
        # dialog.click_continue()
        dialog.dismiss()

    def test_dialog_cancel(self, driver):
        driver.execute_script("triggerFedCm();")
        dialog = driver.fedcm_dialog()
        dialog.dismiss()
        with pytest.raises(NoAlertPresentException):
            dialog.title

    def test_enable_fedcm_delay(self, driver):
        driver.fedcm.enable_delay()

    def test_disable_fedcm_delay(self, driver):
        driver.fedcm.disable_delay()

    def test_fedcm_cooldown_reset(self, driver):
        driver.fedcm.reset_cooldown()

    def test_fedcm_no_dialog_type_present(self, driver):
        with pytest.raises(NoAlertPresentException):
            driver.fedcm.dialog_type

    def test_fedcm_no_title_present(self, driver):
        with pytest.raises(NoAlertPresentException):
            driver.fedcm.title

    def test_fedcm_no_subtitle_present(self, driver):
        with pytest.raises(NoAlertPresentException):
            driver.fedcm.subtitle

    def test_fedcm_no_account_list_present(self, driver):
        with pytest.raises(NoAlertPresentException):
            driver.fedcm.account_list()

    def test_fedcm_no_select_account_present(self, driver):
        with pytest.raises(NoAlertPresentException):
            driver.fedcm.select_account(1)

    def test_fedcm_no_cancel_dialog_present(self, driver):
        with pytest.raises(NoAlertPresentException):
            driver.fedcm.dismiss()

    def test_fedcm_no_click_continue_present(self, driver):
        with pytest.raises(NoAlertPresentException):
            driver.fedcm.accept()

    def test_verify_dialog_type_after_cooldown_reset(self, driver):
        driver.fedcm.reset_cooldown()
        driver.execute_script("triggerFedCm();")
        dialog = driver.fedcm_dialog()
        assert dialog.type == "AccountChooser"
        dialog.dismiss()
