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

"""Unit tests for the high-level BiDi browser module.

Drives selenium.webdriver.common.bidi.browser through a stand-in connection —
no browser, no window manager — so the exact frame each method puts on the wire
is asserted directly. browser.setClientWindowState is the subject: its params
are a CDDL group choice, so the chosen variant's members are siblings of
clientWindow rather than a nested value, and getting that wrong is only visible
to a conformant browser (https://github.com/SeleniumHQ/selenium/issues/18085).
"""

import pytest

from selenium.webdriver.common.bidi.browser import (
    Browser,
    ClientWindowNamedState,
    ClientWindowRectState,
)

CLIENT_WINDOW_INFO = {
    "active": True,
    "clientWindow": "window-1",
    "height": 480,
    "state": "normal",
    "width": 640,
    "x": 10,
    "y": 20,
}


class RecordingConnection:
    """Stands in for WebSocketConnection's ``execute``, minus the socket.

    Records the outbound frame (or leaves it None if no command was ever sent)
    and drives the command generator with a canned reply.
    """

    def __init__(self, reply=None):
        self.reply = reply
        self.sent = None

    def execute(self, command):
        self.sent = next(command)
        try:
            command.send(self.reply)
        except StopIteration as exc:
            return exc.value
        raise AssertionError("command generator yielded more than once")


def _browser(reply=None):
    connection = RecordingConnection(reply=reply)
    return Browser(connection), connection


@pytest.mark.parametrize(
    "state",
    [
        ClientWindowNamedState.FULLSCREEN,
        ClientWindowNamedState.MAXIMIZED,
        ClientWindowNamedState.MINIMIZED,
        ClientWindowNamedState.NORMAL,
    ],
)
def test_a_named_window_state_is_sent_as_a_bare_string(state):
    browser, connection = _browser()

    browser.set_client_window_state(client_window="window-1", state=state)

    assert connection.sent == {
        "method": "browser.setClientWindowState",
        "params": {"clientWindow": "window-1", "state": state},
    }


def test_a_rect_window_state_is_spliced_in_beside_the_client_window():
    browser, connection = _browser(reply=CLIENT_WINDOW_INFO)

    result = browser.set_client_window_state(
        client_window="window-1",
        state=ClientWindowRectState(width=640, height=480, x=0, y=0),
    )

    assert connection.sent == {
        "method": "browser.setClientWindowState",
        "params": {
            "clientWindow": "window-1",
            "state": "normal",
            "width": 640,
            "height": 480,
            "x": 0,
            "y": 0,
        },
    }
    assert result == CLIENT_WINDOW_INFO


def test_omitted_rect_members_are_left_out_of_the_frame():
    browser, connection = _browser()

    browser.set_client_window_state(client_window="window-1", state=ClientWindowRectState(width=640))

    assert connection.sent["params"] == {"clientWindow": "window-1", "state": "normal", "width": 640}


def test_a_rect_state_given_as_a_dict_is_spliced_in_the_same_way():
    browser, connection = _browser()

    browser.set_client_window_state(
        client_window="window-1",
        state={"state": "normal", "width": 640, "height": 480},
    )

    assert connection.sent["params"] == {
        "clientWindow": "window-1",
        "state": "normal",
        "width": 640,
        "height": 480,
    }


def test_a_state_without_a_named_or_rect_discriminator_is_rejected():
    browser, connection = _browser()

    with pytest.raises(ValueError, match="state is required"):
        browser.set_client_window_state(client_window="window-1", state={"width": 640})

    assert connection.sent is None


def test_a_state_of_an_unusable_type_is_rejected():
    browser, connection = _browser()

    with pytest.raises(ValueError, match="state must be"):
        browser.set_client_window_state(client_window="window-1", state=42)

    assert connection.sent is None


def test_the_client_window_and_state_are_both_required():
    browser, connection = _browser()

    with pytest.raises(ValueError, match="client_window is required"):
        browser.set_client_window_state(state=ClientWindowNamedState.MAXIMIZED)
    with pytest.raises(ValueError, match="state is required"):
        browser.set_client_window_state(client_window="window-1")

    assert connection.sent is None


def test_the_named_state_constants_match_the_spec():
    assert ClientWindowNamedState.FULLSCREEN == "fullscreen"
    assert ClientWindowNamedState.MAXIMIZED == "maximized"
    assert ClientWindowNamedState.MINIMIZED == "minimized"
    assert ClientWindowNamedState.NORMAL == "normal"
