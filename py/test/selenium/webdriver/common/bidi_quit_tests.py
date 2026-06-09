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

import logging

import pytest

from selenium.webdriver.common.bidi.browsing_context import ReadinessState


class _WebSocketErrorRecorder(logging.Handler):
    """Captures ERROR-level records emitted by the websocket machinery."""

    def __init__(self) -> None:
        super().__init__(level=logging.ERROR)
        self.records: list[logging.LogRecord] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.records.append(record)


@pytest.mark.xfail_safari
def test_quit_closes_bidi_websocket_without_error(clean_driver, clean_options, webserver):
    """quit() must tear down the BiDi websocket cleanly."""
    clean_options.web_socket_url = True

    recorder = _WebSocketErrorRecorder()
    ws_logger = logging.getLogger("websocket")
    conn_logger = logging.getLogger("selenium.webdriver.remote.websocket_connection")
    ws_logger.addHandler(recorder)
    conn_logger.addHandler(recorder)

    driver = clean_driver(options=clean_options)
    quit_called = False
    try:
        context_id = driver.current_window_handle
        driver.browsing_context.navigate(
            context=context_id,
            url=webserver.where_is("simpleTest.html"),
            wait=ReadinessState.COMPLETE,
        )
        title = driver.script.execute("() => document.title", context_id=context_id)
        assert title.get("value") == "Hello WebDriver"

        ws_connection = driver._websocket_connection
        assert ws_connection is not None, "expected an open BiDi websocket connection"
        ws_thread = ws_connection._ws_thread

        driver.quit()
        quit_called = True

        # The connection is closed from our side and the background thread stops.
        assert driver._websocket_connection is None
        assert not ws_thread.is_alive(), "BiDi websocket thread should be stopped after quit()"
    finally:
        ws_logger.removeHandler(recorder)
        conn_logger.removeHandler(recorder)
        if not quit_called:
            try:
                driver.quit()
            except Exception:
                pass

    ws_errors = [
        r
        for r in recorder.records
        if "Connection to remote host was lost" in r.getMessage() or "goodbye" in r.getMessage()
    ]
    assert not ws_errors, f"websocket error(s) surfaced on quit: {[r.getMessage() for r in ws_errors]}"
