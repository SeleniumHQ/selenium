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

import math
from unittest.mock import MagicMock

import pytest

from selenium.common.exceptions import JavascriptException, WebDriverException
from selenium.webdriver.remote.script import (
    PinnedScript,
    Script,
    ScriptResult,
    deserialize_result,
    serialize_argument,
)
from selenium.webdriver.remote.shadowroot import ShadowRoot
from selenium.webdriver.remote.webelement import WebElement


@pytest.fixture
def driver():
    driver = MagicMock()
    driver.current_window_handle = "context-1"
    driver.create_web_element.side_effect = lambda element_id: WebElement(driver, element_id)
    driver._shadowroot_cls = ShadowRoot
    return driver


@pytest.fixture
def implementation():
    return MagicMock()


@pytest.fixture
def script(implementation, driver):
    return Script(implementation, driver)


@pytest.mark.parametrize(
    ("remote_value", "expected"),
    [
        ({"type": "undefined"}, None),
        ({"type": "null"}, None),
        ({"type": "string", "value": "hi"}, "hi"),
        ({"type": "boolean", "value": False}, False),
        ({"type": "number", "value": 1.5}, 1.5),
        ({"type": "number", "value": "Infinity"}, math.inf),
        ({"type": "number", "value": "-Infinity"}, -math.inf),
        ({"type": "bigint", "value": "9007199254740993"}, 9007199254740993),
        ({"type": "date", "value": "2026-10-30T10:00:00.000Z"}, "2026-10-30T10:00:00.000Z"),
        ({"type": "array", "value": [{"type": "number", "value": 1}, {"type": "null"}]}, [1, None]),
        ({"type": "set", "value": [{"type": "string", "value": "a"}]}, ["a"]),
        (
            {"type": "object", "value": [["a", {"type": "number", "value": 1}], ["b", {"type": "array", "value": []}]]},
            {"a": 1, "b": []},
        ),
        (
            {"type": "map", "value": [[{"type": "number", "value": 1}, {"type": "string", "value": "one"}]]},
            {"1": "one"},
        ),
        ({"type": "window", "value": {"context": "context-2"}}, "context-2"),
        ({"type": "function"}, None),
        ({"type": "promise"}, None),
    ],
)
def test_deserialize_result_matches_execute_script(remote_value, expected):
    assert deserialize_result(remote_value) == expected


def test_deserialize_result_nan():
    assert math.isnan(deserialize_result({"type": "number", "value": "NaN"}))


def test_deserialize_result_returns_elements_as_web_elements(driver):
    node = {"type": "node", "sharedId": "element-1", "value": {"nodeType": 1, "localName": "div"}}

    element = deserialize_result({"type": "array", "value": [node]}, driver)[0]

    assert isinstance(element, WebElement)
    assert element.id == "element-1"


def test_deserialize_result_returns_shadow_roots(driver):
    node = {"type": "node", "sharedId": "shadow-1", "value": {"nodeType": 11, "mode": "open"}}

    shadow_root = deserialize_result(node, driver)

    assert isinstance(shadow_root, ShadowRoot)
    assert shadow_root.id == "shadow-1"
    assert serialize_argument(shadow_root) == {"sharedId": "shadow-1"}


def test_deserialize_result_drops_plain_document_fragments(driver):
    fragment = {"type": "node", "sharedId": "fragment-1", "value": {"nodeType": 11}}

    assert deserialize_result(fragment, driver) is None


def test_deserialize_result_drops_non_element_nodes(driver):
    text_node = {"type": "node", "sharedId": "text-1", "value": {"nodeType": 3}}

    assert deserialize_result(text_node, driver) is None


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (None, {"type": "null"}),
        (True, {"type": "boolean", "value": True}),
        (2, {"type": "number", "value": 2}),
        (2**60, {"type": "bigint", "value": str(2**60)}),
        (float("-inf"), {"type": "number", "value": "-Infinity"}),
        ("s", {"type": "string", "value": "s"}),
        ((1,), {"type": "array", "value": [{"type": "number", "value": 1}]}),
        ({"k": None}, {"type": "object", "value": [["k", {"type": "null"}]]}),
    ],
)
def test_serialize_argument(value, expected):
    assert serialize_argument(value) == expected


def test_serialize_argument_passes_elements_by_reference(driver):
    assert serialize_argument(WebElement(driver, "element-1")) == {"sharedId": "element-1"}


def test_execute_converts_arguments_and_result(script, implementation, driver):
    implementation.call_function.return_value = {
        "type": "success",
        "result": {"type": "node", "sharedId": "element-1", "value": {"nodeType": 1}},
        "realm": "realm-1",
    }

    result = script.execute("(el, n) => el", WebElement(driver, "element-0"), 3)

    implementation.call_function.assert_called_once_with(
        function_declaration="(el, n) => el",
        await_promise=True,
        target={"context": "context-1"},
        arguments=[{"sharedId": "element-0"}, {"type": "number", "value": 3}],
    )
    assert isinstance(result, WebElement)
    assert result.id == "element-1"


def test_execute_uses_given_window(script, implementation):
    implementation.call_function.return_value = {"type": "success", "result": {"type": "undefined"}}

    assert script.execute("() => {}", context_id="context-9") is None
    assert implementation.call_function.call_args.kwargs["target"] == {"context": "context-9"}
    assert implementation.call_function.call_args.kwargs["arguments"] is None


def test_execute_raises_javascript_exception(script, implementation):
    implementation.call_function.return_value = {
        "type": "exception",
        "exceptionDetails": {"text": "Error: boom"},
        "realm": "realm-1",
    }

    with pytest.raises(JavascriptException, match="boom") as exc_info:
        script.execute("() => { throw new Error('boom') }")
    assert isinstance(exc_info.value, WebDriverException)


def test_execute_pinned_converts_script_result_value(script, implementation):
    pinned = PinnedScript("preload-1", source="function f() { return 1 }")
    implementation.execute.return_value = ScriptResult(value={"type": "number", "value": 1}, realm="realm-1")

    result = script.execute(pinned, "return f();")

    implementation.execute.assert_called_once_with(pinned, "return f();", context_id=None)
    assert result.value == 1
    assert result.error is None


def test_pin_and_unpin_delegate(script, implementation):
    implementation.pin.return_value = PinnedScript("preload-1", source="() => {}")

    pinned = script.pin("() => {}")
    script.unpin(pinned)

    assert pinned.id == "preload-1"
    implementation.pin.assert_called_once_with("() => {}")
    implementation.unpin.assert_called_once_with(pinned)


def test_keyword_arguments_keep_their_previous_names(script, implementation):
    implementation.call_function.return_value = {"type": "success", "result": {"type": "number", "value": 1}}

    script.pin(function_declaration="() => {}")
    script.unpin(script_id="preload-1")
    assert script.execute(function_declaration="() => 1") == 1

    implementation.pin.assert_called_once_with("() => {}")
    implementation.unpin.assert_called_once_with("preload-1")


def test_pinned_script_repr_has_no_realm():
    assert repr(PinnedScript("preload-1", realm="realm-1")) == "PinnedScript(id='preload-1')"


def test_pinned_script_realm_is_deprecated():
    with pytest.warns(DeprecationWarning, match="PinnedScript.realm"):
        assert PinnedScript("preload-1", realm="realm-1").realm == "realm-1"


@pytest.mark.parametrize(
    ("name", "replacement"),
    [
        ("evaluate", "driver.script.execute()"),
        ("call_function", "driver.script.execute()"),
        ("add_preload_script", "driver.script.pin()"),
        ("remove_preload_script", "driver.script.unpin()"),
        ("get_realms", "no supported replacement"),
        ("disown", "no supported replacement"),
    ],
)
def test_protocol_commands_still_work_but_are_deprecated(script, implementation, name, replacement):
    with pytest.warns(DeprecationWarning, match=rf"driver\.script\.{name} is deprecated") as record:
        command = getattr(script, name)

    assert command is getattr(implementation, name)
    assert replacement in str(record[0].message)


def test_missing_attribute_still_raises(implementation, driver):
    del implementation.no_such_command
    script = Script(implementation, driver)

    with pytest.raises(AttributeError):
        _ = script.no_such_command


def test_dunder_lookups_are_not_forwarded(script):
    with pytest.raises(AttributeError):
        _ = script.__deepcopy__


@pytest.mark.parametrize(
    ("method", "args"),
    [
        ("add_console_handler", (print,)),
        ("remove_console_handler", (1,)),
        ("clear_console_handlers", ()),
        ("add_console_message_handler", (print,)),
        ("remove_console_message_handler", (1,)),
        ("add_error_handler", (print,)),
        ("remove_error_handler", (1,)),
        ("clear_error_handlers", ()),
        ("add_javascript_error_handler", (print,)),
        ("remove_javascript_error_handler", (1,)),
        ("remove_dom_mutation_handler", (1,)),
        ("clear_dom_mutation_handlers", ()),
    ],
)
def test_handler_methods_delegate_without_warning(script, implementation, method, args, recwarn):
    getattr(script, method)(*args)

    getattr(implementation, method).assert_called_once_with(*args)
    assert not [w for w in recwarn if issubclass(w.category, DeprecationWarning)]


def test_add_dom_mutation_handler_passes_mutation_types(script, implementation):
    script.add_dom_mutation_handler(print, ("childList",))

    implementation.add_dom_mutation_handler.assert_called_once_with(print, ("childList",))
