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


from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver


def test_fire_session_event_with_payload(mocker):
    """Test firing a session event with payload data."""
    mock = mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.execute")
    mock.return_value = {"value": {"success": True, "eventType": "test:failed", "timestamp": "2024-01-15T10:30:00Z"}}
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.start_session")

    driver = WebDriver(options=ChromeOptions())
    payload = {"testName": "LoginTest", "error": "Element not found"}
    result = driver.fire_session_event("test:failed", payload)

    mock.assert_called_with(Command.FIRE_SESSION_EVENT, {"eventType": "test:failed", "payload": payload})
    assert result["success"] is True
    assert result["eventType"] == "test:failed"


def test_fire_session_event_without_payload(mocker):
    """Test firing a session event without payload."""
    mock = mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.execute")
    mock.return_value = {"value": {"success": True, "eventType": "log:collect", "timestamp": "2024-01-15T10:30:00Z"}}
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver.start_session")

    driver = WebDriver(options=ChromeOptions())
    result = driver.fire_session_event("log:collect")

    mock.assert_called_with(Command.FIRE_SESSION_EVENT, {"eventType": "log:collect"})
    assert result["success"] is True
    assert result["eventType"] == "log:collect"


def test_fire_session_event_command_exists():
    """Test that FIRE_SESSION_EVENT command is defined."""
    assert hasattr(Command, "FIRE_SESSION_EVENT")
    assert Command.FIRE_SESSION_EVENT == "fireSessionEvent"
