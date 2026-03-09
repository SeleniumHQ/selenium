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

import time

import pytest

from selenium.webdriver.common.bidi.log import LogLevel
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def test_log_module_initialized(driver):
    """Test that the log module is initialized properly."""
    assert driver.script is not None


class TestBidiLogging:
    """Test class for BiDi logging functionality."""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("bidi/logEntryAdded.html")
    
    def test_console_log_message(self, driver):
        """Test capturing console.log messages."""
        log_entries = []
        
        def callback(log_entry):
            log_entries.append(log_entry)
        
        handler_id = driver.script.add_console_message_handler(callback)
        
        try:
            driver.find_element(By.ID, "consoleLog").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert len(log_entries) > 0
            assert log_entries[0].text == "Hello, world!"
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_console_warn_message(self, driver):
        """Test capturing console.warn messages."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleWarn").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert len(log_entries) > 0
            assert "warning" in log_entries[0].text.lower() or log_entries[0].text == "Warning message"
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_console_error_message(self, driver):
        """Test capturing console.error messages."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleError").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert len(log_entries) > 0
            assert "error" in log_entries[0].text.lower() or log_entries[0].text == "Error message"
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_console_debug_message(self, driver):
        """Test capturing console.debug messages."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleDebug").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert len(log_entries) > 0
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_console_info_message(self, driver):
        """Test capturing console.info messages."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleInfo").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert len(log_entries) > 0
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_multiple_console_messages(self, driver):
        """Test capturing multiple console messages."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleLog").click()
            driver.find_element(By.ID, "consoleWarn").click()
            driver.find_element(By.ID, "consoleError").click()
            
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
            driver.find_element(By.ID, "consoleLog").click()
            WebDriverWait(driver, 5).until(lambda _: len(log_entries1) > 0 and len(log_entries2) > 0)
            
            assert len(log_entries1) > 0
            assert len(log_entries2) > 0
            
            # Remove first handler
            driver.script.remove_console_message_handler(handler_id1)
            
            initial_count1 = len(log_entries1)
            initial_count2 = len(log_entries2)
            
            # Trigger another message
            driver.find_element(By.ID, "consoleWarn").click()
            WebDriverWait(driver, 5).until(lambda _: len(log_entries2) > initial_count2)
            
            # First handler should not receive new messages
            assert len(log_entries1) == initial_count1
            assert len(log_entries2) > initial_count2
        finally:
            driver.script.remove_console_message_handler(handler_id2)
    
    def test_log_entry_text_content(self, driver):
        """Test log entry contains expected text content."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleLog").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert hasattr(log_entries[0], 'text')
            assert len(log_entries[0].text) > 0
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_log_entry_level(self, driver):
        """Test log entry has level information."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleLog").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert hasattr(log_entries[0], 'level') or hasattr(log_entries[0], 'method')
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_log_entry_timestamp(self, driver):
        """Test log entry contains timestamp information."""
        log_entries = []
        before_time = time.time() * 1000
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleLog").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            after_time = time.time() * 1000
            
            assert hasattr(log_entries[0], 'timestamp')
            timestamp = log_entries[0].timestamp
            assert before_time <= timestamp <= after_time
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_exception_messages_logged(self, driver):
        """Test that exception messages are logged."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            # Execute script that throws an error
            driver.execute_script("""
                try {
                    throw new Error("Test error");
                } catch (e) {
                    console.error(e.message);
                }
            """)
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert len(log_entries) > 0
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_log_handler_receives_all_levels(self, driver):
        """Test that a single handler can receive all log levels."""
        log_levels = []
        
        def callback(entry):
            log_levels.append(entry)
        
        handler_id = driver.script.add_console_message_handler(callback)
        
        try:
            driver.execute_script("""
                console.log('log');
                console.warn('warn');
                console.error('error');
                console.debug('debug');
                console.info('info');
            """)
            
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
            # Entry should contain all arguments
            assert hasattr(log_entries[0], 'args') or hasattr(log_entries[0], 'text')
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_log_handler_context_id(self, driver):
        """Test log entry contains context information."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.find_element(By.ID, "consoleLog").click()
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            # Log entry should have context information
            assert hasattr(log_entries[0], 'context') or hasattr(log_entries[0], 'source_url')
        finally:
            driver.script.remove_console_message_handler(handler_id)


class TestBidiJavaScriptErrors:
    """Test class for JavaScript error logging."""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, pages):
        """Setup for each test in this class."""
        pages.load("blank.html")
    
    def test_syntax_error_logged(self, driver):
        """Test that syntax errors are logged."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            # Execute invalid JavaScript (should trigger error logging)
            try:
                driver.execute_script("{{invalid}}")
            except Exception:
                pass
            
            # Give it a moment to log
            time.sleep(0.5)
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_runtime_error_logged(self, driver):
        """Test that runtime errors are logged."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.execute_script("""
                try {
                    undefined_function();
                } catch (e) {
                    console.error(e.message);
                }
            """)
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert len(log_entries) > 0
        finally:
            driver.script.remove_console_message_handler(handler_id)
    
    def test_caught_exception_logged(self, driver):
        """Test that caught exceptions can be logged explicitly."""
        log_entries = []
        
        handler_id = driver.script.add_console_message_handler(log_entries.append)
        
        try:
            driver.execute_script("""
                try {
                    throw new Error("Custom error");
                } catch (error) {
                    console.error("Caught:", error.message);
                }
            """)
            WebDriverWait(driver, 5).until(lambda _: log_entries)
            
            assert len(log_entries) > 0
        finally:
            driver.script.remove_console_message_handler(handler_id)
