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

from selenium.common.exceptions import JavascriptException


def test_should_allow_script_pinning(driver, pages):
    pages.load("simpleTest.html")
    driver.pinned_scripts = {}
    script_key = driver.pin_script("return 'i like cheese';")

    result = driver.execute_script(script_key)

    assert result == 'i like cheese'


def test_should_allow_pinned_scripts_to_take_arguments(driver, pages):
    pages.load("simpleTest.html")
    driver.pinned_scripts = {}
    hello = driver.pin_script("return arguments[0]")

    result = driver.execute_script(hello, "cheese")

    assert result == "cheese"


def test_should_list_all_pinned_scripts(driver, pages):
    pages.load("simpleTest.html")
    driver.pinned_scripts = {}
    expected = []
    expected.append(driver.pin_script("return arguments[0];").id)
    expected.append(driver.pin_script("return 'cheese';").id)
    expected.append(driver.pin_script("return 42;").id)

    result = driver.get_pinned_scripts()
    assert expected == result


def test_should_allow_scripts_to_be_unpinned(driver, pages):
    pages.load("simpleTest.html")
    driver.pinned_scripts = {}
    cheese = driver.pin_script("return 'cheese';")
    driver.unpin(cheese)
    results = driver.get_pinned_scripts()
    assert cheese not in results


def test_calling_unpinned_script_causes_error(driver, pages):
    pages.load("simpleTest.html")
    cheese = driver.pin_script("return 'brie';")
    driver.unpin(cheese)
    with pytest.raises(JavascriptException):
        driver.execute_script(cheese)
