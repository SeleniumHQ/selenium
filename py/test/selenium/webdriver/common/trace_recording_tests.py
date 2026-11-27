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

import json
import os
import zipfile
from pathlib import Path

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

# Recording is done by Selenium Manager when it starts Chrome, Edge or Firefox locally.
NOT_SUPPORTED = "Trace recording is only supported for Chrome, Edge and Firefox"


def recording_browsers_only(test):
    for mark in (
        pytest.mark.xfail_safari,
        pytest.mark.xfail_ie,
        pytest.mark.xfail_webkitgtk,
        pytest.mark.xfail_wpewebkit,
    ):
        test = mark(reason=NOT_SUPPORTED, run=False)(test)
    return test


def _trace_file(tmp_path: Path, request, name: str) -> Path:
    """Writes to SELENIUM_TRACE_DIR when set, so the traces can be opened in a viewer."""
    trace_dir = os.environ.get("SELENIUM_TRACE_DIR")
    directory = Path(trace_dir) if trace_dir else tmp_path
    browser = request.config.option.drivers[0].lower()
    return (directory / f"{browser}-{name}").absolute()


def _read_ndjson(archive: zipfile.ZipFile, name: str) -> list[dict]:
    content = archive.read(name).decode("utf-8")
    return [json.loads(line) for line in content.splitlines() if line.strip()]


def _events_of_type(events: list[dict], event_type: str) -> list[dict]:
    return [event for event in events if event.get("type") == event_type]


def _titles(events: list[dict]) -> list[str]:
    return [event["title"] for event in _events_of_type(events, "before")]


def _assert_screenshots_are_packaged(archive: zipfile.ZipFile, events: list[dict]) -> None:
    frames = _events_of_type(events, "screencast-frame")
    assert frames
    for frame in frames:
        assert archive.getinfo(f"resources/{frame['sha1']}").file_size > 0


@recording_browsers_only
@pytest.mark.no_driver_after_test
def test_records_commands_screenshots_and_bidi_events(
    clean_driver, clean_options, clean_service, webserver, tmp_path, request
):
    trace = _trace_file(tmp_path, request, "bidi-trace.zip")
    # The test run may enable BiDi for the binding (--bidi); leave it to the recording proxy instead.
    clean_options.capabilities.pop("webSocketUrl", None)
    clean_options.record = trace

    driver = clean_driver(options=clean_options, service=clean_service)
    try:
        assert driver.capabilities.get("webSocketUrl") is None

        driver.get(webserver.where_is("formPage.html"))
        driver.find_element(By.ID, "working").send_keys("Selenium")
        driver.find_element(By.ID, "checky").click()
        driver.get(webserver.where_is("login.html"))
        driver.find_element(By.ID, "password-field").send_keys("top-secret")
        driver.get(webserver.where_is("bidi/logEntryAdded.html"))
        driver.find_element(By.ID, "consoleLog").click()
        driver.find_element(By.ID, "consoleError").click()
    finally:
        # The trace is only complete once the session is closed.
        driver.quit()

    with zipfile.ZipFile(trace) as archive:
        events = _read_ndjson(archive, "trace.trace")

        context = events[0]
        assert context["type"] == "context-options"
        assert context["version"] == 8
        assert context["sdkLanguage"] == "python"

        titles = _titles(events)
        for title in ("New session", 'Type "Selenium"', "Click", "Quit"):
            assert title in titles
        assert any(title.startswith("Navigate to") and "formPage.html" in title for title in titles)
        _assert_screenshots_are_packaged(archive, events)

        assert 'Type "********"' in titles
        assert b"top-secret" not in archive.read("trace.trace")

        console = [event.get("text") for event in _events_of_type(events, "console")]
        assert "Hello, world!" in console
        assert "I am console error" in console

        network = _read_ndjson(archive, "trace.network")
        assert any(entry["snapshot"]["request"]["url"].endswith("logEntryAdded.html") for entry in network)


@recording_browsers_only
@pytest.mark.no_driver_after_test
def test_falls_back_to_classic_webdriver_when_the_binding_uses_bidi(
    clean_driver, clean_options, clean_service, webserver, tmp_path, request
):
    trace = _trace_file(tmp_path, request, "classic-trace.zip")
    clean_options.web_socket_url = True
    clean_options.record = trace

    driver = clean_driver(options=clean_options, service=clean_service)
    try:
        assert driver.capabilities.get("webSocketUrl") is not None

        driver.get(webserver.where_is("formPage.html"))
        driver.find_element(By.ID, "checky").click()
        WebDriverWait(driver, 5).until(EC.element_located_to_be_selected((By.ID, "checky")))
    finally:
        driver.quit()

    with zipfile.ZipFile(trace) as archive:
        events = _read_ndjson(archive, "trace.trace")
        titles = _titles(events)
        assert "Click" in titles
        assert "Quit" in titles
        _assert_screenshots_are_packaged(archive, events)
