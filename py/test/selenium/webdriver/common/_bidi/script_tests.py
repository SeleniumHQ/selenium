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

"""Mirror of ``../bidi/script_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import pytest

from selenium.webdriver.common._bidi.browser import Browser
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, CreateType
from selenium.webdriver.common._bidi.script import (
    ArrayLocalValue,
    BigIntValue,
    BooleanValue,
    ChannelProperties,
    ChannelValue,
    ContextTarget,
    DateLocalValue,
    EvaluateResultException,
    EvaluateResultSuccess,
    NullValue,
    NumberValue,
    ObjectLocalValue,
    RealmType,
    RemoteObjectReference,
    ResultOwnership,
    Script,
    SerializationOptions,
    SerializationOptionsIncludeShadowTree,
    StringValue,
)
from selenium.webdriver.common._bidi.serialization import UNSET
from selenium.webdriver.common.by import By


def _evaluate(driver, expression, context, *, await_promise=False, **kwargs):
    target = context if isinstance(context, ContextTarget) else ContextTarget(context=context)
    return Script(driver).evaluate(expression, target, await_promise, **kwargs)


def _tree_has_shadow_root(props):
    """Walk a typed ``NodeProperties`` tree looking for any shadow root."""
    if props is UNSET or props is None:
        return False
    if props.shadow_root is not UNSET and props.shadow_root is not None:
        return True
    children = props.children
    if children is UNSET or children is None:
        return False
    return any(_tree_has_shadow_root(child.value) for child in children)


def test_add_preload_script(driver, pages):
    function_declaration = "() => { window.preloadExecuted = true; }"

    script_id = Script(driver).add_preload_script(function_declaration).script
    assert isinstance(script_id, str)

    pages.load("blank.html")

    result = _evaluate(driver, "window.preloadExecuted", driver.current_window_handle)
    assert result.result.value is True


def test_add_preload_script_with_arguments(driver, pages):
    function_declaration = "(channelFunc) => { channelFunc('test_value'); window.preloadValue = 'received'; }"

    arguments = [ChannelValue(value=ChannelProperties(channel="test-channel", ownership=ResultOwnership.ROOT))]

    script_id = Script(driver).add_preload_script(function_declaration, arguments=arguments).script
    assert script_id is not None

    pages.load("blank.html")

    result = _evaluate(driver, "window.preloadValue", driver.current_window_handle)
    assert result.result.value == "received"


def test_add_preload_script_with_contexts(driver, pages):
    function_declaration = "() => { window.contextSpecific = true; }"
    contexts = [driver.current_window_handle]

    script_id = Script(driver).add_preload_script(function_declaration, contexts=contexts).script
    assert script_id is not None

    pages.load("blank.html")

    result = _evaluate(driver, "window.contextSpecific", driver.current_window_handle)
    assert result.result.value is True


def test_add_preload_script_with_user_contexts(driver, pages):
    function_declaration = "() => { window.contextSpecific = true; }"
    original_handle = driver.current_window_handle
    user_context = Browser(driver).create_user_context().user_context

    context1 = BrowsingContext(driver).create(type=CreateType.WINDOW, user_context=user_context).context
    driver.switch_to.window(context1)

    try:
        script_id = Script(driver).add_preload_script(function_declaration, user_contexts=[user_context]).script
        assert script_id is not None

        pages.load("blank.html")

        result = _evaluate(driver, "window.contextSpecific", driver.current_window_handle)
        assert result.result.value is True
    finally:
        driver.switch_to.window(original_handle)
        BrowsingContext(driver).close(context=context1)
        Browser(driver).remove_user_context(user_context=user_context)


def test_add_preload_script_with_sandbox(driver, pages):
    function_declaration = "() => { window.sandboxScript = true; }"

    script_id = Script(driver).add_preload_script(function_declaration, sandbox="test-sandbox").script
    assert script_id is not None

    pages.load("blank.html")

    result = _evaluate(driver, "window.sandboxScript", driver.current_window_handle)
    assert result.result.type == "undefined"

    target = ContextTarget(context=driver.current_window_handle, sandbox="test-sandbox")
    result = _evaluate(driver, "window.sandboxScript", target)
    assert result.result.value is True


def test_remove_preload_script(driver, pages):
    function_declaration = "() => { window.removableScript = true; }"

    script_id = Script(driver).add_preload_script(function_declaration).script
    Script(driver).remove_preload_script(script=script_id)

    pages.load("blank.html")

    result = _evaluate(driver, "typeof window.removableScript", driver.current_window_handle)
    assert result.result.value == "undefined"


def test_preload_script_runs_before_dom_content_loaded(driver, pages):
    function_declaration = """
        () => {
            document.addEventListener('DOMContentLoaded', () => {
                const div = document.createElement('div');
                div.id = 'injected-element';
                div.textContent = 'injected';
                document.body.appendChild(div);
            });
        }
    """
    script_id = Script(driver).add_preload_script(function_declaration).script

    try:
        pages.load("blank.html")
        assert driver.find_element(By.ID, "injected-element").text == "injected"
    finally:
        Script(driver).remove_preload_script(script=script_id)


def test_evaluate_expression(driver, pages):
    pages.load("blank.html")

    result = _evaluate(driver, "1 + 2", driver.current_window_handle)

    assert isinstance(result, EvaluateResultSuccess)
    assert result.realm is not None
    assert result.result.type == "number"
    assert result.result.value == 3


def test_evaluate_with_await_promise(driver, pages):
    pages.load("blank.html")

    result = _evaluate(driver, "Promise.resolve(42)", driver.current_window_handle, await_promise=True)

    assert result.result.type == "number"
    assert result.result.value == 42


def test_evaluate_with_exception(driver, pages):
    pages.load("blank.html")

    result = _evaluate(driver, "throw new Error('Test error')", driver.current_window_handle)

    assert isinstance(result, EvaluateResultException)
    assert "Test error" in result.exception_details.text


def test_evaluate_with_result_ownership(driver, pages):
    pages.load("blank.html")

    result = _evaluate(
        driver,
        "({ test: 'value' })",
        driver.current_window_handle,
        result_ownership=ResultOwnership.ROOT,
    )
    assert result.result.handle is not UNSET

    result = _evaluate(
        driver,
        "({ test: 'value' })",
        driver.current_window_handle,
        result_ownership=ResultOwnership.NONE,
    )
    assert result.result.handle is UNSET
    assert result.result is not None


def test_evaluate_with_serialization_options(driver, pages):
    pages.load("shadowRootPage.html")

    serialization_options = SerializationOptions(
        max_dom_depth=2,
        max_object_depth=2,
        include_shadow_tree=SerializationOptionsIncludeShadowTree.ALL,
    )

    result = _evaluate(
        driver,
        "document.body",
        driver.current_window_handle,
        serialization_options=serialization_options,
    )

    assert result.result.value.children
    assert _tree_has_shadow_root(result.result.value)


def test_evaluate_with_user_activation(driver, pages):
    pages.load("blank.html")

    result = _evaluate(
        driver,
        "navigator.userActivation ? navigator.userActivation.isActive : false",
        driver.current_window_handle,
        user_activation=True,
    )

    assert result.result.value is True


def test_call_function(driver, pages):
    pages.load("blank.html")

    result = Script(driver).call_function(
        "(a, b) => a + b",
        False,
        ContextTarget(context=driver.current_window_handle),
        arguments=[NumberValue(value=5), NumberValue(value=3)],
    )

    assert result.result.type == "number"
    assert result.result.value == 8


def test_call_function_with_this(driver, pages):
    pages.load("blank.html")

    result = Script(driver).call_function(
        "function() { return this.value; }",
        False,
        ContextTarget(context=driver.current_window_handle),
        this=ObjectLocalValue(value=[["value", NumberValue(value=20)]]),
    )

    assert result.result.type == "number"
    assert result.result.value == 20


def test_call_function_with_user_activation(driver, pages):
    pages.load("blank.html")

    result = Script(driver).call_function(
        "() => navigator.userActivation ? navigator.userActivation.isActive : false",
        False,
        ContextTarget(context=driver.current_window_handle),
        user_activation=True,
    )

    assert result.result.value is True


def test_call_function_with_serialization_options(driver, pages):
    pages.load("shadowRootPage.html")

    serialization_options = SerializationOptions(
        max_dom_depth=2,
        max_object_depth=2,
        include_shadow_tree=SerializationOptionsIncludeShadowTree.ALL,
    )

    result = Script(driver).call_function(
        "() => document.body",
        False,
        ContextTarget(context=driver.current_window_handle),
        serialization_options=serialization_options,
    )

    assert result.result.value.children
    assert _tree_has_shadow_root(result.result.value)


def test_call_function_with_exception(driver, pages):
    pages.load("blank.html")

    result = Script(driver).call_function(
        "() => { throw new Error('Function error'); }",
        False,
        ContextTarget(context=driver.current_window_handle),
    )

    assert isinstance(result, EvaluateResultException)
    assert "Function error" in result.exception_details.text


def test_call_function_with_await_promise(driver, pages):
    pages.load("blank.html")

    result = Script(driver).call_function(
        "() => Promise.resolve('async result')",
        True,
        ContextTarget(context=driver.current_window_handle),
    )

    assert result.result.type == "string"
    assert result.result.value == "async result"


def test_call_function_with_result_ownership(driver, pages):
    pages.load("blank.html")

    result = Script(driver).call_function(
        "function() { return { greet: 'Hi', number: 42 }; }",
        False,
        ContextTarget(context=driver.current_window_handle),
        result_ownership=ResultOwnership.ROOT,
    )

    assert result.result.type == "object"
    assert result.result.handle is not UNSET
    handle = result.result.handle

    result2 = Script(driver).call_function(
        "function() { return this.number + 1; }",
        False,
        ContextTarget(context=driver.current_window_handle),
        this=RemoteObjectReference(handle=handle),
    )

    assert result2.result.type == "number"
    assert result2.result.value == 43


def test_get_realms(driver, pages):
    pages.load("blank.html")

    realms = Script(driver).get_realms().realms

    assert len(realms) > 0
    assert all(hasattr(realm, "realm") for realm in realms)
    assert all(hasattr(realm, "origin") for realm in realms)
    assert all(hasattr(realm, "type") for realm in realms)


def test_get_realms_filtered_by_context(driver, pages):
    pages.load("blank.html")

    realms = Script(driver).get_realms(context=driver.current_window_handle).realms

    assert len(realms) > 0
    for realm in realms:
        if getattr(realm, "context", None) is not None:
            assert realm.context == driver.current_window_handle


def test_get_realms_filtered_by_type(driver, pages):
    pages.load("blank.html")

    realms = Script(driver).get_realms(type=RealmType.WINDOW).realms

    assert len(realms) > 0
    for realm in realms:
        assert realm.type == RealmType.WINDOW


def test_disown_handles(driver, pages):
    pages.load("blank.html")

    result = _evaluate(
        driver,
        "({foo: 'bar'})",
        driver.current_window_handle,
        result_ownership=ResultOwnership.ROOT,
    )
    handle = result.result.handle
    assert handle is not UNSET

    result_before = Script(driver).call_function(
        "function(obj) { return obj.foo; }",
        False,
        ContextTarget(context=driver.current_window_handle),
        arguments=[RemoteObjectReference(handle=handle)],
    )
    assert result_before.result.value == "bar"

    Script(driver).disown(handles=[handle], target=ContextTarget(context=driver.current_window_handle))

    with pytest.raises(Exception):
        Script(driver).call_function(
            "function(obj) { return obj.foo; }",
            False,
            ContextTarget(context=driver.current_window_handle),
            arguments=[RemoteObjectReference(handle=handle)],
        )


# The facade's ``driver.script.execute(fn, *py_args)`` converts Python values to LocalValues;
# below that conversion is done inline so call_function receives typed argument records directly.


def _call(driver, function_declaration, *arguments):
    return Script(driver).call_function(
        function_declaration,
        False,
        ContextTarget(context=driver.current_window_handle),
        arguments=list(arguments),
    )


def test_call_function_with_null_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (arg !== null) throw Error('expected null'); return arg; }",
        NullValue(),
    )

    assert result.result.type == "null"


def test_call_function_with_number_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (arg !== 1.4) throw Error('expected 1.4'); return arg; }",
        NumberValue(value=1.4),
    )

    assert result.result.type == "number"
    assert result.result.value == 1.4


def test_call_function_with_nan_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (!Number.isNaN(arg)) throw Error('expected NaN'); return arg; }",
        NumberValue(value="NaN"),
    )

    assert result.result.type == "number"
    assert result.result.value == "NaN"


def test_call_function_with_infinity_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (arg !== Infinity) throw Error('expected Infinity'); return arg; }",
        NumberValue(value="Infinity"),
    )

    assert result.result.type == "number"
    assert result.result.value == "Infinity"


def test_call_function_with_minus_infinity_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (arg !== -Infinity) throw Error('expected -Infinity'); return arg; }",
        NumberValue(value="-Infinity"),
    )

    assert result.result.type == "number"
    assert result.result.value == "-Infinity"


def test_call_function_with_bigint_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (arg !== 9007199254740992n) throw Error('expected bigint'); return arg; }",
        BigIntValue(value="9007199254740992"),
    )

    assert result.result.type == "bigint"
    assert result.result.value == "9007199254740992"


def test_call_function_with_boolean_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (arg !== true) throw Error('expected true'); return arg; }",
        BooleanValue(value=True),
    )

    assert result.result.type == "boolean"
    assert result.result.value is True


def test_call_function_with_string_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (arg !== 'hello world') throw Error('expected hello world'); return arg; }",
        StringValue(value="hello world"),
    )

    assert result.result.type == "string"
    assert result.result.value == "hello world"


def test_call_function_with_date_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (!(arg instanceof Date)) throw Error('expected Date');"
        " if (arg.getFullYear() !== 2023) throw Error('expected 2023'); return arg; }",
        DateLocalValue(value="2023-12-25T10:30:45"),
    )

    assert result.result.type == "date"
    assert "2023-12-25T10:30:45" in result.result.value


def test_call_function_with_array_argument(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(arg) => { if (!(arg instanceof Array)) throw Error('expected Array');"
        " if (arg.length !== 3) throw Error('expected length 3'); return arg; }",
        ArrayLocalValue(value=[NumberValue(value=1), NumberValue(value=2), NumberValue(value=3)]),
    )

    assert result.result.type == "array"
    assert len(result.result.value) == 3


def test_call_function_with_multiple_arguments(driver, pages):
    pages.load("blank.html")

    result = _call(
        driver,
        "(a, b, c) => { if (a !== 1) throw Error('a'); if (b !== 'test') throw Error('b');"
        " if (c !== true) throw Error('c'); return a + b.length + (c ? 1 : 0); }",
        NumberValue(value=1),
        StringValue(value="test"),
        BooleanValue(value=True),
    )

    assert result.result.type == "number"
    assert result.result.value == 6


def test_call_function_with_nested_object_argument(driver, pages):
    pages.load("blank.html")

    nested = ObjectLocalValue(
        value=[
            [
                "user",
                ObjectLocalValue(
                    value=[
                        ["name", StringValue(value="John")],
                        ["age", NumberValue(value=30)],
                        ["hobbies", ArrayLocalValue(value=[StringValue(value="reading"), StringValue(value="coding")])],
                    ]
                ),
            ],
            ["settings", ObjectLocalValue(value=[["theme", StringValue(value="dark")]])],
        ]
    )

    result = _call(
        driver,
        "(data) => ({ userName: data.user.name, userAge: data.user.age,"
        " hobbyCount: data.user.hobbies.length, theme: data.settings.theme })",
        nested,
    )

    assert result.result.type == "object"
    value_dict = {k: v.value for k, v in result.result.value}
    assert value_dict["userName"] == "John"
    assert value_dict["userAge"] == 30
    assert value_dict["hobbyCount"] == 2
