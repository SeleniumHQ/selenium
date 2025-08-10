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


from selenium.webdriver.common.bidi.log import LogLevel
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


async def test_check_console_messages(driver, pages):
    pages.load("javascriptPage.html")

    log_entries = []
    driver.script.add_console_message_handler(log_entries.append)

    driver.execute_script("console.log('I love cheese')")
    WebDriverWait(driver, 5).until(lambda _: log_entries)

    log_entry = log_entries[0]
    assert log_entry.level == LogLevel.INFO
    assert log_entry.method == "log"
    assert log_entry.text == "I love cheese"
    assert log_entry.type_ == "console"


async def test_check_error_console_messages(driver, pages):
    pages.load("javascriptPage.html")

    log_entries = []

    def log_error(entry):
        if entry.level == "error":
            log_entries.append(entry)

    driver.script.add_console_message_handler(log_error)

    driver.execute_script('console.error("I don\'t cheese")')
    WebDriverWait(driver, 5).until(lambda _: log_entries)

    log_entry = log_entries[0]
    assert log_entry.level == LogLevel.ERROR
    assert log_entry.method == "error"
    assert log_entry.text == "I don't cheese"
    assert log_entry.type_ == "console"


async def test_collect_js_exceptions(driver, pages):
    pages.load("javascriptPage.html")

    log_entries = []
    driver.script.add_javascript_error_handler(log_entries.append)

    driver.find_element(By.ID, "throwing-mouseover").click()
    WebDriverWait(driver, 5).until(lambda _: log_entries)

    log_entry = log_entries[0]
    assert log_entry.text == "Error: I like cheese"
    assert log_entry.level == LogLevel.ERROR
    assert log_entry.type_ == "javascript"
    assert log_entry.stacktrace["callFrames"][0]["functionName"] == "onmouseover"


# Test is now failing since Chrome 137, this is using BiDi.
# @pytest.mark.xfail_firefox
# @pytest.mark.xfail_remote
# async def test_collect_log_mutations(driver, pages):
#     async with driver.bidi_connection() as session:
#         log = Log(driver, session)
#         async with log.mutation_events() as event:
#             pages.load("dynamic.html")
#             driver.find_element(By.ID, "reveal").click()
#             WebDriverWait(driver, 10).until(
#                 lambda d: d.find_element(By.ID, "revealed").value_of_css_property("display") != "none"
#             )
#     assert event["attribute_name"] == "style"
#     assert event["current_value"] == ""
#     assert event["old_value"] == "display:none;"
