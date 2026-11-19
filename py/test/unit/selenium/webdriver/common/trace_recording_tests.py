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
import sys
import textwrap
from unittest import mock

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.webdriver import WebDriver as ChromeDriver
from selenium.webdriver.common.trace_recording import TraceRecording

posix_only = pytest.mark.skipif(sys.platform == "win32", reason="fake Selenium Manager is a shell script")


def test_finds_proxy_url_among_log_lines():
    output = (
        "[2026-11-19T10:00:00Z DEBUG] chromedriver 147 found in PATH\n"
        '{"not_ready": true}\n'
        '{broken json with "proxy_url"\n'
        '{"proxy_url": "http://127.0.0.1:4444", "driver_path": "/usr/bin/chromedriver"}\n'
    )
    assert TraceRecording._find_proxy_url(output) == "http://127.0.0.1:4444"


def test_finds_no_proxy_url_without_ready_line():
    assert TraceRecording._find_proxy_url("[DEBUG] starting\n") is None
    assert TraceRecording._find_proxy_url('{"proxy_url": 4444}') is None


def _fake_selenium_manager(tmp_path, monkeypatch, body):
    """Points SE_MANAGER_PATH at a script that saves its arguments and runs ``body``."""
    args_file = tmp_path / "args.json"
    script = tmp_path / "selenium-manager"
    script.write_text(
        textwrap.dedent(
            f"""\
            #!{sys.executable}
            import json, signal, sys, time
            with open({str(args_file)!r}, "w") as f:
                json.dump(sys.argv[1:], f)
            """
        )
        + textwrap.dedent(body)
    )
    script.chmod(0o755)
    monkeypatch.setenv("SE_MANAGER_PATH", str(script))
    return args_file


READY_AND_WAIT = """\
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
    print("[DEBUG] starting chromedriver", flush=True)
    print(json.dumps({"proxy_url": "http://127.0.0.1:9515"}), flush=True)
    time.sleep(60)
"""


@posix_only
def test_starts_selenium_manager_in_record_mode(tmp_path, monkeypatch):
    args_file = _fake_selenium_manager(tmp_path, monkeypatch, READY_AND_WAIT)
    monkeypatch.chdir(tmp_path)

    recording = TraceRecording.start("chrome", "/path/to/chromedriver", "trace.zip", timeout=10)
    try:
        assert recording.proxy_url == "http://127.0.0.1:9515"
        assert recording.trace_path == tmp_path / "trace.zip"
        args = json.loads(args_file.read_text())
        assert args[:6] == [
            "--browser",
            "chrome",
            "--driver-path",
            "/path/to/chromedriver",
            "--record",
            str(tmp_path / "trace.zip"),
        ]
        assert args[6:8] == ["--language-binding", "python"]
    finally:
        recording.stop(session_deleted=False)
    assert recording._process.poll() is not None
    assert "starting chromedriver" in recording.output


@posix_only
def test_waits_for_selenium_manager_to_exit_after_quit(tmp_path, monkeypatch):
    _fake_selenium_manager(
        tmp_path,
        monkeypatch,
        """\
        print(json.dumps({"proxy_url": "http://127.0.0.1:9515"}), flush=True)
        time.sleep(0.5)
        print("trace written", flush=True)
        """,
    )
    recording = TraceRecording.start("chrome", "chromedriver", tmp_path / "trace.zip", timeout=10)
    with mock.patch.object(recording._process, "terminate", wraps=recording._process.terminate) as terminate:
        recording.stop(session_deleted=True)
    terminate.assert_not_called()
    assert recording._process.returncode == 0
    assert "trace written" in recording.output


@posix_only
def test_raises_when_selenium_manager_exits_before_proxy_starts(tmp_path, monkeypatch):
    _fake_selenium_manager(
        tmp_path,
        monkeypatch,
        """\
        print("[ERROR] unknown argument --record", flush=True)
        sys.exit(2)
        """,
    )
    with pytest.raises(WebDriverException, match=r"(?s)exited with code 2.*unknown argument --record"):
        TraceRecording.start("chrome", "chromedriver", tmp_path / "trace.zip", timeout=10)


@posix_only
def test_raises_and_stops_selenium_manager_when_proxy_does_not_start(tmp_path, monkeypatch):
    _fake_selenium_manager(tmp_path, monkeypatch, "time.sleep(60)\n")
    with mock.patch.object(TraceRecording, "_terminate", autospec=True, side_effect=TraceRecording._terminate) as stop:
        with pytest.raises(WebDriverException, match=r"did not start the recording proxy within 0\.5 seconds"):
            TraceRecording.start("chrome", "chromedriver", tmp_path / "trace.zip", timeout=0.5)
    recording = stop.call_args.args[0]
    assert recording._process.poll() is not None


def _local_chrome(options, recording, service):
    finder = mock.patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    start = mock.patch("selenium.webdriver.common.webdriver.TraceRecording.start", return_value=recording)
    session = mock.patch("selenium.webdriver.remote.webdriver.WebDriver.start_session")
    with finder as finder_cls, start as start_recording, session:
        finder_cls.return_value.get_browser_path.return_value = None
        finder_cls.return_value.get_driver_path.return_value = "/path/to/chromedriver"
        driver = ChromeDriver(options=options, service=service)
    return driver, start_recording


def test_local_driver_sends_commands_through_recording_proxy():
    options = ChromeOptions()
    options.record = "trace.zip"
    recording = mock.create_autospec(TraceRecording, instance=True, proxy_url="http://127.0.0.1:9515")
    service = mock.create_autospec(ChromeService, instance=True, path="")
    service.env_path.return_value = None

    driver, start_recording = _local_chrome(options, recording, service)

    start_recording.assert_called_once()
    assert start_recording.call_args.args[0] == "chrome"
    assert start_recording.call_args.args[2] == options.record
    service.start.assert_not_called()
    assert driver.command_executor._client_config.remote_server_addr == "http://127.0.0.1:9515"

    driver.session_id = "abc"
    with mock.patch.object(driver.command_executor, "execute", return_value={"status": 0, "value": None}):
        driver.quit()
    recording.stop.assert_called_once_with(session_deleted=True)
    service.stop.assert_called_once()


def test_local_driver_stops_recording_when_session_was_not_created():
    options = ChromeOptions()
    options.record = "trace.zip"
    recording = mock.create_autospec(TraceRecording, instance=True, proxy_url="http://127.0.0.1:9515")
    service = mock.create_autospec(ChromeService, instance=True, path="")
    service.env_path.return_value = None

    driver, _ = _local_chrome(options, recording, service)
    driver.session_id = None
    with mock.patch.object(driver.command_executor, "execute", side_effect=WebDriverException("no session")):
        driver.quit()
    recording.stop.assert_called_once_with(session_deleted=False)


def test_local_driver_does_not_record_by_default():
    service = mock.create_autospec(ChromeService, instance=True, path="", service_url="http://localhost:1234")
    service.env_path.return_value = None
    _, start_recording = _local_chrome(ChromeOptions(), None, service)
    start_recording.assert_not_called()
    service.start.assert_called_once()
