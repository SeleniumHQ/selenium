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

"""High-level script-module helpers for the WebDriver BiDi script module.

This module is copied verbatim into the generated ``selenium.webdriver.common.bidi``
package by Bazel (see ``create-bidi-src`` in ``py/BUILD.bazel``).  The generated
``script`` module re-exports the public classes and instantiates the registries,
which layer the cross-binding BiDi API design's handler surface on top of the
CDDL-generated low-level commands:

- :class:`LogHandlerRegistry` owns a single ``log.entryAdded`` subscription and
  routes entries to console and JavaScript-error handlers.  Handlers registered
  through the doc-aligned ``add_console_handler`` / ``add_error_handler`` receive
  :class:`ConsoleMessage` / :class:`ScriptError` payloads carrying source URL,
  line and column numbers extracted from the BiDi stack trace; handlers
  registered through the longer-standing ``add_console_message_handler`` /
  ``add_javascript_error_handler`` keep receiving the generated log-entry
  dataclasses unchanged.
- :class:`DomMutationRegistry` owns the DOM-observation preload script and the
  ``script.message`` channel subscription, and dispatches :class:`DomMutation`
  payloads.  Beyond attribute changes it can observe ``childList`` and
  ``characterData`` mutations on request.
- :class:`PinnedScript` and :class:`ScriptResult` implement the design doc's
  pinned-script surface: ``pin()`` returns a :class:`PinnedScript` (a ``str``
  subclass, so code treating it as a plain script ID keeps working) and
  ``execute(pinned, code)`` returns a non-raising :class:`ScriptResult`.
"""

from __future__ import annotations

import json
import logging
import threading
import uuid
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)

# DOM mutation listener used as a BiDi preload script.  This extends the
# shared javascript/bidi-support/bidi-mutation-listener.js (which only emits
# attribute mutations) with opt-in childList and characterData reporting,
# selected through the ``options`` argument so each registration only emits
# the mutation types it asked for.  Kept Python-side until the shared listener
# grows the same options across bindings.
DOM_MUTATION_LISTENER_JS = """\
function observeMutations(channel, options) {
  const config = options || { attributes: true }
  const idFor = (element) => {
    let id = element.dataset.__webdriver_id
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36)
      element.dataset.__webdriver_id = id
    }
    return id
  }
  const describeNode = (node) => {
    const description = { nodeType: node.nodeType, nodeName: node.nodeName }
    if (node.nodeType === Node.ELEMENT_NODE) {
      description.id = idFor(node)
    } else {
      description.value = node.nodeValue
    }
    return description
  }
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case 'attributes': {
          if (!config.attributes) break
          // Don't report our own attribute has changed.
          if (mutation.attributeName === 'data-__webdriver_id') break
          channel(JSON.stringify({
            type: 'attributes',
            target: idFor(mutation.target),
            name: mutation.attributeName,
            value: mutation.target.getAttribute(mutation.attributeName),
            oldValue: mutation.oldValue,
          }))
          break
        }
        case 'childList': {
          if (!config.childList) break
          channel(JSON.stringify({
            type: 'childList',
            target: mutation.target.nodeType === Node.ELEMENT_NODE ? idFor(mutation.target) : null,
            addedNodes: Array.from(mutation.addedNodes, describeNode),
            removedNodes: Array.from(mutation.removedNodes, describeNode),
          }))
          break
        }
        case 'characterData': {
          if (!config.characterData) break
          const parent = mutation.target.parentElement
          channel(JSON.stringify({
            type: 'characterData',
            target: parent ? idFor(parent) : null,
            value: mutation.target.data,
            oldValue: mutation.oldValue,
          }))
          break
        }
        default:
          break
      }
    }
  })
  const observeInit = { subtree: true }
  if (config.attributes) {
    observeInit.attributes = true
    observeInit.attributeOldValue = true
  }
  if (config.childList) {
    observeInit.childList = true
  }
  if (config.characterData) {
    observeInit.characterData = true
    observeInit.characterDataOldValue = true
  }
  observer.observe(document, observeInit)
}
"""


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
        args: The raw BiDi RemoteValue arguments passed to the console call.
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
    """Result of executing a pinned script, without raising on failure.

    Attributes:
        value: The BiDi RemoteValue result of the execution, or ``None``
            when the script raised.
        error: A :class:`ScriptError` describing the failure, or ``None``
            on success.
        realm: The realm the script was executed in.
    """

    value: Any | None = None
    error: ScriptError | None = None
    realm: str | None = None


class PinnedScript(str):
    """Identifier of a pinned script, as returned by ``Script.pin()``.

    Subclasses ``str`` so existing code that treats the return value of
    ``pin()`` as a plain script ID string keeps working, while exposing the
    cross-binding API design's ``id``, ``source`` and ``realm`` properties.
    """

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
        """The realm the script is associated with, where known."""
        return self._realm

    def __repr__(self) -> str:
        return f"PinnedScript(id={str.__repr__(self)}, realm={self._realm!r})"


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
            cross-binding BiDi API design.
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


def _stack_frames(stack_trace: Any) -> list[dict]:
    if isinstance(stack_trace, dict):
        frames = stack_trace.get("callFrames")
        if isinstance(frames, list):
            return [frame for frame in frames if isinstance(frame, dict)]
    return []


def _format_stack_trace(stack_trace: Any) -> str | None:
    frames = _stack_frames(stack_trace)
    if not frames:
        return None
    lines = []
    for frame in frames:
        name = frame.get("functionName") or "<anonymous>"
        lines.append(f"    at {name} ({frame.get('url')}:{frame.get('lineNumber')}:{frame.get('columnNumber')})")
    return "\n".join(lines)


def console_message_from_log_entry(params: dict) -> ConsoleMessage:
    """Build a :class:`ConsoleMessage` from raw ``log.entryAdded`` params."""
    frames = _stack_frames(params.get("stackTrace"))
    top = frames[0] if frames else {}
    return ConsoleMessage(
        level=params.get("level"),
        text=params.get("text"),
        source=top.get("url"),
        line_number=top.get("lineNumber"),
        column_number=top.get("columnNumber"),
        stack_trace=_format_stack_trace(params.get("stackTrace")),
        timestamp=params.get("timestamp"),
        method=params.get("method"),
        args=params.get("args"),
    )


def script_error_from_log_entry(params: dict) -> ScriptError:
    """Build a :class:`ScriptError` from raw ``log.entryAdded`` params."""
    frames = _stack_frames(params.get("stackTrace"))
    top = frames[0] if frames else {}
    return ScriptError(
        message=params.get("text"),
        source=top.get("url"),
        line_number=top.get("lineNumber"),
        column_number=top.get("columnNumber"),
        stack_trace=_format_stack_trace(params.get("stackTrace")),
        timestamp=params.get("timestamp"),
    )


def script_error_from_exception_details(details: dict) -> ScriptError:
    """Build a :class:`ScriptError` from BiDi ``script.ExceptionDetails``."""
    frames = _stack_frames(details.get("stackTrace"))
    top = frames[0] if frames else {}
    return ScriptError(
        message=details.get("text"),
        source=top.get("url"),
        line_number=details.get("lineNumber"),
        column_number=details.get("columnNumber"),
        stack_trace=_format_stack_trace(details.get("stackTrace")),
    )


def dom_mutation_from_payload(payload: dict) -> DomMutation:
    """Build a :class:`DomMutation` from a mutation-listener channel payload."""
    target = payload.get("target")
    target_id = None if target is None else str(target)
    return DomMutation(
        element_id=target_id,
        attribute_name=payload.get("name"),
        current_value=payload.get("value"),
        old_value=payload.get("oldValue"),
        type=payload.get("type", "attributes"),
        target=target_id,
        added_nodes=list(payload.get("addedNodes") or []),
        removed_nodes=list(payload.get("removedNodes") or []),
    )


class _EventRef:
    """Minimal event wrapper accepted by WebSocketConnection callbacks."""

    def __init__(self, event_class: str) -> None:
        self.event_class = event_class

    def from_json(self, params: Any) -> Any:
        return params


def _subscribe_to_event(conn: Any, event: str) -> str | None:
    from selenium.webdriver.common.bidi.session import Session

    result = Session(conn).subscribe([event])
    return result.get("subscription") if isinstance(result, dict) else None


def _unsubscribe_from_event(conn: Any, event: str, subscription_id: str | None) -> None:
    from selenium.webdriver.common.bidi.session import Session

    session = Session(conn)
    if subscription_id:
        session.unsubscribe(subscriptions=[subscription_id])
    else:
        session.unsubscribe(events=[event])


def _legacy_log_entry(params: dict) -> Any:
    """Deserialize raw log params into the generated log-entry dataclasses."""
    from selenium.webdriver.common.bidi import log as log_mod

    cls_name = {"console": "ConsoleLogEntry", "javascript": "JavascriptLogEntry"}.get(params.get("type"))
    if cls_name:
        cls = getattr(log_mod, cls_name, None)
        if cls is not None and hasattr(cls, "from_json"):
            try:
                return cls.from_json(params)
            except Exception:
                pass
    return params


def execute_pinned(script: Any, pinned: PinnedScript, code: str, context_id: str | None = None) -> ScriptResult:
    """Execute ``code`` with a pinned script's source in scope.

    The pinned source and the code are wrapped into a single function and
    evaluated via ``script.callFunction`` in the given (or current) browsing
    context, so functions declared by the pinned source are callable from
    ``code``.  Unlike ``Script.execute``, failures do not raise: they are
    reported through :attr:`ScriptResult.error`.
    """
    source = pinned.source if isinstance(pinned, PinnedScript) else None
    declaration = "function() {\n" + (source or "") + "\n" + (code or "") + "\n}"
    if context_id is None and getattr(script, "_driver", None) is not None:
        try:
            context_id = script._driver.current_window_handle
        except Exception:
            pass
    target = {"context": context_id} if context_id else {}
    raw = script.call_function(
        function_declaration=declaration,
        await_promise=True,
        target=target,
    )
    if isinstance(raw, dict):
        realm = raw.get("realm")
        if raw.get("type") == "exception":
            details = raw.get("exceptionDetails")
            details = details if isinstance(details, dict) else {}
            return ScriptResult(value=None, error=script_error_from_exception_details(details), realm=realm)
        if raw.get("type") == "success":
            return ScriptResult(value=raw.get("result"), error=None, realm=realm)
    return ScriptResult(value=raw, error=None, realm=None)


class LogHandlerRegistry:
    """Routes ``log.entryAdded`` events to console and error handlers.

    All console and JavaScript-error handlers share one BiDi session
    subscription, created when the first handler is added and removed when
    the last one is removed.  Each handler is tracked under a category
    (``console`` or ``error``) so ``clear_console_handlers`` /
    ``clear_error_handlers`` can remove every handler of that category,
    regardless of which ``add_*`` method registered it.
    """

    EVENT = "log.entryAdded"
    CONSOLE = "console"
    ERROR = "error"
    _CATEGORY_ENTRY_TYPES = {CONSOLE: "console", ERROR: "javascript"}

    def __init__(self, script: Any) -> None:
        self._script = script
        self._lock = threading.Lock()
        self._subscription_id: str | None = None
        self._categories: dict[int, str] = {}

    def add_handler(self, callback: Callable, category: str, legacy: bool = False) -> int:
        """Register a handler and subscribe to ``log.entryAdded`` if needed.

        Args:
            callback: User callback invoked with the shaped payload.
            category: ``console`` or ``error``.
            legacy: When ``True`` the callback receives the generated
                ``ConsoleLogEntry`` / ``JavascriptLogEntry`` dataclasses;
                otherwise it receives :class:`ConsoleMessage` /
                :class:`ScriptError`.
        """
        entry_type = self._CATEGORY_ENTRY_TYPES[category]

        def _dispatch(params: Any) -> None:
            if not isinstance(params, dict) or params.get("type") != entry_type:
                return
            if legacy:
                payload = _legacy_log_entry(params)
            elif category == self.CONSOLE:
                payload = console_message_from_log_entry(params)
            else:
                payload = script_error_from_log_entry(params)
            callback(payload)

        conn = self._script._conn
        with self._lock:
            callback_id = conn.add_callback(_EventRef(self.EVENT), _dispatch)
            if not self._categories:
                try:
                    self._subscription_id = _subscribe_to_event(conn, self.EVENT)
                except Exception:
                    conn.remove_callback(_EventRef(self.EVENT), callback_id)
                    raise
            self._categories[callback_id] = category
        return callback_id

    def remove_handler(self, callback_id: int) -> None:
        """Remove a handler; drops the session subscription with the last one."""
        conn = self._script._conn
        conn.remove_callback(_EventRef(self.EVENT), callback_id)
        with self._lock:
            removed = self._categories.pop(callback_id, None)
            if removed is not None and not self._categories:
                _unsubscribe_from_event(conn, self.EVENT, self._subscription_id)
                self._subscription_id = None

    def clear_handlers(self, category: str) -> None:
        """Remove every handler registered under ``category``."""
        with self._lock:
            ids = [callback_id for callback_id, cat in self._categories.items() if cat == category]
        for callback_id in ids:
            self.remove_handler(callback_id)


class DomMutationRegistry:
    """Owns the DOM-observation preload script and channel subscription.

    The first handler installs a preload script observing the requested
    mutation types and subscribes to ``script.message``; later handlers that
    request additional mutation types install one further observer covering
    only the missing types, so no mutation is reported twice.  Each handler
    only receives the mutation types it asked for.  When the last handler is
    removed the subscription and every observer preload script are removed.
    """

    EVENT = "script.message"
    MUTATION_TYPES = ("attributes", "childList", "characterData")
    DEFAULT_MUTATION_TYPES = ("attributes",)

    def __init__(self, script: Any) -> None:
        self._script = script
        self._lock = threading.Lock()
        self._channel: str | None = None
        self._subscription_id: str | None = None
        self._handlers: dict[int, frozenset[str]] = {}
        self._preload_script_ids: list[str] = []
        self._active_types: set[str] = set()

    def _normalize_types(self, mutation_types: str | Iterable[str] | None) -> frozenset[str]:
        if mutation_types is None:
            return frozenset(self.DEFAULT_MUTATION_TYPES)
        if isinstance(mutation_types, str):
            mutation_types = (mutation_types,)
        types = frozenset(mutation_types)
        unknown = types - set(self.MUTATION_TYPES)
        if unknown:
            raise ValueError(
                f"Unsupported DOM mutation type(s) {sorted(unknown)}; expected a subset of {self.MUTATION_TYPES}"
            )
        if not types:
            raise ValueError("mutation_types must name at least one mutation type")
        return types

    def _channel_argument(self) -> dict:
        if self._channel is None:
            # Stable, namespaced channel to avoid collisions with user scripts.
            self._channel = f"selenium.domMutation.{uuid.uuid4().hex}"
        return {"type": "channel", "value": {"channel": self._channel}}

    def _listener_declaration(self, types: set[str]) -> str:
        # script.addPreloadScript arguments may only be channels, so the
        # observation options are inlined into the function declaration.
        options = json.dumps({name: True for name in sorted(types)})
        return "function(channel) { return (" + DOM_MUTATION_LISTENER_JS + ")(channel, " + options + "); }"

    def _observe_types(self, channel_arg: dict, types: set[str]) -> None:
        declaration = self._listener_declaration(types)
        preload_script_id = self._script._add_preload_script(declaration, arguments=[channel_arg])
        self._preload_script_ids.append(preload_script_id)
        # Preload scripts only fire on future document creations, so also
        # invoke the observer immediately on the current page.
        driver = getattr(self._script, "_driver", None)
        if driver is not None:
            context = None
            try:
                context = driver.current_window_handle
            except Exception:
                pass
            if context is not None:
                self._script.call_function(
                    function_declaration=declaration,
                    target={"context": context},
                    await_promise=False,
                    arguments=[channel_arg],
                )

    def add_handler(self, callback: Callable, mutation_types: str | Iterable[str] | None = None) -> int:
        """Register a mutation handler for the given mutation types."""
        types = self._normalize_types(mutation_types)

        def _dispatch(message: Any) -> None:
            if not isinstance(message, dict) or message.get("channel") != self._channel:
                return
            data = message.get("data")
            value = data.get("value") if isinstance(data, dict) else None
            if value is None:
                return
            try:
                payload = json.loads(value)
            except (ValueError, TypeError):
                return
            if not isinstance(payload, dict):
                return
            mutation = dom_mutation_from_payload(payload)
            if mutation.type == "attributes" and not mutation.element_id and mutation.element_id != "0":
                return
            if mutation.type in types:
                callback(mutation)

        conn = self._script._conn
        with self._lock:
            channel_arg = self._channel_argument()
            missing = set(types) - self._active_types
            if missing:
                self._observe_types(channel_arg, missing)
                self._active_types |= missing
            if not self._handlers:
                self._subscription_id = _subscribe_to_event(conn, self.EVENT)
            # Register the callback AFTER setup to avoid leaking it if setup fails.
            callback_id = conn.add_callback(_EventRef(self.EVENT), _dispatch)
            self._handlers[callback_id] = types
        return callback_id

    def remove_handler(self, callback_id: int) -> None:
        """Remove a handler; tears down observers with the last one."""
        conn = self._script._conn
        conn.remove_callback(_EventRef(self.EVENT), callback_id)
        with self._lock:
            removed = self._handlers.pop(callback_id, None)
            if removed is not None and not self._handlers:
                self._teardown(conn)

    def clear_handlers(self) -> None:
        """Remove every DOM mutation handler."""
        with self._lock:
            ids = list(self._handlers)
        for callback_id in ids:
            self.remove_handler(callback_id)

    def _teardown(self, conn: Any) -> None:
        try:
            _unsubscribe_from_event(conn, self.EVENT, self._subscription_id)
        finally:
            self._subscription_id = None
            preload_script_ids, self._preload_script_ids = self._preload_script_ids, []
            self._active_types = set()
            for preload_script_id in preload_script_ids:
                try:
                    self._script._remove_preload_script(preload_script_id)
                except Exception:
                    logger.warning("Failed to remove DOM mutation preload script %s", preload_script_id)
