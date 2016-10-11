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


@pytest.fixture(autouse=True)
def loadPage(pages):
    pages.load("clicks.html")


@pytest.fixture(autouse=True)
def clearCookies(request, driver):
    def fin():
        driver.delete_all_cookies()
    request.addfinalizer(fin)


class TestClick(object):

    def testAddingACookieThatExpiredInThePast(self, driver):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c:
            pytest.xfail("Test is failing because of some state being leftover.")
        driver.find_element(By.ID, "overflowLink").click()
        assert driver.title == "XHTML Test Page"

    def testClickingALinkMadeUpOfNumbersIsHandledCorrectly(self, driver):
        if driver.capabilities['browserName'] == 'firefox' and driver.w3c:
            pytest.xfail("Marionette Issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1309244")
        driver.find_element(By.LINK_TEXT, "333333").click()
        assert driver.title == "XHTML Test Page"
