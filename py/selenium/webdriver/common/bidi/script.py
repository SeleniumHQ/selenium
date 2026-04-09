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


from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from selenium.webdriver.common.bidi._event_manager import EventConfig, _EventManager
from selenium.webdriver.common.bidi.common import command_builder


class SpecialNumber:
    """SpecialNumber."""

    NAN = "NaN"
    _0 = "-0"
    INFINITY = "Infinity"
    _INFINITY = "-Infinity"


class RealmType:
    """RealmType."""

    WINDOW = "window"
    DEDICATED_WORKER = "dedicated-worker"
    SHARED_WORKER = "shared-worker"
    SERVICE_WORKER = "service-worker"
    WORKER = "worker"
    PAINT_WORKLET = "paint-worklet"
    AUDIO_WORKLET = "audio-worklet"
    WORKLET = "worklet"


class ResultOwnership:
    """ResultOwnership."""

    ROOT = "root"
    NONE = "none"


@dataclass
class ChannelValue:
    """ChannelValue."""

    type: str = field(default="channel", init=False)
    value: Any | None = None


@dataclass
class ChannelProperties:
    """ChannelProperties."""

    channel: Any | None = None
    serialization_options: Any | None = None
    ownership: Any | None = None


@dataclass
class EvaluateResultSuccess:
    """EvaluateResultSuccess."""

    type: str = field(default="success", init=False)
    result: Any | None = None
    realm: Any | None = None


@dataclass
class EvaluateResultException:
    """EvaluateResultException."""

    type: str = field(default="exception", init=False)
    exception_details: Any | None = None
    realm: Any | None = None


@dataclass
class ExceptionDetails:
    """ExceptionDetails."""

    column_number: Any | None = None
    exception: Any | None = None
    line_number: Any | None = None
    stack_trace: Any | None = None
    text: str | None = None


@dataclass
class ArrayLocalValue:
    """ArrayLocalValue."""

    type: str = field(default="array", init=False)
    value: Any | None = None


@dataclass
class DateLocalValue:
    """DateLocalValue."""

    type: str = field(default="date", init=False)
    value: str | None = None


@dataclass
class MapLocalValue:
    """MapLocalValue."""

    type: str = field(default="map", init=False)
    value: Any | None = None


@dataclass
class ObjectLocalValue:
    """ObjectLocalValue."""

    type: str = field(default="object", init=False)
    value: Any | None = None


@dataclass
class RegExpValue:
    """RegExpValue."""

    pattern: str | None = None
    flags: str | None = None


@dataclass
class RegExpLocalValue:
    """RegExpLocalValue."""

    type: str = field(default="regexp", init=False)
    value: Any | None = None


@dataclass
class SetLocalValue:
    """SetLocalValue."""

    type: str = field(default="set", init=False)
    value: Any | None = None


@dataclass
class UndefinedValue:
    """UndefinedValue."""

    type: str = field(default="undefined", init=False)


@dataclass
class NullValue:
    """NullValue."""

    type: str = field(default="null", init=False)


@dataclass
class StringValue:
    """StringValue."""

    type: str = field(default="string", init=False)
    value: str | None = None


@dataclass
class NumberValue:
    """NumberValue."""

    type: str = field(default="number", init=False)
    value: Any | None = None


@dataclass
class BooleanValue:
    """BooleanValue."""

    type: str = field(default="boolean", init=False)
    value: bool | None = None


@dataclass
class BigIntValue:
    """BigIntValue."""

    type: str = field(default="bigint", init=False)
    value: str | None = None


@dataclass
class BaseRealmInfo:
    """BaseRealmInfo."""

    realm: Any | None = None
    origin: str | None = None


@dataclass
class WindowRealmInfo:
    """WindowRealmInfo."""

    type: str = field(default="window", init=False)
    context: Any | None = None
    user_context: Any | None = None
    sandbox: str | None = None


@dataclass
class DedicatedWorkerRealmInfo:
    """DedicatedWorkerRealmInfo."""

    type: str = field(default="dedicated-worker", init=False)
    owners: list[Any] = field(default_factory=list)


@dataclass
class SharedWorkerRealmInfo:
    """SharedWorkerRealmInfo."""

    type: str = field(default="shared-worker", init=False)


@dataclass
class ServiceWorkerRealmInfo:
    """ServiceWorkerRealmInfo."""

    type: str = field(default="service-worker", init=False)


@dataclass
class WorkerRealmInfo:
    """WorkerRealmInfo."""

    type: str = field(default="worker", init=False)


@dataclass
class PaintWorkletRealmInfo:
    """PaintWorkletRealmInfo."""

    type: str = field(default="paint-worklet", init=False)


@dataclass
class AudioWorkletRealmInfo:
    """AudioWorkletRealmInfo."""

    type: str = field(default="audio-worklet", init=False)


@dataclass
class WorkletRealmInfo:
    """WorkletRealmInfo."""

    type: str = field(default="worklet", init=False)


@dataclass
class SharedReference:
    """SharedReference."""

    shared_id: Any | None = None
    handle: Any | None = None


@dataclass
class RemoteObjectReference:
    """RemoteObjectReference."""

    handle: Any | None = None
    shared_id: Any | None = None


@dataclass
class SymbolRemoteValue:
    """SymbolRemoteValue."""

    type: str = field(default="symbol", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class ArrayRemoteValue:
    """ArrayRemoteValue."""

    type: str = field(default="array", init=False)
    handle: Any | None = None
    internal_id: Any | None = None
    value: Any | None = None


@dataclass
class ObjectRemoteValue:
    """ObjectRemoteValue."""

    type: str = field(default="object", init=False)
    handle: Any | None = None
    internal_id: Any | None = None
    value: Any | None = None


@dataclass
class FunctionRemoteValue:
    """FunctionRemoteValue."""

    type: str = field(default="function", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class RegExpRemoteValue:
    """RegExpRemoteValue."""

    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class DateRemoteValue:
    """DateRemoteValue."""

    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class MapRemoteValue:
    """MapRemoteValue."""

    type: str = field(default="map", init=False)
    handle: Any | None = None
    internal_id: Any | None = None
    value: Any | None = None


@dataclass
class SetRemoteValue:
    """SetRemoteValue."""

    type: str = field(default="set", init=False)
    handle: Any | None = None
    internal_id: Any | None = None
    value: Any | None = None


@dataclass
class WeakMapRemoteValue:
    """WeakMapRemoteValue."""

    type: str = field(default="weakmap", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class WeakSetRemoteValue:
    """WeakSetRemoteValue."""

    type: str = field(default="weakset", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class GeneratorRemoteValue:
    """GeneratorRemoteValue."""

    type: str = field(default="generator", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class ErrorRemoteValue:
    """ErrorRemoteValue."""

    type: str = field(default="error", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class ProxyRemoteValue:
    """ProxyRemoteValue."""

    type: str = field(default="proxy", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class PromiseRemoteValue:
    """PromiseRemoteValue."""

    type: str = field(default="promise", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class TypedArrayRemoteValue:
    """TypedArrayRemoteValue."""

    type: str = field(default="typedarray", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class ArrayBufferRemoteValue:
    """ArrayBufferRemoteValue."""

    type: str = field(default="arraybuffer", init=False)
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class NodeListRemoteValue:
    """NodeListRemoteValue."""

    type: str = field(default="nodelist", init=False)
    handle: Any | None = None
    internal_id: Any | None = None
    value: Any | None = None


@dataclass
class HTMLCollectionRemoteValue:
    """HTMLCollectionRemoteValue."""

    type: str = field(default="htmlcollection", init=False)
    handle: Any | None = None
    internal_id: Any | None = None
    value: Any | None = None


@dataclass
class NodeRemoteValue:
    """NodeRemoteValue."""

    type: str = field(default="node", init=False)
    shared_id: Any | None = None
    handle: Any | None = None
    internal_id: Any | None = None
    value: Any | None = None


@dataclass
class NodeProperties:
    """NodeProperties."""

    node_type: Any | None = None
    child_node_count: Any | None = None
    children: list[Any] = field(default_factory=list)
    local_name: str | None = None
    mode: Any | None = None
    namespace_uri: str | None = None
    node_value: str | None = None
    shadow_root: Any | None = None


@dataclass
class WindowProxyRemoteValue:
    """WindowProxyRemoteValue."""

    type: str = field(default="window", init=False)
    value: Any | None = None
    handle: Any | None = None
    internal_id: Any | None = None


@dataclass
class WindowProxyProperties:
    """WindowProxyProperties."""

    context: Any | None = None


@dataclass
class StackFrame:
    """StackFrame."""

    column_number: Any | None = None
    function_name: str | None = None
    line_number: Any | None = None
    url: str | None = None


@dataclass
class StackTrace:
    """StackTrace."""

    call_frames: list[Any] = field(default_factory=list)


@dataclass
class Source:
    """Source."""

    realm: Any | None = None
    context: Any | None = None
    user_context: Any | None = None


@dataclass
class RealmTarget:
    """RealmTarget."""

    realm: Any | None = None


@dataclass
class ContextTarget:
    """ContextTarget."""

    context: Any | None = None
    sandbox: str | None = None


@dataclass
class AddPreloadScriptParameters:
    """AddPreloadScriptParameters."""

    function_declaration: str | None = None
    arguments: list[Any] = field(default_factory=list)
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)
    sandbox: str | None = None


@dataclass
class AddPreloadScriptResult:
    """AddPreloadScriptResult."""

    script: Any | None = None


@dataclass
class DisownParameters:
    """DisownParameters."""

    handles: list[Any] = field(default_factory=list)
    target: Any | None = None


@dataclass
class CallFunctionParameters:
    """CallFunctionParameters."""

    function_declaration: str | None = None
    await_promise: bool | None = None
    target: Any | None = None
    arguments: list[Any] = field(default_factory=list)
    result_ownership: Any | None = None
    serialization_options: Any | None = None
    this: Any | None = None
    user_activation: bool | None = None


@dataclass
class EvaluateParameters:
    """EvaluateParameters."""

    expression: str | None = None
    target: Any | None = None
    await_promise: bool | None = None
    result_ownership: Any | None = None
    serialization_options: Any | None = None
    user_activation: bool | None = None


@dataclass
class GetRealmsParameters:
    """GetRealmsParameters."""

    context: Any | None = None
    type: Any | None = None


@dataclass
class GetRealmsResult:
    """GetRealmsResult."""

    realms: list[Any] = field(default_factory=list)


@dataclass
class RemovePreloadScriptParameters:
    """RemovePreloadScriptParameters."""

    script: Any | None = None


@dataclass
class MessageParameters:
    """MessageParameters."""

    channel: Any | None = None
    data: Any | None = None
    source: Any | None = None


@dataclass
class RealmDestroyedParameters:
    """RealmDestroyedParameters."""

    realm: Any | None = None


# BiDi Event Name to Parameter Type Mapping
EVENT_NAME_MAPPING = {
    "realm_created": "script.realmCreated",
    "realm_destroyed": "script.realmDestroyed",
}


class Script:
    """WebDriver BiDi script module."""

    EVENT_CONFIGS: dict[str, EventConfig] = {}

    def __init__(self, conn, driver=None) -> None:
        self._conn = conn
        self._driver = driver
        self._event_manager = _EventManager(conn, self.EVENT_CONFIGS)

    def add_preload_script(
        self,
        function_declaration: Any | None = None,
        arguments: list[Any] | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
        sandbox: Any | None = None,
    ):
        """Execute script.addPreloadScript."""
        if function_declaration is None:
            raise TypeError("add_preload_script() missing required argument: 'function_declaration'")

        params = {
            "functionDeclaration": function_declaration,
            "arguments": arguments,
            "contexts": contexts,
            "userContexts": user_contexts,
            "sandbox": sandbox,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("script.addPreloadScript", params)
        result = self._conn.execute(cmd)
        return result

    def disown(self, handles: list[Any] | None = None, target: Any | None = None):
        """Execute script.disown."""
        if handles is None:
            raise TypeError("disown() missing required argument: 'handles'")
        if target is None:
            raise TypeError("disown() missing required argument: 'target'")

        params = {
            "handles": handles,
            "target": target,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("script.disown", params)
        result = self._conn.execute(cmd)
        return result

    def call_function(
        self,
        function_declaration: Any | None = None,
        await_promise: bool | None = None,
        target: Any | None = None,
        arguments: list[Any] | None = None,
        result_ownership: Any | None = None,
        serialization_options: Any | None = None,
        this: Any | None = None,
        user_activation: bool | None = None,
    ):
        """Execute script.callFunction."""
        if function_declaration is None:
            raise TypeError("call_function() missing required argument: 'function_declaration'")
        if await_promise is None:
            raise TypeError("call_function() missing required argument: 'await_promise'")
        if target is None:
            raise TypeError("call_function() missing required argument: 'target'")

        params = {
            "functionDeclaration": function_declaration,
            "awaitPromise": await_promise,
            "target": target,
            "arguments": arguments,
            "resultOwnership": result_ownership,
            "serializationOptions": serialization_options,
            "this": this,
            "userActivation": user_activation,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("script.callFunction", params)
        result = self._conn.execute(cmd)
        return result

    def evaluate(
        self,
        expression: Any | None = None,
        target: Any | None = None,
        await_promise: bool | None = None,
        result_ownership: Any | None = None,
        serialization_options: Any | None = None,
        user_activation: bool | None = None,
    ):
        """Execute script.evaluate."""
        if expression is None:
            raise TypeError("evaluate() missing required argument: 'expression'")
        if target is None:
            raise TypeError("evaluate() missing required argument: 'target'")
        if await_promise is None:
            raise TypeError("evaluate() missing required argument: 'await_promise'")

        params = {
            "expression": expression,
            "target": target,
            "awaitPromise": await_promise,
            "resultOwnership": result_ownership,
            "serializationOptions": serialization_options,
            "userActivation": user_activation,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("script.evaluate", params)
        result = self._conn.execute(cmd)
        return result

    def get_realms(self, context: Any | None = None, type: Any | None = None):
        """Execute script.getRealms."""
        params = {
            "context": context,
            "type": type,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("script.getRealms", params)
        result = self._conn.execute(cmd)
        return result

    def remove_preload_script(self, script: Any | None = None):
        """Execute script.removePreloadScript."""
        if script is None:
            raise TypeError("remove_preload_script() missing required argument: 'script'")

        params = {
            "script": script,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("script.removePreloadScript", params)
        result = self._conn.execute(cmd)
        return result

    def message(self, channel: Any | None = None, data: Any | None = None, source: Any | None = None):
        """Execute script.message."""
        if channel is None:
            raise TypeError("message() missing required argument: 'channel'")
        if data is None:
            raise TypeError("message() missing required argument: 'data'")
        if source is None:
            raise TypeError("message() missing required argument: 'source'")

        params = {
            "channel": channel,
            "data": data,
            "source": source,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("script.message", params)
        result = self._conn.execute(cmd)
        return result

    def execute(self, function_declaration: str, *args, context_id: str | None = None) -> Any:
        """Execute a function declaration in the browser context.

        Args:
            function_declaration: The function as a string, e.g. ``"() => document.title"``.
            *args: Optional Python values to pass as arguments to the function.
                Each value is serialised to a BiDi ``LocalValue`` automatically.
                Supported types: ``None``, ``bool``, ``int``, ``float``
                (including ``NaN`` and ``Infinity``), ``str``, ``list``,
                ``dict``, and ``datetime.datetime``.
            context_id: The browsing context ID to run in. Defaults to the
                driver's current window handle when a driver was provided.

        Returns:
            The inner RemoteValue result dict, or raises WebDriverException on exception.
        """
        import datetime as _datetime
        import math as _math

        from selenium.common.exceptions import WebDriverException as _WebDriverException

        def _serialize_arg(value):
            """Serialise a Python value to a BiDi LocalValue dict."""
            if value is None:
                return {"type": "null"}
            if isinstance(value, bool):
                return {"type": "boolean", "value": value}
            if isinstance(value, _datetime.datetime):
                return {"type": "date", "value": value.isoformat()}
            if isinstance(value, float):
                if _math.isnan(value):
                    return {"type": "number", "value": "NaN"}
                if _math.isinf(value):
                    return {"type": "number", "value": "Infinity" if value > 0 else "-Infinity"}
                return {"type": "number", "value": value}
            if isinstance(value, int):
                _MAX_SAFE_INT = 9007199254740991
                if abs(value) > _MAX_SAFE_INT:
                    return {"type": "bigint", "value": str(value)}
                return {"type": "number", "value": value}
            if isinstance(value, str):
                return {"type": "string", "value": value}
            if isinstance(value, list):
                return {"type": "array", "value": [_serialize_arg(v) for v in value]}
            if isinstance(value, dict):
                return {"type": "object", "value": [[str(k), _serialize_arg(v)] for k, v in value.items()]}
            return value

        if context_id is None and self._driver is not None:
            try:
                context_id = self._driver.current_window_handle
            except Exception:
                pass
        target = {"context": context_id} if context_id else {}
        serialized_args = [_serialize_arg(a) for a in args] if args else None
        raw = self.call_function(
            function_declaration=function_declaration,
            await_promise=True,
            target=target,
            arguments=serialized_args,
        )
        if isinstance(raw, dict):
            if raw.get("type") == "exception":
                exc = raw.get("exceptionDetails", {})
                msg = exc.get("text", str(exc)) if isinstance(exc, dict) else str(exc)
                raise _WebDriverException(msg)
            if raw.get("type") == "success":
                return raw.get("result")
        return raw

    def _add_preload_script(
        self,
        function_declaration,
        arguments=None,
        contexts=None,
        user_contexts=None,
        sandbox=None,
    ):
        """Add a preload script with validation.

        Args:
            function_declaration: The JS function to run on page load.
            arguments: Optional list of BiDi arguments.
            contexts: Optional list of browsing context IDs.
            user_contexts: Optional list of user context IDs.
            sandbox: Optional sandbox name.

        Returns:
            script_id: The ID of the added preload script (str).

        Raises:
            ValueError: If both contexts and user_contexts are specified.
        """
        if contexts is not None and user_contexts is not None:
            raise ValueError("Cannot specify both contexts and user_contexts")
        result = self.add_preload_script(
            function_declaration=function_declaration,
            arguments=arguments,
            contexts=contexts,
            user_contexts=user_contexts,
            sandbox=sandbox,
        )
        if isinstance(result, dict):
            return result.get("script")
        return result

    def _remove_preload_script(self, script_id):
        """Remove a preload script by ID.

        Args:
            script_id: The ID of the preload script to remove.
        """
        return self.remove_preload_script(script=script_id)

    def pin(self, function_declaration):
        """Pin (add) a preload script that runs on every page load.

        Args:
            function_declaration: The JS function to execute on page load.

        Returns:
            script_id: The ID of the pinned script (str).
        """
        return self._add_preload_script(function_declaration)

    def unpin(self, script_id):
        """Unpin (remove) a previously pinned preload script.

        Args:
            script_id: The ID returned by pin().
        """
        return self._remove_preload_script(script_id=script_id)

    def _evaluate(
        self,
        expression,
        target,
        await_promise,
        result_ownership=None,
        serialization_options=None,
        user_activation=None,
    ):
        """Evaluate a script expression and return a structured result.

        Args:
            expression: The JavaScript expression to evaluate.
            target: A dict like {"context": <id>} or {"realm": <id>}.
            await_promise: Whether to await a returned promise.
            result_ownership: Optional result ownership setting.
            serialization_options: Optional serialization options dict.
            user_activation: Optional user activation flag.

        Returns:
            An object with .realm, .result (dict or None), and .exception_details (or None).
        """

        class _EvalResult:
            def __init__(self2, realm, result, exception_details):
                self2.realm = realm
                self2.result = result
                self2.exception_details = exception_details

        raw = self.evaluate(
            expression=expression,
            target=target,
            await_promise=await_promise,
            result_ownership=result_ownership,
            serialization_options=serialization_options,
            user_activation=user_activation,
        )
        if isinstance(raw, dict):
            realm = raw.get("realm")
            if raw.get("type") == "exception":
                exc = raw.get("exceptionDetails")
                return _EvalResult(realm=realm, result=None, exception_details=exc)
            return _EvalResult(realm=realm, result=raw.get("result"), exception_details=None)
        return _EvalResult(realm=None, result=raw, exception_details=None)

    def _call_function(
        self,
        function_declaration,
        await_promise,
        target,
        arguments=None,
        result_ownership=None,
        this=None,
        user_activation=None,
        serialization_options=None,
    ):
        """Call a function and return a structured result.

        Args:
            function_declaration: The JS function string.
            await_promise: Whether to await the return value.
            target: A dict like {"context": <id>}.
            arguments: Optional list of BiDi arguments.
            result_ownership: Optional result ownership.
            this: Optional 'this' binding.
            user_activation: Optional user activation flag.
            serialization_options: Optional serialization options dict.

        Returns:
            An object with .result (dict or None) and .exception_details (or None).
        """

        class _CallResult:
            def __init__(self2, result, exception_details):
                self2.result = result
                self2.exception_details = exception_details

        raw = self.call_function(
            function_declaration=function_declaration,
            await_promise=await_promise,
            target=target,
            arguments=arguments,
            result_ownership=result_ownership,
            this=this,
            user_activation=user_activation,
            serialization_options=serialization_options,
        )
        if isinstance(raw, dict):
            if raw.get("type") == "exception":
                exc = raw.get("exceptionDetails")
                return _CallResult(result=None, exception_details=exc)
            if raw.get("type") == "success":
                return _CallResult(result=raw.get("result"), exception_details=None)
        return _CallResult(result=raw, exception_details=None)

    def _get_realms(self, context=None, type=None):
        """Get all realms, optionally filtered by context and type.

        Args:
            context: Optional browsing context ID to filter by.
            type: Optional realm type string to filter by (e.g. RealmType.WINDOW).

        Returns:
            List of realm info objects with .realm, .origin, .type, .context attributes.
        """

        class _RealmInfo:
            def __init__(self2, realm, origin, type_, context):
                self2.realm = realm
                self2.origin = origin
                self2.type = type_
                self2.context = context

        raw = self.get_realms(context=context, type=type)
        realms_list = raw.get("realms", []) if isinstance(raw, dict) else []
        result = []
        for r in realms_list:
            if isinstance(r, dict):
                result.append(
                    _RealmInfo(
                        realm=r.get("realm"),
                        origin=r.get("origin"),
                        type_=r.get("type"),
                        context=r.get("context"),
                    )
                )
        return result

    def _disown(self, handles, target):
        """Disown handles in a browsing context.

        Args:
            handles: List of handle strings to disown.
            target: A dict like {"context": <id>}.
        """
        return self.disown(handles=handles, target=target)

    def _subscribe_log_entry(self, callback, entry_type_filter=None):
        """Subscribe to log.entryAdded BiDi events with optional type filtering."""
        import threading as _threading

        from selenium.webdriver.common.bidi import log as _log_mod
        from selenium.webdriver.common.bidi.session import Session as _Session

        bidi_event = "log.entryAdded"

        if not hasattr(self, "_log_subscriptions"):
            self._log_subscriptions = {}
            self._log_lock = _threading.Lock()

        def _deserialize(params):
            t = params.get("type") if isinstance(params, dict) else None
            if t == "console":
                cls = getattr(_log_mod, "ConsoleLogEntry", None)
                if cls is not None and hasattr(cls, "from_json"):
                    try:
                        return cls.from_json(params)
                    except Exception:
                        pass
            elif t == "javascript":
                cls = getattr(_log_mod, "JavascriptLogEntry", None)
                if cls is not None and hasattr(cls, "from_json"):
                    try:
                        return cls.from_json(params)
                    except Exception:
                        pass
            return params

        def _wrapped(raw):
            entry = _deserialize(raw)
            if entry_type_filter is None:
                callback(entry)
            else:
                t = getattr(entry, "type_", None) or (entry.get("type") if isinstance(entry, dict) else None)
                if t == entry_type_filter:
                    callback(entry)

        class _BidiRef:
            event_class = bidi_event

            def from_json(self2, p):
                return p

        _wrapper = _BidiRef()
        callback_id = self._conn.add_callback(_wrapper, _wrapped)
        with self._log_lock:
            if bidi_event not in self._log_subscriptions:
                session = _Session(self._conn)
                result = session.subscribe([bidi_event])
                sub_id = result.get("subscription") if isinstance(result, dict) else None
                self._log_subscriptions[bidi_event] = {
                    "callbacks": [],
                    "subscription_id": sub_id,
                }
            self._log_subscriptions[bidi_event]["callbacks"].append(callback_id)
        return callback_id

    def _unsubscribe_log_entry(self, callback_id):
        """Unsubscribe a log entry callback by ID."""
        from selenium.webdriver.common.bidi.session import Session as _Session

        bidi_event = "log.entryAdded"
        if not hasattr(self, "_log_subscriptions"):
            return

        class _BidiRef:
            event_class = bidi_event

            def from_json(self2, p):
                return p

        _wrapper = _BidiRef()
        self._conn.remove_callback(_wrapper, callback_id)
        with self._log_lock:
            entry = self._log_subscriptions.get(bidi_event)
            if entry and callback_id in entry["callbacks"]:
                entry["callbacks"].remove(callback_id)
            if entry is not None and not entry["callbacks"]:
                session = _Session(self._conn)
                sub_id = entry.get("subscription_id")
                if sub_id:
                    session.unsubscribe(subscriptions=[sub_id])
                else:
                    session.unsubscribe(events=[bidi_event])
                del self._log_subscriptions[bidi_event]

    def add_console_message_handler(self, callback: Callable) -> int:
        """Add a handler for console log messages (log.entryAdded type=console).

        Args:
            callback: Function called with a ConsoleLogEntry on each console message.

        Returns:
            callback_id for use with remove_console_message_handler.
        """
        return self._subscribe_log_entry(callback, entry_type_filter="console")

    def remove_console_message_handler(self, callback_id: int) -> None:
        """Remove a console message handler by callback ID."""
        self._unsubscribe_log_entry(callback_id)

    def add_javascript_error_handler(self, callback: Callable) -> int:
        """Add a handler for JavaScript error log messages (log.entryAdded type=javascript).

        Args:
            callback: Function called with a JavascriptLogEntry on each JS error.

        Returns:
            callback_id for use with remove_javascript_error_handler.
        """
        return self._subscribe_log_entry(callback, entry_type_filter="javascript")

    def remove_javascript_error_handler(self, callback_id: int) -> None:
        """Remove a JavaScript error handler by callback ID."""
        self._unsubscribe_log_entry(callback_id)

    def add_event_handler(self, event: str, callback: Callable, contexts: list[str] | None = None) -> int:
        """Add an event handler.

        Args:
            event: The event to subscribe to.
            callback: The callback function to execute on event.
            contexts: The context IDs to subscribe to (optional).

        Returns:
            The callback ID.
        """
        return self._event_manager.add_event_handler(event, callback, contexts)

    def remove_event_handler(self, event: str, callback_id: int) -> None:
        """Remove an event handler.

        Args:
            event: The event to unsubscribe from.
            callback_id: The callback ID.
        """
        return self._event_manager.remove_event_handler(event, callback_id)

    def clear_event_handlers(self) -> None:
        """Clear all event handlers."""
        return self._event_manager.clear_event_handlers()


# Event Info Type Aliases
# Event: script.realmCreated
RealmCreated = globals().get("RealmInfo", dict)  # Fallback to dict if type not defined

# Event: script.realmDestroyed
RealmDestroyed = globals().get("RealmDestroyedParameters", dict)  # Fallback to dict if type not defined


# Populate EVENT_CONFIGS with event configuration mappings
_globals = globals()
Script.EVENT_CONFIGS = {
    "realm_created": EventConfig(
        "realm_created",
        "script.realmCreated",
        _globals.get("RealmCreated", dict) if _globals.get("RealmCreated") else dict,
    ),
    "realm_destroyed": EventConfig(
        "realm_destroyed",
        "script.realmDestroyed",
        _globals.get("RealmDestroyed", dict) if _globals.get("RealmDestroyed") else dict,
    ),
}
