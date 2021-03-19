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
# under the License

from selenium.webdriver.common.by import By

import pytest


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_should_return_explicitly_specified_role(driver):
    driver.get("data:text/html,<div role='heading' aria-level='1'>Level 1 Header</div>")
    header1 = driver.find_element(By.CSS_SELECTOR, "div")
    assert header1.aria_role == "heading"


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_shouldReturnImplicitRoleDefinedByTagName(driver):
    driver.get("data:text/html,<h1>Level 1 Header</h1>")
    header1 = driver.find_element(By.CSS_SELECTOR, "h1")
    assert header1.aria_role == "heading"


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_should_return_explicit_role_even_if_it_contradicts_tag_name(driver):
    driver.get("data:text/html,<h1 role='alert'>Level 1 Header</h1>")
    header1 = driver.find_element(By.CSS_SELECTOR, "h1")
    assert header1.aria_role == "alert"
