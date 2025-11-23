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

import pytest

from selenium.webdriver.common.bidi.log import LogLevel
from selenium.webdriver.common.bidi.script import RealmType, ResultOwnership
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def has_shadow_root(node):
    if isinstance(node, dict):
        shadow_root = node.get("shadowRoot")
        if shadow_root and isinstance(shadow_root, dict):
            return True

        children = node.get("children", [])
        for child in children:
            if "value" in child and has_shadow_root(child["value"]):
                return True

    return False


def test_logs_console_messages(driver, pages):
    pages.load("bidi/logEntryAdded.html")

    log_entries = []
    driver.script.add_console_message_handler(log_entries.append)

    driver.find_element(By.ID, "jsException").click()
    driver.find_element(By.ID, "consoleLog").click()

    WebDriverWait(driver, 5).until(lambda _: log_entries)

    log_entry = log_entries[0]
    assert log_entry.level == LogLevel.INFO
    assert log_entry.method == "log"
    assert log_entry.text == "Hello, world!"
    assert log_entry.type_ == "console"


def test_logs_console_errors(driver, pages):
    pages.load("bidi/logEntryAdded.html")
    log_entries = []

    def log_error(entry):
        if entry.level == LogLevel.ERROR:
            log_entries.append(entry)

    driver.script.add_console_message_handler(log_error)

    driver.find_element(By.ID, "consoleLog").click()
    driver.find_element(By.ID, "consoleError").click()

    WebDriverWait(driver, 5).until(lambda _: log_entries)

    assert len(log_entries) == 1

    log_entry = log_entries[0]
    assert log_entry.level == LogLevel.ERROR
    assert log_entry.method == "error"
    assert log_entry.text == "I am console error"
    assert log_entry.type_ == "console"


def test_logs_multiple_console_messages(driver, pages):
    pages.load("bidi/logEntryAdded.html")

    log_entries = []
    driver.script.add_console_message_handler(log_entries.append)
    driver.script.add_console_message_handler(log_entries.append)

    driver.find_element(By.ID, "jsException").click()
    driver.find_element(By.ID, "consoleLog").click()

    WebDriverWait(driver, 5).until(lambda _: len(log_entries) > 1)
    assert len(log_entries) == 2


def test_removes_console_message_handler(driver, pages):
    pages.load("bidi/logEntryAdded.html")

    log_entries1 = []
    log_entries2 = []

    id = driver.script.add_console_message_handler(log_entries1.append)
    driver.script.add_console_message_handler(log_entries2.append)

    driver.find_element(By.ID, "consoleLog").click()
    WebDriverWait(driver, 5).until(lambda _: len(log_entries1) and len(log_entries2))

    driver.script.remove_console_message_handler(id)
    driver.find_element(By.ID, "consoleLog").click()

    WebDriverWait(driver, 5).until(lambda _: len(log_entries2) == 2)
    assert len(log_entries1) == 1


def test_javascript_error_messages(driver, pages):
    pages.load("bidi/logEntryAdded.html")

    log_entries = []
    driver.script.add_javascript_error_handler(log_entries.append)

    driver.find_element(By.ID, "jsException").click()
    WebDriverWait(driver, 5).until(lambda _: log_entries)

    log_entry = log_entries[0]
    assert log_entry.text == "Error: Not working"
    assert log_entry.level == LogLevel.ERROR
    assert log_entry.type_ == "javascript"


def test_removes_javascript_message_handler(driver, pages):
    pages.load("bidi/logEntryAdded.html")

    log_entries1 = []
    log_entries2 = []

    id = driver.script.add_javascript_error_handler(log_entries1.append)
    driver.script.add_javascript_error_handler(log_entries2.append)

    driver.find_element(By.ID, "jsException").click()
    WebDriverWait(driver, 5).until(lambda _: len(log_entries1) and len(log_entries2))

    driver.script.remove_javascript_error_handler(id)
    driver.find_element(By.ID, "jsException").click()

    WebDriverWait(driver, 5).until(lambda _: len(log_entries2) == 2)
    assert len(log_entries1) == 1


def test_add_preload_script(driver, pages):
    """Test adding a preload script."""
    function_declaration = "() => { window.preloadExecuted = true; }"

    script_id = driver.script._add_preload_script(function_declaration)
    assert script_id is not None
    assert isinstance(script_id, str)

    # Navigate to a page to trigger the preload script
    pages.load("blank.html")

    # Check if the preload script was executed
    result = driver.script._evaluate(
        "window.preloadExecuted", {"context": driver.current_window_handle}, await_promise=False
    )
    assert result.result["value"] is True


def test_add_preload_script_with_arguments(driver, pages):
    """Test adding a preload script with channel arguments."""
    function_declaration = "(channelFunc) => { channelFunc('test_value'); window.preloadValue = 'received'; }"

    arguments = [{"type": "channel", "value": {"channel": "test-channel", "ownership": "root"}}]

    script_id = driver.script._add_preload_script(function_declaration, arguments=arguments)
    assert script_id is not None

    pages.load("blank.html")

    result = driver.script._evaluate(
        "window.preloadValue", {"context": driver.current_window_handle}, await_promise=False
    )
    assert result.result["value"] == "received"


def test_add_preload_script_with_contexts(driver, pages):
    """Test adding a preload script with specific contexts."""
    function_declaration = "() => { window.contextSpecific = true; }"
    contexts = [driver.current_window_handle]

    script_id = driver.script._add_preload_script(function_declaration, contexts=contexts)
    assert script_id is not None

    pages.load("blank.html")

    result = driver.script._evaluate(
        "window.contextSpecific", {"context": driver.current_window_handle}, await_promise=False
    )
    assert result.result["value"] is True


def test_add_preload_script_with_user_contexts(driver, pages):
    """Test adding a preload script with user contexts."""
    function_declaration = "() => { window.contextSpecific = true; }"
    user_context = driver.browser.create_user_context()

    context1 = driver.browsing_context.create(type="window", user_context=user_context)
    driver.switch_to.window(context1)

    user_contexts = [user_context]

    script_id = driver.script._add_preload_script(function_declaration, user_contexts=user_contexts)
    assert script_id is not None

    pages.load("blank.html")

    result = driver.script._evaluate(
        "window.contextSpecific", {"context": driver.current_window_handle}, await_promise=False
    )
    assert result.result["value"] is True


def test_add_preload_script_with_sandbox(driver, pages):
    """Test adding a preload script with sandbox."""
    function_declaration = "() => { window.sandboxScript = true; }"

    script_id = driver.script._add_preload_script(function_declaration, sandbox="test-sandbox")
    assert script_id is not None

    pages.load("blank.html")

    # calling evaluate without sandbox should return undefined
    result = driver.script._evaluate(
        "window.sandboxScript", {"context": driver.current_window_handle}, await_promise=False
    )
    assert result.result["type"] == "undefined"

    # calling evaluate within the sandbox should return True
    result = driver.script._evaluate(
        "window.sandboxScript",
        {"context": driver.current_window_handle, "sandbox": "test-sandbox"},
        await_promise=False,
    )
    assert result.result["value"] is True


def test_add_preload_script_invalid_arguments(driver):
    """Test that providing both contexts and user_contexts raises an error."""
    function_declaration = "() => {}"

    with pytest.raises(ValueError, match="Cannot specify both contexts and user_contexts"):
        driver.script._add_preload_script(function_declaration, contexts=["context1"], user_contexts=["user1"])


def test_remove_preload_script(driver, pages):
    """Test removing a preload script."""
    function_declaration = "() => { window.removableScript = true; }"

    script_id = driver.script._add_preload_script(function_declaration)
    driver.script._remove_preload_script(script_id=script_id)

    # Navigate to a page after removing the script
    pages.load("blank.html")

    # The script should not have executed
    result = driver.script._evaluate(
        "typeof window.removableScript", {"context": driver.current_window_handle}, await_promise=False
    )
    assert result.result["value"] == "undefined"


def test_evaluate_expression(driver, pages):
    """Test evaluating a simple expression."""
    pages.load("blank.html")

    result = driver.script._evaluate("1 + 2", {"context": driver.current_window_handle}, await_promise=False)

    assert result.realm is not None
    assert result.result["type"] == "number"
    assert result.result["value"] == 3
    assert result.exception_details is None


def test_evaluate_with_await_promise(driver, pages):
    """Test evaluating an expression that returns a promise."""
    pages.load("blank.html")

    result = driver.script._evaluate(
        "Promise.resolve(42)", {"context": driver.current_window_handle}, await_promise=True
    )

    assert result.result["type"] == "number"
    assert result.result["value"] == 42


def test_evaluate_with_exception(driver, pages):
    """Test evaluating an expression that throws an exception."""
    pages.load("blank.html")

    result = driver.script._evaluate(
        "throw new Error('Test error')", {"context": driver.current_window_handle}, await_promise=False
    )

    assert result.exception_details is not None
    assert "Test error" in str(result.exception_details)


def test_evaluate_with_result_ownership(driver, pages):
    """Test evaluating with different result ownership settings."""
    pages.load("blank.html")

    # Test with ROOT ownership
    result = driver.script._evaluate(
        "({ test: 'value' })",
        {"context": driver.current_window_handle},
        await_promise=False,
        result_ownership=ResultOwnership.ROOT,
    )

    # ROOT result ownership should return a handle
    assert "handle" in result.result

    # Test with NONE ownership
    result = driver.script._evaluate(
        "({ test: 'value' })",
        {"context": driver.current_window_handle},
        await_promise=False,
        result_ownership=ResultOwnership.NONE,
    )

    assert "handle" not in result.result
    assert result.result is not None


def test_evaluate_with_serialization_options(driver, pages):
    """Test evaluating with serialization options."""
    pages.load("shadowRootPage.html")

    serialization_options = {"maxDomDepth": 2, "maxObjectDepth": 2, "includeShadowTree": "all"}

    result = driver.script._evaluate(
        "document.body",
        {"context": driver.current_window_handle},
        await_promise=False,
        serialization_options=serialization_options,
    )
    root_node = result.result["value"]

    # maxDomDepth will contain a children property
    assert "children" in result.result["value"]
    # the page will have atleast one shadow root
    assert has_shadow_root(root_node)


def test_evaluate_with_user_activation(driver, pages):
    """Test evaluating with user activation."""
    pages.load("blank.html")

    result = driver.script._evaluate(
        "navigator.userActivation ? navigator.userActivation.isActive : false",
        {"context": driver.current_window_handle},
        await_promise=False,
        user_activation=True,
    )

    # the value should be True if user activation is active
    assert result.result["value"] is True


def test_call_function(driver, pages):
    """Test calling a function."""
    pages.load("blank.html")

    result = driver.script._call_function(
        "(a, b) => a + b",
        await_promise=False,
        target={"context": driver.current_window_handle},
        arguments=[{"type": "number", "value": 5}, {"type": "number", "value": 3}],
    )

    assert result.result["type"] == "number"
    assert result.result["value"] == 8


def test_call_function_with_this(driver, pages):
    """Test calling a function with a specific 'this' value."""
    pages.load("blank.html")

    # First set up an object
    driver.script._evaluate(
        "window.testObj = { value: 10 }", {"context": driver.current_window_handle}, await_promise=False
    )

    result = driver.script._call_function(
        "function() { return this.value; }",
        await_promise=False,
        target={"context": driver.current_window_handle},
        this={"type": "object", "value": [["value", {"type": "number", "value": 20}]]},
    )

    assert result.result["type"] == "number"
    assert result.result["value"] == 20


def test_call_function_with_user_activation(driver, pages):
    """Test calling a function with user activation."""
    pages.load("blank.html")

    result = driver.script._call_function(
        "() => navigator.userActivation ? navigator.userActivation.isActive : false",
        await_promise=False,
        target={"context": driver.current_window_handle},
        user_activation=True,
    )

    # the value should be True if user activation is active
    assert result.result["value"] is True


def test_call_function_with_serialization_options(driver, pages):
    """Test calling a function with serialization options."""
    pages.load("shadowRootPage.html")

    serialization_options = {"maxDomDepth": 2, "maxObjectDepth": 2, "includeShadowTree": "all"}

    result = driver.script._call_function(
        "() => document.body",
        await_promise=False,
        target={"context": driver.current_window_handle},
        serialization_options=serialization_options,
    )

    root_node = result.result["value"]

    # maxDomDepth will contain a children property
    assert "children" in result.result["value"]
    # the page will have atleast one shadow root
    assert has_shadow_root(root_node)


def test_call_function_with_exception(driver, pages):
    """Test calling a function that throws an exception."""
    pages.load("blank.html")

    result = driver.script._call_function(
        "() => { throw new Error('Function error'); }",
        await_promise=False,
        target={"context": driver.current_window_handle},
    )

    assert result.exception_details is not None
    assert "Function error" in str(result.exception_details)


def test_call_function_with_await_promise(driver, pages):
    """Test calling a function that returns a promise."""
    pages.load("blank.html")

    result = driver.script._call_function(
        "() => Promise.resolve('async result')", await_promise=True, target={"context": driver.current_window_handle}
    )

    assert result.result["type"] == "string"
    assert result.result["value"] == "async result"


def test_call_function_with_result_ownership(driver, pages):
    """Test calling a function with different result ownership settings."""
    pages.load("blank.html")

    # Call a function that returns an object with ownership "root"
    result = driver.script._call_function(
        "function() { return { greet: 'Hi', number: 42 }; }",
        await_promise=False,
        target={"context": driver.current_window_handle},
        result_ownership="root",
    )

    # Verify that a handle is returned
    assert result.result["type"] == "object"
    assert "handle" in result.result
    handle = result.result["handle"]

    # Use the handle in another function call
    result2 = driver.script._call_function(
        "function() { return this.number + 1; }",
        await_promise=False,
        target={"context": driver.current_window_handle},
        this={"handle": handle},
    )

    assert result2.result["type"] == "number"
    assert result2.result["value"] == 43


def test_get_realms(driver, pages):
    """Test getting all realms."""
    pages.load("blank.html")

    realms = driver.script._get_realms()

    assert len(realms) > 0
    assert all(hasattr(realm, "realm") for realm in realms)
    assert all(hasattr(realm, "origin") for realm in realms)
    assert all(hasattr(realm, "type") for realm in realms)


def test_get_realms_filtered_by_context(driver, pages):
    """Test getting realms filtered by context."""
    pages.load("blank.html")

    realms = driver.script._get_realms(context=driver.current_window_handle)

    assert len(realms) > 0
    # All realms should be associated with the specified context
    for realm in realms:
        if realm.context is not None:
            assert realm.context == driver.current_window_handle


def test_get_realms_filtered_by_type(driver, pages):
    """Test getting realms filtered by type."""
    pages.load("blank.html")

    realms = driver.script._get_realms(type=RealmType.WINDOW)

    assert len(realms) > 0
    # All realms should be of the WINDOW type
    for realm in realms:
        assert realm.type == RealmType.WINDOW


def test_disown_handles(driver, pages):
    """Test disowning handles."""
    pages.load("blank.html")

    # Create an object with root ownership (this will return a handle)
    result = driver.script._evaluate(
        "({foo: 'bar'})", target={"context": driver.current_window_handle}, await_promise=False, result_ownership="root"
    )

    handle = result.result["handle"]
    assert handle is not None

    # Use the handle in a function call (this should succeed)
    result_before = driver.script._call_function(
        "function(obj) { return obj.foo; }",
        await_promise=False,
        target={"context": driver.current_window_handle},
        arguments=[{"handle": handle}],
    )

    assert result_before.result["value"] == "bar"

    # Disown the handle
    driver.script._disown(handles=[handle], target={"context": driver.current_window_handle})

    # Try using the disowned handle (this should fail)
    with pytest.raises(Exception):
        driver.script._call_function(
            "function(obj) { return obj.foo; }",
            await_promise=False,
            target={"context": driver.current_window_handle},
            arguments=[{"handle": handle}],
        )


# Tests for high-level SCRIPT API commands - pin, unpin, and execute


def test_pin_script(driver, pages):
    """Test pinning a script."""
    function_declaration = "() => { window.pinnedScriptExecuted = 'yes'; }"

    script_id = driver.script.pin(function_declaration)
    assert script_id is not None
    assert isinstance(script_id, str)

    pages.load("blank.html")

    result = driver.script.execute("() => window.pinnedScriptExecuted")
    assert result["value"] == "yes"


def test_unpin_script(driver, pages):
    """Test unpinning a script."""
    function_declaration = "() => { window.unpinnableScript = 'executed'; }"

    script_id = driver.script.pin(function_declaration)
    driver.script.unpin(script_id)

    pages.load("blank.html")

    result = driver.script.execute("() => typeof window.unpinnableScript")
    assert result["value"] == "undefined"


def test_execute_script_with_null_argument(driver, pages):
    """Test executing script with undefined argument."""
    pages.load("blank.html")

    result = driver.script.execute(
        """(arg) => {
            if(arg!==null)
                throw Error("Argument should be null, but was "+arg);
            return arg;
        }""",
        None,
    )

    assert result["type"] == "null"


def test_execute_script_with_number_argument(driver, pages):
    """Test executing script with number argument."""
    pages.load("blank.html")

    result = driver.script.execute(
        """(arg) => {
            if(arg!==1.4)
                throw Error("Argument should be 1.4, but was "+arg);
            return arg;
        }""",
        1.4,
    )

    assert result["type"] == "number"
    assert result["value"] == 1.4


def test_execute_script_with_nan(driver, pages):
    """Test executing script with NaN argument."""
    pages.load("blank.html")

    result = driver.script.execute(
        """(arg) => {
            if(!Number.isNaN(arg))
                throw Error("Argument should be NaN, but was "+arg);
            return arg;
        }""",
        float("nan"),
    )

    assert result["type"] == "number"
    assert result["value"] == "NaN"


def test_execute_script_with_inf(driver, pages):
    """Test executing script with number argument."""
    pages.load("blank.html")

    result = driver.script.execute(
        """(arg) => {
            if(arg!==Infinity)
                throw Error("Argument should be Infinity, but was "+arg);
            return arg;
        }""",
        float("inf"),
    )

    assert result["type"] == "number"
    assert result["value"] == "Infinity"


def test_execute_script_with_minus_inf(driver, pages):
    """Test executing script with number argument."""
    pages.load("blank.html")

    result = driver.script.execute(
        """(arg) => {
            if(arg!==-Infinity)
                throw Error("Argument should be -Infinity, but was "+arg);
            return arg;
        }""",
        float("-inf"),
    )

    assert result["type"] == "number"
    assert result["value"] == "-Infinity"


def test_execute_script_with_bigint_argument(driver, pages):
    """Test executing script with BigInt argument."""
    pages.load("blank.html")

    # Use a large integer that exceeds JavaScript safe integer limit
    large_int = 9007199254740992
    result = driver.script.execute(
        """(arg) => {
            if(arg !== 9007199254740992n)
                throw Error("Argument should be 9007199254740992n (BigInt), but was "+arg+" (type: "+typeof arg+")");
            return arg;
        }""",
        large_int,
    )

    assert result["type"] == "bigint"
    assert result["value"] == str(large_int)


def test_execute_script_with_boolean_argument(driver, pages):
    """Test executing script with boolean argument."""
    pages.load("blank.html")

    result = driver.script.execute(
        """(arg) => {
            if(arg!==true)
                throw Error("Argument should be true, but was "+arg);
            return arg;
        }""",
        True,
    )

    assert result["type"] == "boolean"
    assert result["value"] is True


def test_execute_script_with_string_argument(driver, pages):
    """Test executing script with string argument."""
    pages.load("blank.html")

    result = driver.script.execute(
        """(arg) => {
            if(arg!=="hello world")
                throw Error("Argument should be 'hello world', but was "+arg);
            return arg;
        }""",
        "hello world",
    )

    assert result["type"] == "string"
    assert result["value"] == "hello world"


def test_execute_script_with_date_argument(driver, pages):
    """Test executing script with date argument."""
    import datetime

    pages.load("blank.html")

    date = datetime.datetime(2023, 12, 25, 10, 30, 45)
    result = driver.script.execute(
        """(arg) => {
            if(!(arg instanceof Date))
                throw Error("Argument type should be Date, but was "+
                    Object.prototype.toString.call(arg));
            if(arg.getFullYear() !== 2023)
                throw Error("Year should be 2023, but was "+arg.getFullYear());
            return arg;
        }""",
        date,
    )

    assert result["type"] == "date"
    assert "2023-12-25T10:30:45" in result["value"]


def test_execute_script_with_array_argument(driver, pages):
    """Test executing script with array argument."""
    pages.load("blank.html")

    test_list = [1, 2, 3]

    result = driver.script.execute(
        """(arg) => {
            if(!(arg instanceof Array))
                throw Error("Argument type should be Array, but was "+
                    Object.prototype.toString.call(arg));
            if(arg.length !== 3)
                throw Error("Array should have 3 elements, but had "+arg.length);
            return arg;
        }""",
        test_list,
    )

    assert result["type"] == "array"
    values = result["value"]
    assert len(values) == 3


def test_execute_script_with_multiple_arguments(driver, pages):
    """Test executing script with multiple arguments."""
    pages.load("blank.html")

    result = driver.script.execute(
        """(a, b, c) => {
            if(a !== 1) throw Error("First arg should be 1");
            if(b !== "test") throw Error("Second arg should be 'test'");
            if(c !== true) throw Error("Third arg should be true");
            return a + b.length + (c ? 1 : 0);
        }""",
        1,
        "test",
        True,
    )

    assert result["type"] == "number"
    assert result["value"] == 6  # 1 + 4 + 1


def test_execute_script_returns_promise(driver, pages):
    """Test executing script that returns a promise."""
    pages.load("blank.html")

    result = driver.script.execute(
        """() => {
            return Promise.resolve("async result");
        }""",
    )

    assert result["type"] == "string"
    assert result["value"] == "async result"


def test_execute_script_with_exception(driver, pages):
    """Test executing script that throws an exception."""
    pages.load("blank.html")

    from selenium.common.exceptions import WebDriverException

    with pytest.raises(WebDriverException) as exc_info:
        driver.script.execute(
            """() => {
                throw new Error("Test error message");
            }""",
        )

    assert "Test error message" in str(exc_info.value)


def test_execute_script_accessing_dom(driver, pages):
    """Test executing script that accesses DOM elements."""
    pages.load("formPage.html")

    result = driver.script.execute(
        """() => {
            return document.title;
        }""",
    )

    assert result["type"] == "string"
    assert result["value"] == "We Leave From Here"


def test_execute_script_with_nested_objects(driver, pages):
    """Test executing script with nested object arguments."""
    pages.load("blank.html")

    nested_data = {
        "user": {
            "name": "John",
            "age": 30,
            "hobbies": ["reading", "coding"],
        },
        "settings": {"theme": "dark", "notifications": True},
    }

    result = driver.script.execute(
        """(data) => {
            return {
                userName: data.user.name,
                userAge: data.user.age,
                hobbyCount: data.user.hobbies.length,
                theme: data.settings.theme
            };
        }""",
        nested_data,
    )

    assert result["type"] == "object"
    value_dict = {k: v["value"] for k, v in result["value"]}
    assert value_dict["userName"] == "John"
    assert value_dict["userAge"] == 30
    assert value_dict["hobbyCount"] == 2
