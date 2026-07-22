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

"""Unit tests for the hand-written BiDi transport seam.

Exercises `selenium.webdriver.common._bidi.transport` — the `Transport` that turns a
command into a wire frame and back, and the `Domain` base every generated module
subclasses. The websocket is stood in by `DrivingConnection`, which drives the
command coroutine with the exact next()/send() protocol `WebSocketConnection`
uses, so the seam is tested against the real contract rather than a mock of it.
"""

from dataclasses import dataclass, field

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.domain import Domain
from selenium.webdriver.common._bidi.serialization import Record, meta, register
from selenium.webdriver.common._bidi.transport import Transport


@register("test_transport.Params")
@dataclass(frozen=True)
class Params(Record):
    context: str = field(metadata=meta("context", required=True, primitive="str"))


@register("test_transport.Result")
@dataclass(frozen=True)
class Result(Record):
    value: str = field(metadata=meta("value", required=True, primitive="str"))


class DrivingConnection:
    """Stands in for WebSocketConnection's ``send_cmd``, minus the socket.

    Records the outbound frame and returns a canned reply envelope, so the seam is
    tested against the real send/reply contract rather than a mock of it. Set
    ``error`` (and optionally ``message``) to return an error envelope instead.
    """

    def __init__(self, reply=None, error=None, message=None):
        self.reply = reply
        self.error = error
        self.message = message
        self.sent = None

    def send_cmd(self, method, params):
        self.sent = {"method": method, "params": params}
        if self.error is not None:
            envelope = {"error": self.error}
            if self.message is not None:
                envelope["message"] = self.message
            return envelope
        return {"result": self.reply}


class DriverWithConnection:
    def __init__(self, connection):
        self._websocket_connection = connection


class DriverThatStartsBiDi:
    def __init__(self, connection):
        self._connection = connection
        self._websocket_connection = None
        self.started = False

    def _start_bidi(self):
        self.started = True
        self._websocket_connection = self._connection


# --- Transport ---


def test_execute_sends_the_method_and_serialized_params():
    connection = DrivingConnection(reply={"value": "ok"})

    result = Transport(connection).execute("some.command", params=Params(context="c"), result=Result)

    assert connection.sent == {"method": "some.command", "params": {"context": "c"}}
    assert result == Result(value="ok")


def test_execute_with_no_params_sends_an_empty_params_object():
    connection = DrivingConnection(reply={"value": "ok"})

    Transport(connection).execute("some.command", result=Result)

    assert connection.sent == {"method": "some.command", "params": {}}


def test_execute_with_no_result_type_returns_the_raw_reply():
    connection = DrivingConnection(reply={"anything": 1})

    result = Transport(connection).execute("some.command", params=Params(context="c"))

    assert result == {"anything": 1}


def test_execute_raises_when_the_reply_carries_an_error():
    connection = DrivingConnection(error="unknown command", message="no such command")

    with pytest.raises(WebDriverException, match=r"unknown command: no such command"):
        Transport(connection).execute("bad.command", params=Params(context="c"), result=Result)


def test_execute_error_without_a_message_raises_with_just_the_error():
    connection = DrivingConnection(error="unknown command")

    with pytest.raises(WebDriverException) as exc_info:
        Transport(connection).execute("bad.command", result=Result)
    assert exc_info.value.msg == "unknown command"


# --- Domain seam ---


def test_domain_accepts_a_transport_directly():
    connection = DrivingConnection(reply={"value": "ok"})

    domain = Domain(Transport(connection))

    assert domain._execute("cmd", params=Params(context="c"), result=Result) == Result(value="ok")


def test_domain_wraps_the_drivers_connection():
    connection = DrivingConnection(reply={"value": "ok"})

    domain = Domain(DriverWithConnection(connection))

    assert domain._transport.connection is connection
    assert domain._execute("cmd", params=Params(context="c"), result=Result) == Result(value="ok")


def test_domain_starts_bidi_when_the_connection_is_not_open_yet():
    connection = DrivingConnection(reply={"value": "ok"})
    driver = DriverThatStartsBiDi(connection)

    domain = Domain(driver)

    assert driver.started
    assert domain._transport.connection is connection
    assert domain._execute("cmd", params=Params(context="c"), result=Result) == Result(value="ok")


def test_domain_without_a_connection_or_a_way_to_start_one_raises():
    with pytest.raises(WebDriverException, match=r"a WebDriver or Transport is required"):
        Domain(object())


def test_domains_from_the_same_driver_wrap_the_same_connection():
    connection = DrivingConnection()
    driver = DriverWithConnection(connection)

    assert Domain(driver)._transport.connection is Domain(driver)._transport.connection is connection
