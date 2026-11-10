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

from selenium.webdriver.support.ui import WebDriverWait


def test_log_module_initialized(driver):
    """Test that the log module is initialized properly."""
    assert driver.script is not None


class TestBidiLogging:
    """Test class for BiDi logging functionality."""

    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")

    def test_console_log_message(self, driver):
        """Test capturing console.log messages."""
        log_entries = []

        def callback(log_entry):
            log_entries.append(log_entry)

        handler_id = driver.script.add_console_message_handler(callback)

        try:
            driver.execute_script("console.log('test message');")
            WebDriverWait(driver, 5).until(lambda _: log_entries)

            assert len(log_entries) > 0
        finally:
            driver.script.remove_console_message_handler(handler_id)

    def test_console_multiple_messages(self, driver):
        """Test capturing multiple console messages."""
        log_entries = []

        handler_id = driver.script.add_console_message_handler(log_entries.append)

        try:
            driver.execute_script(
                """
                console.log('message 1');
                console.log('message 2');
                console.log('message 3');
            """
            )

            WebDriverWait(driver, 5).until(lambda _: len(log_entries) >= 3)

            assert len(log_entries) >= 3
        finally:
            driver.script.remove_console_message_handler(handler_id)

    def test_add_and_remove_handler(self, driver):
        """Test adding and removing log handlers."""
        log_entries1 = []
        log_entries2 = []

        handler_id1 = driver.script.add_console_message_handler(log_entries1.append)
        handler_id2 = driver.script.add_console_message_handler(log_entries2.append)

        try:
            driver.execute_script("console.log('first message');")
            WebDriverWait(driver, 5).until(lambda _: len(log_entries1) > 0 and len(log_entries2) > 0)

            assert len(log_entries1) > 0
            assert len(log_entries2) > 0

            # Remove first handler
            driver.script.remove_console_message_handler(handler_id1)

            initial_count1 = len(log_entries1)
            initial_count2 = len(log_entries2)

            # Trigger another message
            driver.execute_script("console.log('second message');")
            WebDriverWait(driver, 5).until(lambda _: len(log_entries2) > initial_count2)

            # First handler should not receive new messages
            assert len(log_entries1) == initial_count1
            assert len(log_entries2) > initial_count2
        finally:
            driver.script.remove_console_message_handler(handler_id2)

    def test_handler_receives_all_levels(self, driver):
        """Test that a single handler can receive all log levels."""
        log_levels = []

        def callback(entry):
            log_levels.append(entry)

        handler_id = driver.script.add_console_message_handler(callback)

        try:
            driver.execute_script(
                """
                console.log('log');
                console.warn('warn');
                console.error('error');
                console.debug('debug');
                console.info('info');
            """
            )

            WebDriverWait(driver, 5).until(lambda _: len(log_levels) >= 5)

            assert len(log_levels) >= 5
        finally:
            driver.script.remove_console_message_handler(handler_id)

    def test_log_with_multiple_arguments(self, driver):
        """Test console.log with multiple arguments."""
        log_entries = []

        handler_id = driver.script.add_console_message_handler(log_entries.append)

        try:
            driver.execute_script("console.log('arg1', 'arg2', 'arg3');")
            WebDriverWait(driver, 5).until(lambda _: log_entries)

            assert len(log_entries) > 0
        finally:
            driver.script.remove_console_message_handler(handler_id)

    def test_log_entry_attributes(self, driver):
        """Test log entry has expected attributes."""
        log_entries = []

        handler_id = driver.script.add_console_message_handler(log_entries.append)

        try:
            driver.execute_script("console.log('test');")
            WebDriverWait(driver, 5).until(lambda _: log_entries)

            assert len(log_entries) > 0
            assert hasattr(log_entries[0], "text") or hasattr(log_entries[0], "args")
        finally:
            driver.script.remove_console_message_handler(handler_id)
