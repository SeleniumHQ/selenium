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

from unittest.mock import Mock, patch

import pytest

from selenium.webdriver.common.fedcm.dialog import Dialog


@pytest.fixture
def mock_driver():
    return Mock()


@pytest.fixture
def fedcm(mock_driver):
    fedcm = Mock()
    mock_driver.fedcm = fedcm
    return fedcm


@pytest.fixture
def dialog(mock_driver, fedcm):
    return Dialog(mock_driver)


def test_click_continue(dialog, fedcm):
    dialog.accept()
    fedcm.accept.assert_called_once()


def test_cancel(dialog, fedcm):
    dialog.dismiss()
    fedcm.dismiss.assert_called_once()


def test_select_account(dialog, fedcm):
    dialog.select_account(1)
    fedcm.select_account.assert_called_once_with(1)


def test_type(dialog, fedcm):
    fedcm.dialog_type = "AccountChooser"
    assert dialog.type == "AccountChooser"


def test_title(dialog, fedcm):
    fedcm.title = "Sign in"
    assert dialog.title == "Sign in"


def test_subtitle(dialog, fedcm):
    fedcm.subtitle = {"subtitle": "Choose an account"}
    assert dialog.subtitle == "Choose an account"


def test_get_accounts(dialog, fedcm):
    accounts_data = [
        {"name": "Account1", "email": "account1@example.com"},
        {"name": "Account2", "email": "account2@example.com"},
    ]
    fedcm.account_list = accounts_data

    with patch("selenium.webdriver.common.fedcm.account.Account") as MockAccount:
        MockAccount.return_value = Mock()  # Mock the Account instance
        accounts = dialog.get_accounts()

    assert len(accounts) == 2
    assert accounts[0].name == "Account1"
    assert accounts[0].email == "account1@example.com"
    assert accounts[1].name == "Account2"
    assert accounts[1].email == "account2@example.com"
