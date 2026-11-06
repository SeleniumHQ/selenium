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


def test_entry_added_event_for_a_console_message(driver, pages, listen):
    driver.get(pages.url("bidi/logEntryAdded.html"))
    entries = listen(Log, "entry_added")

    driver.find_element(By.ID, "consoleLog").click()

    assert isinstance(entries.first(lambda entry: entry.text == "Hello, world!"), ConsoleLogEntry)


def test_entry_added_event_for_a_javascript_error(driver, pages, listen):
    driver.get(pages.url("bidi/logEntryAdded.html"))
    entries = listen(Log, "entry_added")

    driver.find_element(By.ID, "jsException").click()

    assert isinstance(entries.first(lambda entry: entry.text == "Error: Not working"), JavascriptLogEntry)
