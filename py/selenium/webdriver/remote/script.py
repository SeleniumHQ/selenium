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

"""The supported script API, returned by ``driver.script``.

Pinned scripts, script execution and console, JavaScript-error and DOM-mutation
handlers. Nothing here hands back a protocol type: results are plain Python
values and elements come back as ``WebElement``, as with ``execute_script``.
See https://github.com/SeleniumHQ/selenium/blob/trunk/docs/decisions/17670-bidi-implementation-boundaries.md
"""

from __future__ import annotations

import datetime
import math
import warnings
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from selenium.common.exceptions import JavascriptException

if TYPE_CHECKING:
    from selenium.webdriver.remote.webdriver import WebDriver

BIDI_IMPLEMENTATION_DOC_URL = "https://www.selenium.dev/documentation/warnings/bidi-implementation/"

_MAX_SAFE_INTEGER = 9007199254740991
_SPECIAL_NUMBERS = {"NaN": math.nan, "-0": -0.0, "Infinity": math.inf, "-Infinity": -math.inf}
_LIST_TYPES = ("array", "set", "nodelist", "htmlcollection")
_ELEMENT_NODE = 1
_DOCUMENT_FRAGMENT_NODE = 11

# Replacements named in the warning when a removed protocol command is called
# through driver.script; anything not listed has no supported replacement.
_REPLACEMENTS = {
    "evaluate": "driver.script.execute() or driver.execute_script()",
    "call_function": "driver.script.execute() or driver.execute_script()",
    "add_preload_script": "driver.script.pin()",
    "remove_preload_script": "driver.script.unpin()",
}


@dataclass
class ScriptError:
    """A JavaScript error observed in the browser.

    Attributes:
        message: The error message.
        source: Source file/URL where the error occurred (top stack frame).
        line_number: Line number of the error.
        column_number: Column number of the error.
        stack_trace: Formatted stack trace, one ``at function (url:line:col)``
            line per frame.
        timestamp: Time the entry was generated, in milliseconds since epoch.
    """

    message: str | None = None
    source: str | None = None
    line_number: int | None = None
    column_number: int | None = None
    stack_trace: str | None = None
    timestamp: float | None = None


@dataclass
class ConsoleMessage:
    """A console message observed in the browser.

    Attributes:
        level: Console level (``debug``, ``info``, ``warn`` or ``error``).
        text: The console message text.
        source: Source file/URL the message originated from (top stack frame).
        line_number: Line number where the message originated.
        column_number: Column number where the message originated.
        stack_trace: Formatted stack trace where available.
        timestamp: Time the entry was generated, in milliseconds since epoch.
        method: The console method used (e.g. ``log``, ``warn``).
        args: The raw arguments passed to the console call.
    """

    level: str | None = None
    text: str | None = None
    source: str | None = None
    line_number: int | None = None
    column_number: int | None = None
    stack_trace: str | None = None
    timestamp: float | None = None
    method: str | None = None
    args: list[Any] | None = None


@dataclass
class ScriptResult:
    """Result of executing code with a pinned script in scope, without raising on failure.

    Attributes:
        value: The value the code returned, converted as ``execute_script``
            converts it, or ``None`` when the code raised.
        error: A :class:`ScriptError` describing the failure, or ``None``
            on success.
        realm: Deprecated; an implementation detail that will be removed.
    """

    value: Any | None = None
    error: ScriptError | None = None
    realm: str | None = None


@dataclass
class DomMutation:
    """Represents a DOM mutation event from add_dom_mutation_handler.

    Attributes:
        element_id: The ``data-__webdriver_id`` attribute value set on the
            mutated element by the MutationObserver. Use this to locate the
            element from the main thread if needed.  For ``characterData``
            mutations this identifies the parent element of the text node.
        attribute_name: The name of the changed attribute (``attributes``
            mutations only).
        current_value: The value after the mutation (attribute value or
            character data; ``None`` if the attribute was removed).
        old_value: The value before the mutation.
        type: The mutation type: ``attributes``, ``childList`` or
            ``characterData``.
        target: Same identifier as ``element_id``; named per the
            cross-binding API design.
        added_nodes: Node descriptors added by a ``childList`` mutation.
            Element descriptors carry ``nodeType``/``nodeName``/``id``
            (a ``data-__webdriver_id`` value); other nodes carry
            ``nodeType``/``nodeName``/``value``.
        removed_nodes: Node descriptors removed by a ``childList`` mutation.
    """

    element_id: str | None = None
    attribute_name: str | None = None
    current_value: str | None = None
    old_value: str | None = None
    type: str | None = None
    target: str | None = None
    added_nodes: list[Any] = field(default_factory=list)
    removed_nodes: list[Any] = field(default_factory=list)


class PinnedScript(str):
    """Identifier of a pinned script, as returned by ``driver.script.pin()``.

    Subclasses ``str`` so existing code that treats the return value of
    ``pin()`` as a plain script ID string keeps working. Pass it to
    ``driver.script.execute()`` to run code with the pinned source in scope,
    and to ``driver.script.unpin()`` to remove it.
    """

    _source: str | None
    _realm: str | None

    def __new__(cls, script_id: str, source: str | None = None, realm: str | None = None):
        instance = super().__new__(cls, script_id)
        instance._source = source
        instance._realm = realm
        return instance

    @property
    def id(self) -> str:
        """The unique identifier of the pinned script."""
        return str(self)

    @property
    def source(self) -> str | None:
        """The JavaScript source the script was pinned with."""
        return self._source

    @property
    def realm(self) -> str | None:
        """Deprecated: an implementation detail that is never populated by ``pin()``."""
        warnings.warn(
            "PinnedScript.realm is deprecated and will be removed; it is an implementation detail",
            DeprecationWarning,
            stacklevel=2,
        )
        return self._realm

    def __repr__(self) -> str:
        return f"PinnedScript(id={str.__repr__(self)})"


def serialize_argument(value: Any) -> Any:
    """Convert a Python value into a script argument.

    Accepts what ``execute_script`` accepts: ``None``, ``bool``, ``int``,
    ``float`` (including ``NaN`` and infinities), ``str``, lists and tuples,
    dicts, ``datetime.datetime``, ``WebElement`` and ``ShadowRoot``.
    """
    from selenium.webdriver.remote.shadowroot import ShadowRoot
    from selenium.webdriver.remote.webelement import WebElement

    if value is None:
        return {"type": "null"}
    if isinstance(value, bool):
        return {"type": "boolean", "value": value}
    if isinstance(value, datetime.datetime):
        return {"type": "date", "value": value.isoformat()}
    if isinstance(value, float):
        if math.isnan(value):
            return {"type": "number", "value": "NaN"}
        if math.isinf(value):
            return {"type": "number", "value": "Infinity" if value > 0 else "-Infinity"}
        return {"type": "number", "value": value}
    if isinstance(value, int):
        if abs(value) > _MAX_SAFE_INTEGER:
            return {"type": "bigint", "value": str(value)}
        return {"type": "number", "value": value}
    if isinstance(value, str):
        return {"type": "string", "value": value}
    if isinstance(value, (list, tuple)):
        return {"type": "array", "value": [serialize_argument(v) for v in value]}
    if isinstance(value, dict):
        return {"type": "object", "value": [[str(k), serialize_argument(v)] for k, v in value.items()]}
    if isinstance(value, (WebElement, ShadowRoot)):
        return {"sharedId": value.id}
    return value


def deserialize_result(value: Any, driver: WebDriver | None = None) -> Any:
    """Convert a script result into the Python value ``execute_script`` would return.

    Primitives map to their Python types, arrays and sets to lists, objects
    and maps to dicts, element nodes to ``WebElement`` and shadow roots to
    ``ShadowRoot`` (when a driver is given) and windows to their window handle. Values with no JSON form, such
    as functions, promises and symbols, become ``None``.
    """
    if not isinstance(value, dict) or "type" not in value:
        return value
    kind = value["type"]
    inner = value.get("value")
    if kind in ("string", "boolean", "date"):
        return inner
    if kind == "number":
        return _SPECIAL_NUMBERS.get(inner, inner) if isinstance(inner, str) else inner
    if kind == "bigint":
        return int(inner) if inner is not None else None
    if kind in _LIST_TYPES:
        return [deserialize_result(item, driver) for item in inner or []]
    if kind in ("object", "map"):
        result = {}
        for key, item in inner or []:
            result[key if isinstance(key, str) else str(deserialize_result(key, driver))] = deserialize_result(
                item, driver
            )
        return result
    if kind == "regexp":
        return inner
    if kind == "node":
        shared_id = value.get("sharedId")
        properties = inner if isinstance(inner, dict) else {}
        if not shared_id or driver is None:
            return None
        if properties.get("nodeType") == _ELEMENT_NODE:
            return driver.create_web_element(shared_id)
        # Only shadow roots carry a mode; other document fragments have no classic equivalent.
        if properties.get("nodeType") == _DOCUMENT_FRAGMENT_NODE and "mode" in properties:
            return driver._shadowroot_cls(driver, shared_id)
        return None
    if kind == "window":
        return inner.get("context") if isinstance(inner, dict) else None
    return None


class Script:
    """Pinned scripts, script execution and script event handlers.

    Obtain it with ``driver.script``; do not construct it directly.
    """

    def __init__(self, script: Any, driver: WebDriver | None = None) -> None:
        self._script = script
        self._driver = driver

    def _context(self, context_id: str | None) -> str | None:
        if context_id is None and self._driver is not None:
            return self._driver.current_window_handle
        return context_id

    def pin(self, function_declaration: str) -> PinnedScript:
        """Pin a script so it runs in every new document and can be reused by ``execute()``.

        Args:
            function_declaration: The JavaScript function declaration to pin,
                e.g. ``"() => { window.helper = () => 42 }"``.

        Returns:
            A ``PinnedScript`` to pass to ``execute()`` and ``unpin()``.
        """
        return self._script.pin(function_declaration)

    def unpin(self, script_id: PinnedScript | str) -> None:
        """Remove a pinned script.

        Args:
            script_id: The ``PinnedScript`` returned by ``pin()``.
        """
        self._script.unpin(script_id)

    def execute(self, function_declaration: str | PinnedScript, *args: Any, context_id: str | None = None) -> Any:
        """Execute JavaScript in the current window and return its result.

        Arguments and return values are converted as by ``execute_script``:
        ``WebElement`` arguments are passed to the page as elements, and
        elements in the result come back as ``WebElement``.

        Args:
            function_declaration: The function to run, e.g. ``"(a, b) => a + b"``,
                or a ``PinnedScript`` returned by ``pin()``.
            *args: Arguments passed to the function. When ``function_declaration`` is a
                ``PinnedScript``, the single argument is the code to run with
                the pinned source in scope, e.g. ``"return helper();"``.
            context_id: The window handle to run in. Defaults to the current
                window.

        Returns:
            The function's return value. When ``function_declaration`` is a ``PinnedScript``,
            a ``ScriptResult`` instead, which reports failures through
            ``ScriptResult.error`` rather than raising.

        Raises:
            JavascriptException: If the script throws.

        Example:
            `total = driver.script.execute("(a, b) => a + b", 1, 2)`
        """
        if isinstance(function_declaration, PinnedScript):
            result = self._script.execute(function_declaration, *args, context_id=context_id)
            result.value = deserialize_result(result.value, self._driver)
            return result
        context = self._context(context_id)
        raw = self._script.call_function(
            function_declaration=function_declaration,
            await_promise=True,
            target={"context": context} if context else {},
            arguments=[serialize_argument(a) for a in args] if args else None,
        )
        if isinstance(raw, dict) and raw.get("type") == "exception":
            details = raw.get("exceptionDetails")
            message = details.get("text", str(details)) if isinstance(details, dict) else str(details)
            raise JavascriptException(message)
        if isinstance(raw, dict) and raw.get("type") == "success":
            raw = raw.get("result")
        return deserialize_result(raw, self._driver)

    def add_console_handler(self, callback: Callable[[ConsoleMessage], Any]) -> int:
        """Add a handler called with a ``ConsoleMessage`` for each console message.

        Returns:
            An id for ``remove_console_handler()``.
        """
        return self._script.add_console_handler(callback)

    def remove_console_handler(self, callback_id: int) -> None:
        """Remove a handler added by ``add_console_handler()``."""
        self._script.remove_console_handler(callback_id)

    def clear_console_handlers(self) -> None:
        """Remove every console handler, including those added by ``add_console_message_handler()``."""
        self._script.clear_console_handlers()

    def add_console_message_handler(self, callback: Callable) -> int:
        """Add a handler called with a console log entry for each console message.

        For payloads carrying source URL and line/column numbers, see
        ``add_console_handler()``.

        Returns:
            An id for ``remove_console_message_handler()``.
        """
        return self._script.add_console_message_handler(callback)

    def remove_console_message_handler(self, callback_id: int) -> None:
        """Remove a handler added by ``add_console_message_handler()``."""
        self._script.remove_console_message_handler(callback_id)

    def add_error_handler(self, callback: Callable[[ScriptError], Any]) -> int:
        """Add a handler called with a ``ScriptError`` for each uncaught JavaScript error.

        Returns:
            An id for ``remove_error_handler()``.
        """
        return self._script.add_error_handler(callback)

    def remove_error_handler(self, callback_id: int) -> None:
        """Remove a handler added by ``add_error_handler()``."""
        self._script.remove_error_handler(callback_id)

    def clear_error_handlers(self) -> None:
        """Remove every JavaScript error handler, including those added by ``add_javascript_error_handler()``."""
        self._script.clear_error_handlers()

    def add_javascript_error_handler(self, callback: Callable) -> int:
        """Add a handler called with a JavaScript log entry for each uncaught JavaScript error.

        For payloads carrying source URL and line/column numbers, see
        ``add_error_handler()``.

        Returns:
            An id for ``remove_javascript_error_handler()``.
        """
        return self._script.add_javascript_error_handler(callback)

    def remove_javascript_error_handler(self, callback_id: int) -> None:
        """Remove a handler added by ``add_javascript_error_handler()``."""
        self._script.remove_javascript_error_handler(callback_id)

    def add_dom_mutation_handler(
        self, callback: Callable[[DomMutation], Any], mutation_types: str | Iterable[str] | None = None
    ) -> int:
        """Add a handler called with a ``DomMutation`` for each observed DOM mutation.

        Args:
            callback: Function called with a ``DomMutation``.
            mutation_types: Any of ``attributes``, ``childList`` and
                ``characterData``, as a string or an iterable of strings.
                Defaults to ``("attributes",)``.

        Returns:
            An id for ``remove_dom_mutation_handler()``.
        """
        return self._script.add_dom_mutation_handler(callback, mutation_types)

    def remove_dom_mutation_handler(self, callback_id: int) -> None:
        """Remove a handler added by ``add_dom_mutation_handler()``."""
        self._script.remove_dom_mutation_handler(callback_id)

    def clear_dom_mutation_handlers(self) -> None:
        """Remove every DOM mutation handler."""
        self._script.clear_dom_mutation_handlers()

    def __getattr__(self, name: str) -> Any:
        # Only reached for names Script does not define: the protocol commands
        # (and helpers) driver.script used to expose. Keep them working while deprecated.
        if name.startswith("__"):
            raise AttributeError(name)
        attribute = getattr(self._script, name)
        replacement = _REPLACEMENTS.get(name)
        if replacement:
            advice = f"use {replacement} instead"
        else:
            advice = f"there is no supported replacement; see {BIDI_IMPLEMENTATION_DOC_URL}"
        warnings.warn(
            f"driver.script.{name} is deprecated and will be removed; {advice}",
            DeprecationWarning,
            stacklevel=2,
        )
        return attribute
