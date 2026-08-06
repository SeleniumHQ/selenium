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

import pytest

from selenium.webdriver.common.bidi.log import ConsoleLogEntry, JavascriptLogEntry
from selenium.webdriver.common.bidi.script import (
    ConsoleMessage,
    DomMutation,
    PinnedScript,
    Script,
    ScriptError,
    ScriptResult,
)


class FakeConnection:
    def __init__(self):
        self.commands = []
        self.added_callbacks = []
        self.removed_callbacks = []
        self._next_callback_id = 1
        self._next_preload_id = 1
        self._next_subscription_id = 1
        self.call_function_result = {
            "type": "success",
            "result": {"type": "number", "value": 2},
            "realm": "realm-1",
        }

    def add_callback(self, event_wrapper, callback):
        callback_id = self._next_callback_id
        self._next_callback_id += 1
        self.added_callbacks.append((callback_id, event_wrapper.event_class, callback))
        return callback_id

    def remove_callback(self, event_wrapper, callback_id):
        self.removed_callbacks.append((callback_id, event_wrapper.event_class))

    def execute(self, cmd):
        payload = next(cmd)
        self.commands.append(payload)

        if payload["method"] == "script.addPreloadScript":
            response = {"script": f"preload-{self._next_preload_id}"}
            self._next_preload_id += 1
        elif payload["method"] == "session.subscribe":
            response = {"subscription": f"subscription-{self._next_subscription_id}"}
            self._next_subscription_id += 1
        elif payload["method"] == "script.callFunction":
            response = self.call_function_result
        else:
            response = {}

        try:
            cmd.send(response)
        except StopIteration as exc:
            return exc.value

        raise AssertionError("BiDi command generator did not finish")

    def commands_named(self, method):
        return [c for c in self.commands if c["method"] == method]


def make_console_event(level="info", text="Hello, world!", method="log", with_stack=True):
    event = {
        "type": "console",
        "level": level,
        "method": method,
        "text": text,
        "timestamp": 1234,
        "args": [{"type": "string", "value": text}],
        "source": {"realm": "realm-1", "context": "ctx-1"},
    }
    if with_stack:
        event["stackTrace"] = {
            "callFrames": [
                {"functionName": "logIt", "url": "https://example.com/app.js", "lineNumber": 12, "columnNumber": 8},
                {"functionName": "", "url": "https://example.com/app.js", "lineNumber": 30, "columnNumber": 2},
            ]
        }
    return event


def make_javascript_error_event(text="Error: Not working"):
    return {
        "type": "javascript",
        "level": "error",
        "text": text,
        "timestamp": 5678,
        "source": {"realm": "realm-1", "context": "ctx-1"},
        "stackTrace": {
            "callFrames": [
                {"functionName": "boom", "url": "https://example.com/page.html", "lineNumber": 7, "columnNumber": 21},
            ]
        },
    }


def make_channel_message(script, payload):
    channel = script._dom_mutation_handlers._channel
    return {
        "channel": channel,
        "data": {"type": "string", "value": json.dumps(payload)},
        "source": {"realm": "realm-1", "context": "ctx-1"},
    }


def dispatch_event(conn, event):
    """Invoke the most recently subscribed callback as the WebSocket would."""
    assert conn.added_callbacks, "no event callback registered"
    conn.added_callbacks[-1][2](event)


def dispatch_to_all(conn, event):
    for _, _, callback in conn.added_callbacks:
        callback(event)


def test_add_console_handler_shapes_payload():
    conn = FakeConnection()
    script = Script(conn)
    messages = []

    script.add_console_handler(messages.append)
    dispatch_event(conn, make_console_event())

    assert conn.commands_named("session.subscribe") == [
        {"method": "session.subscribe", "params": {"events": ["log.entryAdded"]}}
    ]
    assert len(messages) == 1
    message = messages[0]
    assert isinstance(message, ConsoleMessage)
    assert message.level == "info"
    assert message.text == "Hello, world!"
    assert message.source == "https://example.com/app.js"
    assert message.line_number == 12
    assert message.column_number == 8
    assert "at logIt (https://example.com/app.js:12:8)" in message.stack_trace
    assert message.method == "log"
    assert message.timestamp == 1234


def test_add_error_handler_shapes_payload():
    conn = FakeConnection()
    script = Script(conn)
    errors = []

    script.add_error_handler(errors.append)
    dispatch_event(conn, make_javascript_error_event())

    assert len(errors) == 1
    error = errors[0]
    assert isinstance(error, ScriptError)
    assert error.message == "Error: Not working"
    assert error.source == "https://example.com/page.html"
    assert error.line_number == 7
    assert error.column_number == 21
    assert error.stack_trace == "    at boom (https://example.com/page.html:7:21)"


def test_console_handler_without_stack_trace():
    conn = FakeConnection()
    script = Script(conn)
    messages = []

    script.add_console_handler(messages.append)
    dispatch_event(conn, make_console_event(with_stack=False))

    message = messages[0]
    assert message.text == "Hello, world!"
    assert message.source is None
    assert message.line_number is None
    assert message.stack_trace is None


def test_legacy_handlers_keep_log_entry_payloads():
    conn = FakeConnection()
    script = Script(conn)
    console_entries = []
    error_entries = []

    script.add_console_message_handler(console_entries.append)
    script.add_javascript_error_handler(error_entries.append)

    dispatch_to_all(conn, make_console_event())
    dispatch_to_all(conn, make_javascript_error_event())

    assert len(console_entries) == 1
    assert isinstance(console_entries[0], ConsoleLogEntry)
    assert console_entries[0].text == "Hello, world!"
    assert len(error_entries) == 1
    assert isinstance(error_entries[0], JavascriptLogEntry)
    assert error_entries[0].text == "Error: Not working"


def test_handlers_filter_by_entry_type():
    conn = FakeConnection()
    script = Script(conn)
    messages = []
    errors = []

    script.add_console_handler(messages.append)
    script.add_error_handler(errors.append)

    dispatch_to_all(conn, make_console_event())
    dispatch_to_all(conn, make_javascript_error_event())

    assert len(messages) == 1
    assert len(errors) == 1


def test_console_and_error_handlers_share_one_subscription():
    conn = FakeConnection()
    script = Script(conn)

    console_id = script.add_console_handler(lambda message: None)
    error_id = script.add_error_handler(lambda error: None)
    assert len(conn.commands_named("session.subscribe")) == 1

    script.remove_console_handler(console_id)
    assert not conn.commands_named("session.unsubscribe")

    script.remove_error_handler(error_id)
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]


def test_clear_error_handlers_keeps_console_handlers():
    conn = FakeConnection()
    script = Script(conn)

    console_id = script.add_console_message_handler(lambda entry: None)
    script.add_error_handler(lambda error: None)
    script.add_javascript_error_handler(lambda entry: None)

    script.clear_error_handlers()

    removed_ids = {callback_id for callback_id, _ in conn.removed_callbacks}
    assert len(removed_ids) == 2
    assert console_id not in removed_ids
    assert not conn.commands_named("session.unsubscribe")

    script.clear_console_handlers()
    assert len(conn.commands_named("session.unsubscribe")) == 1


def test_dom_mutation_handler_defaults_to_attributes():
    conn = FakeConnection()
    script = Script(conn)
    mutations = []

    script.add_dom_mutation_handler(mutations.append)

    preloads = conn.commands_named("script.addPreloadScript")
    assert len(preloads) == 1
    (channel_arg,) = preloads[0]["params"]["arguments"]
    assert channel_arg["type"] == "channel"
    declaration = preloads[0]["params"]["functionDeclaration"]
    assert '{"attributes": true}' in declaration
    assert conn.commands_named("session.subscribe") == [
        {"method": "session.subscribe", "params": {"events": ["script.message"]}}
    ]

    dispatch_event(
        conn,
        make_channel_message(
            script, {"type": "attributes", "target": "el-1", "name": "style", "value": "", "oldValue": "display:none"}
        ),
    )
    dispatch_event(
        conn,
        make_channel_message(script, {"type": "childList", "target": "el-1", "addedNodes": [], "removedNodes": []}),
    )

    assert len(mutations) == 1
    mutation = mutations[0]
    assert isinstance(mutation, DomMutation)
    assert mutation.type == "attributes"
    assert mutation.element_id == "el-1"
    assert mutation.target == "el-1"
    assert mutation.attribute_name == "style"
    assert mutation.current_value == ""
    assert mutation.old_value == "display:none"


def test_dom_mutation_handler_payload_without_type_is_attributes():
    conn = FakeConnection()
    script = Script(conn)
    mutations = []

    script.add_dom_mutation_handler(mutations.append)
    dispatch_event(
        conn, make_channel_message(script, {"target": "el-9", "name": "class", "value": "on", "oldValue": "off"})
    )

    assert len(mutations) == 1
    assert mutations[0].type == "attributes"
    assert mutations[0].attribute_name == "class"


def test_dom_mutation_handler_child_list_and_character_data():
    conn = FakeConnection()
    script = Script(conn)
    mutations = []

    script.add_dom_mutation_handler(mutations.append, mutation_types=("childList", "characterData"))

    preloads = conn.commands_named("script.addPreloadScript")
    declaration = preloads[0]["params"]["functionDeclaration"]
    assert '{"characterData": true, "childList": true}' in declaration

    dispatch_event(
        conn,
        make_channel_message(
            script,
            {
                "type": "childList",
                "target": "el-2",
                "addedNodes": [{"nodeType": 1, "nodeName": "DIV", "id": "el-3"}],
                "removedNodes": [{"nodeType": 3, "nodeName": "#text", "value": "bye"}],
            },
        ),
    )
    dispatch_event(
        conn,
        make_channel_message(
            script, {"type": "characterData", "target": "el-2", "value": "after", "oldValue": "before"}
        ),
    )
    dispatch_event(
        conn,
        make_channel_message(
            script, {"type": "attributes", "target": "el-2", "name": "style", "value": "", "oldValue": None}
        ),
    )

    assert [m.type for m in mutations] == ["childList", "characterData"]
    child_list, character_data = mutations
    assert child_list.added_nodes == [{"nodeType": 1, "nodeName": "DIV", "id": "el-3"}]
    assert child_list.removed_nodes == [{"nodeType": 3, "nodeName": "#text", "value": "bye"}]
    assert character_data.current_value == "after"
    assert character_data.old_value == "before"


def test_second_dom_mutation_handler_only_observes_missing_types():
    conn = FakeConnection()
    script = Script(conn)

    script.add_dom_mutation_handler(lambda mutation: None)
    script.add_dom_mutation_handler(lambda mutation: None, mutation_types=("attributes", "childList"))

    preloads = conn.commands_named("script.addPreloadScript")
    assert len(preloads) == 2
    second_declaration = preloads[1]["params"]["functionDeclaration"]
    second_options = second_declaration.rsplit(")(channel, ", 1)[1]
    assert second_options.startswith('{"childList": true}')
    # Still a single script.message subscription.
    assert len(conn.commands_named("session.subscribe")) == 1


def test_clear_dom_mutation_handlers_removes_observers():
    conn = FakeConnection()
    script = Script(conn)

    script.add_dom_mutation_handler(lambda mutation: None)
    script.add_dom_mutation_handler(lambda mutation: None, mutation_types="childList")
    script.clear_dom_mutation_handlers()

    assert len(conn.removed_callbacks) == 2
    assert conn.commands_named("session.unsubscribe") == [
        {"method": "session.unsubscribe", "params": {"subscriptions": ["subscription-1"]}}
    ]
    removed_preloads = [c["params"]["script"] for c in conn.commands_named("script.removePreloadScript")]
    assert removed_preloads == ["preload-1", "preload-2"]


def test_dom_mutation_handler_rejects_unknown_type():
    script = Script(FakeConnection())

    with pytest.raises(ValueError, match="Unsupported DOM mutation type"):
        script.add_dom_mutation_handler(lambda mutation: None, mutation_types=("attribute",))


def test_pin_returns_pinned_script():
    conn = FakeConnection()
    script = Script(conn)

    pinned = script.pin("function helper() { return 1; }")

    assert isinstance(pinned, PinnedScript)
    assert isinstance(pinned, str)
    assert pinned == "preload-1"
    assert pinned.id == "preload-1"
    assert pinned.source == "function helper() { return 1; }"
    assert pinned.realm is None

    script.unpin(pinned)
    removed = conn.commands_named("script.removePreloadScript")
    assert removed == [{"method": "script.removePreloadScript", "params": {"script": "preload-1"}}]


def test_execute_with_pinned_script_returns_script_result():
    conn = FakeConnection()
    script = Script(conn)
    pinned = script.pin("function helper() { return 2; }")

    result = script.execute(pinned, "return helper();", context_id="ctx-1")

    assert isinstance(result, ScriptResult)
    assert result.error is None
    assert result.value == {"type": "number", "value": 2}
    assert result.realm == "realm-1"

    call = conn.commands_named("script.callFunction")[0]
    declaration = call["params"]["functionDeclaration"]
    assert "function helper() { return 2; }" in declaration
    assert "return helper();" in declaration
    assert call["params"]["target"] == {"context": "ctx-1"}


def test_execute_with_pinned_script_reports_error():
    conn = FakeConnection()
    conn.call_function_result = {
        "type": "exception",
        "realm": "realm-1",
        "exceptionDetails": {
            "text": "ReferenceError: nope is not defined",
            "lineNumber": 3,
            "columnNumber": 5,
            "stackTrace": {
                "callFrames": [{"functionName": "", "url": "about:blank", "lineNumber": 3, "columnNumber": 5}]
            },
        },
    }
    script = Script(conn)
    pinned = script.pin("function helper() { return 2; }")

    result = script.execute(pinned, "return nope();", context_id="ctx-1")

    assert result.value is None
    assert isinstance(result.error, ScriptError)
    assert result.error.message == "ReferenceError: nope is not defined"
    assert result.error.line_number == 3
    assert result.error.column_number == 5
    assert result.realm == "realm-1"


def test_execute_with_string_keeps_legacy_behavior():
    conn = FakeConnection()
    script = Script(conn)

    value = script.execute("() => 2", context_id="ctx-1")

    assert value == {"type": "number", "value": 2}
