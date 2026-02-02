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

"""
Integration tests for session events fired through Selenium Grid.

These tests require a running Selenium Grid instance. They verify that
custom session events can be fired from client code and received by
services listening on the remote server event bus.
"""


def test_fire_session_event_with_payload(driver, pages):
    """Test firing a session event with payload data through Grid."""
    pages.load("simpleTest.html")

    payload = {"testName": "LoginTest", "error": "Element not found", "screenshot": True}
    result = driver.fire_session_event("test:failed", payload)

    assert result["success"] is True
    assert result["eventType"] == "test:failed"
    assert "timestamp" in result


def test_fire_session_event_without_payload(driver, pages):
    """Test firing a session event without payload through Grid."""
    pages.load("simpleTest.html")

    result = driver.fire_session_event("log:collect")

    assert result["success"] is True
    assert result["eventType"] == "log:collect"
    assert "timestamp" in result


def test_fire_session_event_with_empty_payload(driver, pages):
    """Test firing a session event with empty payload through Grid."""
    pages.load("simpleTest.html")

    result = driver.fire_session_event("marker:add", {})

    assert result["success"] is True
    assert result["eventType"] == "marker:add"


def test_fire_multiple_session_events(driver, pages):
    """Test firing multiple session events in sequence."""
    pages.load("simpleTest.html")

    # Simulate test lifecycle events
    result1 = driver.fire_session_event("test:started", {"testName": "NavigationTest"})
    assert result1["success"] is True
    assert result1["eventType"] == "test:started"

    result2 = driver.fire_session_event("test:step", {"stepName": "Navigate to page", "status": "passed"})
    assert result2["success"] is True
    assert result2["eventType"] == "test:step"

    result3 = driver.fire_session_event("test:passed", {"testName": "NavigationTest", "duration": 1500})
    assert result3["success"] is True
    assert result3["eventType"] == "test:passed"


def test_fire_session_event_with_complex_payload(driver, pages):
    """Test firing a session event with nested payload data."""
    pages.load("simpleTest.html")

    payload = {
        "testName": "ComplexTest",
        "metadata": {"suite": "regression", "priority": "high", "tags": ["smoke", "critical"]},
        "timing": {"started": "2024-01-15T10:00:00Z", "ended": "2024-01-15T10:05:00Z"},
        "retryCount": 0,
    }
    result = driver.fire_session_event("test:completed", payload)

    assert result["success"] is True
    assert result["eventType"] == "test:completed"
