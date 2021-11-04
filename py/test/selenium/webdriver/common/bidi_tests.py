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
from selenium.common.exceptions import InvalidSelectorException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.log import Log
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

import pytest


@pytest.mark.xfail_safari
async def test_check_console_messages(driver, pages):
    async with driver.bidi_connection() as session:
        log = Log(driver, session)
        pages.load("javascriptPage.html")
        from selenium.webdriver.common.bidi.console import Console
        async with log.add_listener(Console.ALL) as messages:
            driver.execute_script("console.log('I love cheese')")
        assert messages["message"] == "I love cheese"


@pytest.mark.xfail_safari
async def test_check_error_console_messages(driver, pages):
    async with driver.bidi_connection() as session:
        log = Log(driver, session)
        pages.load("javascriptPage.html")
        from selenium.webdriver.common.bidi.console import Console
        async with log.add_listener(Console.ERROR) as messages:
            driver.execute_script("console.error(\"I don't cheese\")")
            driver.execute_script("console.log('I love cheese')")
        assert messages["message"] == "I don't cheese"


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
async def test_collect_js_exceptions(driver, pages):
    async with driver.bidi_connection() as session:
        log = Log(driver, session)
        pages.load("javascriptPage.html")
        async with log.add_js_error_listener() as exceptions:
            driver.find_element(By.ID, "throwing-mouseover").click()
        assert exceptions is not None
        assert exceptions.exception_details.stack_trace.call_frames[0].function_name == "onmouseover"


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
async def test_collect_log_mutations(driver, pages):
    async with driver.bidi_connection() as session:
        log = Log(driver, session)
        async with log.mutation_events() as event:
            pages.load("dynamic.html")
            driver.find_element(By.ID, "reveal").click()
            WebDriverWait(driver, 5, ignored_exceptions=InvalidSelectorException)\
                .until(EC.visibility_of(driver.find_element(By.ID, "revealed")))

    assert event["attribute_name"] == "style"
    assert event["current_value"] == ""
    assert event["old_value"] == "display:none;"
