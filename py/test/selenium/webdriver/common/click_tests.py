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


@pytest.fixture(autouse=True)
def loadPage(pages):
    pages.load("clicks.html")


def test_can_click_on_alink_that_overflows_and_follow_it(driver):
    driver.find_element(By.ID, "overflowLink").click()
    WebDriverWait(driver, 3).until(EC.title_is("XHTML Test Page"))


def test_clicking_alink_made_up_of_numbers_is_handled_correctly(driver):
    driver.find_element(By.LINK_TEXT, "333333").click()
    WebDriverWait(driver, 3).until(EC.title_is("XHTML Test Page"))
