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

"""Unit tests for typed BiDi event delivery.

Commands reach their generated result type through ``Transport.execute``; a pushed event
reaches its generated payload type through the seam these tests cover. The subject is the
inbound half of the behavioral contract applied to events — a payload arrives as the type
the schema declares, a malformed one errors rather than arriving degraded, and an
undeclared field is kept or dropped by whether the type is extensible.

Driven through a stand-in connection, so the assertions are about the layer rather than
about any browser's event timing.
"""

import logging

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.log import ConsoleLogEntry, JavascriptLogEntry, Level, Log
from selenium.webdriver.common._bidi.network import BeforeRequestSentParameters, Network
from selenium.webdriver.common._bidi.serialization import BiDiSerializationError
from selenium.webdriver.common._bidi.transport import Transport


class RecordingConnection:
    """Stands in for ``WebSocketConnection``'s callback registry, minus the socket.

    Mirrors the real ``add_callback``/``remove_callback`` contract: the event object supplies
    the wire name through ``event_class`` and deserializes each payload through ``from_json``.
    ``push`` replays one inbound event frame synchronously, so a failure surfaces in the test
    rather than on a daemon thread.
    """

    def __init__(self):
        self.callbacks = {}

    def add_callback(self, event, callback):
        def _callback(params):
            callback(event.from_json(params))

        self.callbacks.setdefault(event.event_class, []).append(_callback)
        return id(_callback)

    def remove_callback(self, event, callback_id):
        for callback in self.callbacks.get(event.event_class, []):
            if id(callback) == callback_id:
                self.callbacks[event.event_class].remove(callback)
                return

    def push(self, method, params):
        for callback in list(self.callbacks.get(method, [])):
            callback(params)


@pytest.fixture
def connection():
    return RecordingConnection()


def _domain(cls, connection):
    return cls(Transport(connection))


def _console_entry(**overrides):
    """A well-formed ``log.entryAdded`` payload (the ``console`` variant of ``log.Entry``)."""
    payload = {
        "type": "console",
        "level": "info",
        "source": {"realm": "realm-1"},
        "text": "hello",
        "timestamp": 1700000000000,
        "method": "log",
        "args": [],
    }
    payload.update(overrides)
    return payload


_TIMINGS = dict.fromkeys(
    (
        "timeOrigin",
        "requestTime",
        "redirectStart",
        "redirectEnd",
        "fetchStart",
        "dnsStart",
        "dnsEnd",
        "connectStart",
        "connectEnd",
        "tlsStart",
        "requestStart",
        "responseStart",
        "responseEnd",
    ),
    0.0,
)


def _before_request_sent(cookie_extras=None):
    """A well-formed ``network.beforeRequestSent`` payload, whose nested cookie is extensible."""
    cookie = {
        "name": "sid",
        "value": {"type": "string", "value": "abc"},
        "domain": "example.com",
        "path": "/",
        "size": 3,
        "httpOnly": False,
        "secure": True,
        "sameSite": "lax",
    }
    cookie.update(cookie_extras or {})
    return {
        "context": "ctx-1",
        "isBlocked": False,
        "navigation": None,
        "redirectCount": 0,
        "timestamp": 1700000000000,
        "request": {
            "request": "req-1",
            "url": "https://example.com/",
            "method": "GET",
            "headers": [],
            "cookies": [cookie],
            "headersSize": 0,
            "bodySize": None,
            "destination": "",
            "initiatorType": None,
            "timings": _TIMINGS,
        },
    }


# --- an event arrives as the type the schema declares ---


def test_a_pushed_event_arrives_as_its_generated_payload_type(connection):
    seen = []
    _domain(Log, connection).on("entry_added", seen.append)

    connection.push("log.entryAdded", _console_entry())

    (entry,) = seen
    assert isinstance(entry, ConsoleLogEntry)
    assert entry.text == "hello"
    assert entry.method == "log"


def test_a_pushed_event_resolves_its_union_variant(connection):
    # log.entryAdded carries the log.Entry union; the payload's discriminator picks the variant.
    seen = []
    _domain(Log, connection).on("entry_added", seen.append)

    connection.push(
        "log.entryAdded",
        {"type": "javascript", "level": "error", "source": {"realm": "r"}, "text": "boom", "timestamp": 1},
    )

    (entry,) = seen
    assert isinstance(entry, JavascriptLogEntry)


def test_an_enum_in_an_event_payload_is_restored_to_its_member(connection):
    seen = []
    _domain(Log, connection).on("entry_added", seen.append)

    connection.push("log.entryAdded", _console_entry(level="warn"))

    assert seen[0].level is Level.WARN


def test_a_nested_record_in_an_event_payload_is_typed(connection):
    seen = []
    _domain(Network, connection).on("before_request_sent", seen.append)

    connection.push("network.beforeRequestSent", _before_request_sent())

    (event,) = seen
    assert isinstance(event, BeforeRequestSentParameters)
    assert event.request.cookies[0].name == "sid"


# --- a malformed payload errors rather than arriving degraded ---


def test_an_event_payload_missing_a_required_field_raises(connection):
    payload = _console_entry()
    del payload["timestamp"]
    _domain(Log, connection).on("entry_added", lambda entry: None)

    with pytest.raises(BiDiSerializationError, match=r"missing required 'timestamp'"):
        connection.push("log.entryAdded", payload)


def test_an_event_payload_with_a_wrong_typed_field_raises(connection):
    _domain(Log, connection).on("entry_added", lambda entry: None)

    with pytest.raises(BiDiSerializationError, match=r"expected int, got str"):
        connection.push("log.entryAdded", _console_entry(timestamp="not-a-number"))


def test_a_non_object_event_payload_raises(connection):
    # log.Entry's arms are all objects, so a scalar can match no variant.
    _domain(Log, connection).on("entry_added", lambda entry: None)

    with pytest.raises(BiDiSerializationError, match=r"Entry expected an object on the wire"):
        connection.push("log.entryAdded", "not-an-object")


def test_a_rejected_event_payload_is_logged_as_well_as_raised(connection, caplog):
    # A callback runs on its own daemon thread, where a raise reaches the user only through
    # threading.excepthook. Without the log, a payload the contract rejects is indistinguishable
    # from an event that never arrived.
    _domain(Log, connection).on("entry_added", lambda entry: None)

    with caplog.at_level(logging.ERROR), pytest.raises(BiDiSerializationError):
        connection.push("log.entryAdded", _console_entry(timestamp="not-a-number"))

    assert any("log.entryAdded" in record.getMessage() for record in caplog.records)


# --- an undeclared field follows the type's extensibility ---


def test_an_undeclared_field_on_a_non_extensible_event_payload_warns_and_is_dropped(connection, caplog):
    seen = []
    _domain(Log, connection).on("entry_added", seen.append)

    with caplog.at_level(logging.WARNING):
        connection.push("log.entryAdded", _console_entry(somethingNew="from a newer spec"))

    assert not hasattr(seen[0], "something_new")
    assert any("somethingNew" in record.getMessage() for record in caplog.records)


def test_an_undeclared_field_on_a_nested_extensible_type_is_retained(connection):
    seen = []
    _domain(Network, connection).on("before_request_sent", seen.append)

    connection.push("network.beforeRequestSent", _before_request_sent({"partitionKey": "pk-1"}))

    assert seen[0].request.cookies[0].extensions == {"partitionKey": "pk-1"}


# --- registration surface ---


def test_an_event_may_be_named_by_its_wire_method(connection):
    seen = []
    _domain(Log, connection).on("log.entryAdded", seen.append)

    connection.push("log.entryAdded", _console_entry())

    assert len(seen) == 1


def test_an_unknown_event_name_is_a_caller_error(connection):
    # Not a BiDiSerializationError: nothing came off the wire, the caller named an event
    # this domain does not declare.
    with pytest.raises(WebDriverException, match=r"Log has no event 'entry_removed'"):
        _domain(Log, connection).on("entry_removed", lambda entry: None)


def test_an_event_from_another_domain_is_not_accepted(connection):
    with pytest.raises(WebDriverException, match=r"Log has no event 'network.beforeRequestSent'"):
        _domain(Log, connection).on("network.beforeRequestSent", lambda entry: None)


def test_a_removed_callback_stops_receiving_events(connection):
    seen = []
    log = _domain(Log, connection)
    callback_id = log.on("entry_added", seen.append)

    log.off("entry_added", callback_id)
    connection.push("log.entryAdded", _console_entry())

    assert seen == []


def test_several_callbacks_on_one_event_all_receive_it(connection):
    first, second = [], []
    log = _domain(Log, connection)
    log.on("entry_added", first.append)
    log.on("entry_added", second.append)

    connection.push("log.entryAdded", _console_entry())

    assert len(first) == 1
    assert len(second) == 1
