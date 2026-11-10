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

"""Browser tests for the generated ``_bidi`` log domain, which has events but no commands."""

from selenium.webdriver.common._bidi.log import ConsoleLogEntry, JavascriptLogEntry, Log
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def test_entry_added_event_for_a_console_message(driver, pages):
    driver.get(pages.url("bidi/logEntryAdded.html"))
    events = []
    subscription = Log(driver).add_entry_added_listener(events.append)

    driver.find_element(By.ID, "consoleLog").click()
    entry = WebDriverWait(driver, 10).until(lambda _: next((e for e in events if e.text == "Hello, world!"), None))
    Log(driver).remove_listener(subscription)

    assert isinstance(entry, ConsoleLogEntry)


def test_entry_added_event_for_a_javascript_error(driver, pages):
    driver.get(pages.url("bidi/logEntryAdded.html"))
    events = []
    subscription = Log(driver).add_entry_added_listener(events.append)

    driver.find_element(By.ID, "jsException").click()
    entry = WebDriverWait(driver, 10).until(lambda _: next((e for e in events if e.text == "Error: Not working"), None))
    Log(driver).remove_listener(subscription)

    assert isinstance(entry, JavascriptLogEntry)
