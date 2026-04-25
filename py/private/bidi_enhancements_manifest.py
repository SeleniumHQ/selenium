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


"""
Enhancement manifest for BiDi code generation.

This file defines custom enhancements applied to generated BiDi modules,
including custom dataclass methods, parameter validation/transformation,
response deserialization, and field extraction.

All code must be compatible with Python 3.10+.
"""

from __future__ import annotations

from typing import Any

# ============================================================================
# Format Guide
# ============================================================================
# Each module in ENHANCEMENTS specifies enhancement rules for methods:
#
# 'module_name': {
#     'method_name': {
#         'dataclass_methods': {   # For dataclass enhancements
#             'ClassName': ['method1', 'method2', ...]
#         },
#         'preprocess': {          # Pre-processing on parameters
#             'param_name': 'check_serialize_method'
#         },
#         'deserialize': {         # Deserialize response to typed objects
#             'response_field': 'TypeName',
#         },
#         'extract_field': str,    # Extract nested field from response
#         'extract_property': str, # Extract property from extracted items
#         'validate': str,         # Validation function name
#         'transform': str,        # Transformation function name
#     }
# }
# ============================================================================

ENHANCEMENTS: dict[str, dict[str, Any]] = {
    "browser": {
        # Dataclass custom methods
        "__dataclass_methods__": {
            "ClientWindowInfo": [
                "get_client_window",
                "get_state",
                "get_width",
                "get_height",
                "is_active",
                "get_x",
                "get_y",
            ],
        },
        # Method enhancements
        "create_user_context": {
            "preprocess": {
                "proxy": "check_serialize_method",
                "unhandled_prompt_behavior": "check_serialize_method",
            },
            "extract_field": "userContext",
        },
        "get_client_windows": {
            "deserialize": {
                "clientWindows": "ClientWindowInfo",
            },
        },
        "get_user_contexts": {
            "extract_field": "userContexts",
            "extract_property": "userContext",
        },
        "set_download_behavior": {
            "params_override": {
                "allowed": "bool",
                "destination_folder": "str",
                "userContexts": "[*browser.UserContext]",
            },
            "validate": "validate_download_behavior",
            "transform": {
                "allowed": "allowed",
                "destination_folder": "destination_folder",
                "func": "transform_download_params",
                "result_param": "download_behavior",
            },
        },
        # Replace the auto-generated ClientWindowNamedState so we can add the
        # convenience NORMAL constant.  In the BiDi spec "normal" is the state
        # represented by ClientWindowRectState, but exposing it here keeps the
        # Python API consistent with the old ClientWindowState enum.
        "exclude_types": ["ClientWindowNamedState", "SetClientWindowStateParameters"],
        "extra_dataclasses": [
            '''class ClientWindowNamedState:
    """Named states for a browser client window."""

    FULLSCREEN = "fullscreen"
    MAXIMIZED = "maximized"
    MINIMIZED = "minimized"
    NORMAL = "normal"''',
            '''@dataclass
class SetClientWindowStateParameters:
    """SetClientWindowStateParameters.

    The ``state`` field is required and must be either a named-state string
    (e.g. ``ClientWindowNamedState.MAXIMIZED``) or a
    :class:`ClientWindowRectState` instance.  ``client_window`` is the ID of
    the window to affect.
    """

    client_window: Any | None = None
    state: Any | None = None''',
        ],
        # Override the generator-produced set_download_behavior so that
        # downloadBehavior is never stripped by the generic None filter.
        # The BiDi spec marks it as required (can be null, but must be present).
        "extra_methods": [
            '''    def set_download_behavior(
        self,
        allowed: bool | None = None,
        destination_folder: str | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Set the download behavior for the browser.

        Args:
            allowed: ``True`` to allow downloads, ``False`` to deny, or ``None``
                to reset to browser default (sends ``null`` to the protocol).
            destination_folder: Destination folder for downloads.  Required when
                ``allowed=True``.  Accepts a string or :class:`pathlib.Path`.
            user_contexts: Optional list of user context IDs.

        Raises:
            ValueError: If *allowed* is ``True`` and *destination_folder* is
                omitted, or ``False`` and *destination_folder* is provided.
        """
        validate_download_behavior(
            allowed=allowed,
            destination_folder=destination_folder,
            user_contexts=user_contexts,
        )
        download_behavior = transform_download_params(allowed, destination_folder)
        # downloadBehavior is a REQUIRED field in the BiDi spec (can be null but
        # must be present).  Do NOT use a generic None-filter on it.
        params: dict = {"downloadBehavior": download_behavior}
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("browser.setDownloadBehavior", params)
        return self._conn.execute(cmd)''',
            '''    def set_client_window_state(
        self,
        client_window: Any | None = None,
        state: Any | None = None,
    ):
        """Set the client window state.

        Args:
            client_window: The client window ID to apply the state to.
            state: The window state to set. Can be one of:
                - A string: "fullscreen", "maximized", "minimized", "normal"
                - A ClientWindowRectState object with width, height, x, y
                - A dict representing the state

        Raises:
            ValueError: If client_window is not provided or state is invalid.
        """
        if client_window is None:
            raise ValueError("client_window is required")
        if state is None:
            raise ValueError("state is required")

        # Serialize ClientWindowRectState if needed
        state_param = state
        if hasattr(state, '__dataclass_fields__'):
            # It's a dataclass, convert to dict
            state_param = {
                k: v for k, v in state.__dict__.items()
                if v is not None
            }

        params = {
            "clientWindow": client_window,
            "state": state_param,
        }
        cmd = command_builder("browser.setClientWindowState", params)
        return self._conn.execute(cmd)''',
        ],
    },
    "browsingContext": {
        # Method enhancements
        "exclude_methods": ["set_viewport"],
        "create": {
            "extract_field": "context",
        },
        "get_tree": {
            "extract_field": "contexts",
            "deserialize": {
                "contexts": "Info",
            },
        },
        "capture_screenshot": {
            "extract_field": "data",
            "params_override": {
                "context": "str",
                "format": "ImageFormat",
                "clip": "BoxClipRectangle",
                "origin": "str",
            },
        },
        "print": {
            "extract_field": "data",
        },
        "locate_nodes": {
            "extract_field": "nodes",
            "params_override": {
                "context": "str",
                "locator": "dict",
                "serializationOptions": "dict",
                "startNodes": "list",
                "maxNodeCount": "int",
            },
        },
        "set_viewport": {
            "params_override": {
                "context": "str",
                "viewport": "dict",
                "userContexts": "list",
                "devicePixelRatio": "float",
            },
        },
        "extra_methods": [
            '''    def set_viewport(
        self,
        context: str | None = None,
        viewport: Any = ...,
        user_contexts: Any | None = None,
        device_pixel_ratio: Any = ...,
    ):
        """Execute browsingContext.setViewport.

        Uses sentinel defaults so explicit None is serialized for viewport/devicePixelRatio,
        while omitted arguments are not sent.
        """
        params = {}
        if context is not None:
            params["context"] = context
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        if viewport is not ...:
            params["viewport"] = viewport
        if device_pixel_ratio is not ...:
            params["devicePixelRatio"] = device_pixel_ratio

        cmd = command_builder("browsingContext.setViewport", params)
        result = self._conn.execute(cmd)
        return result''',
        ],
        # Non-CDDL download event dataclasses (Chromium-specific)
        "extra_dataclasses": [
            '''@dataclass
class DownloadWillBeginParams:
    """DownloadWillBeginParams."""

    suggested_filename: str | None = None''',
            '''@dataclass
class DownloadCanceledParams:
    """DownloadCanceledParams."""

    status: Any | None = None''',
            '''@dataclass
class DownloadParams:
    """DownloadParams - fields shared by all download end event variants."""

    status: str | None = None
    context: Any | None = None
    navigation: Any | None = None
    timestamp: Any | None = None
    url: str | None = None
    filepath: str | None = None''',
            '''@dataclass
class DownloadEndParams:
    """DownloadEndParams - params for browsingContext.downloadEnd event."""

    download_params: DownloadParams | None = None

    @classmethod
    def from_json(cls, params: dict) -> DownloadEndParams:
        """Deserialize from BiDi wire-level params dict."""
        dp = DownloadParams(
            status=params.get("status"),
            context=params.get("context"),
            navigation=params.get("navigation"),
            timestamp=params.get("timestamp"),
            url=params.get("url"),
            filepath=params.get("filepath"),
        )
        return cls(download_params=dp)''',
        ],
        # Download events are now in the CDDL spec, so no extra_events needed
    },
    "log": {
        # Make LogLevel an alias for Level so existing code using LogLevel works
        "aliases": {"LogLevel": "Level"},
        # Replace the minimal CDDL-generated versions with richer ones that have from_json
        "exclude_types": ["JavascriptLogEntry"],
        "extra_dataclasses": [
            '''@dataclass
class ConsoleLogEntry:
    """ConsoleLogEntry - a console log entry from the browser."""

    type_: str | None = None
    method: str | None = None
    args: list | None = None
    level: Any | None = None
    text: Any | None = None
    source: Any | None = None
    timestamp: Any | None = None
    stack_trace: Any | None = None

    @classmethod
    def from_json(cls, params: dict) -> ConsoleLogEntry:
        """Deserialize from BiDi params dict."""
        return cls(
            type_=params.get("type"),
            method=params.get("method"),
            args=params.get("args"),
            level=params.get("level"),
            text=params.get("text"),
            source=params.get("source"),
            timestamp=params.get("timestamp"),
            stack_trace=params.get("stackTrace"),
        )''',
            '''@dataclass
class JavascriptLogEntry:
    """JavascriptLogEntry - a JavaScript error log entry from the browser."""

    type_: str | None = None
    level: Any | None = None
    text: Any | None = None
    source: Any | None = None
    timestamp: Any | None = None
    stacktrace: Any | None = None

    @classmethod
    def from_json(cls, params: dict) -> JavascriptLogEntry:
        """Deserialize from BiDi params dict."""
        return cls(
            type_=params.get("type"),
            level=params.get("level"),
            text=params.get("text"),
            source=params.get("source"),
            timestamp=params.get("timestamp"),
            stacktrace=params.get("stackTrace"),
        )''',
        ],
        # Define Entry union type for log.entryAdded event deserialization
        "extra_type_aliases": [
            "Entry = GenericLogEntry | ConsoleLogEntry | JavascriptLogEntry",
        ],
        "event_type_aliases": {
            "entry_added": "Entry",
        },
    },
    "emulation": {
        "exclude_types": ["setNetworkConditionsParameters"],
        "extra_dataclasses": [
            '''@dataclass
class SetNetworkConditionsParameters:
    """SetNetworkConditionsParameters."""

    network_conditions: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


# Backward-compatible alias for existing imports
setNetworkConditionsParameters = SetNetworkConditionsParameters''',
        ],
        "extra_methods": [
            '''    def set_geolocation_override(
        self,
        coordinates=None,
        error=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setGeolocationOverride.

        Sets or clears the geolocation override for specified browsing or user contexts.

        Args:
            coordinates: A GeolocationCoordinates instance (or dict) to override the
                position, or ``None`` to clear a previously-set override.
            error: A GeolocationPositionError instance (or dict) to simulate a
                position-unavailable error.  Mutually exclusive with *coordinates*.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        params: dict[str, Any] = {}
        if coordinates is not None:
            if isinstance(coordinates, dict):
                coords_dict = coordinates
            else:
                coords_dict = {}
                if coordinates.latitude is not None:
                    coords_dict["latitude"] = coordinates.latitude
                if coordinates.longitude is not None:
                    coords_dict["longitude"] = coordinates.longitude
                if coordinates.accuracy is not None:
                    coords_dict["accuracy"] = coordinates.accuracy
                if coordinates.altitude is not None:
                    coords_dict["altitude"] = coordinates.altitude
                if coordinates.altitude_accuracy is not None:
                    coords_dict["altitudeAccuracy"] = coordinates.altitude_accuracy
                if coordinates.heading is not None:
                    coords_dict["heading"] = coordinates.heading
                if coordinates.speed is not None:
                    coords_dict["speed"] = coordinates.speed
            params["coordinates"] = coords_dict
        if error is not None:
            if isinstance(error, dict):
                params["error"] = error
            else:
                params["error"] = {
                    "type": error.type if error.type is not None else "positionUnavailable"
                }
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setGeolocationOverride", params)
        result = self._conn.execute(cmd)
        return result''',
            '''    def set_timezone_override(
        self,
        timezone=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setTimezoneOverride.

        Sets or clears the timezone override for specified browsing or user contexts.
        Pass ``timezone=None`` (or omit it) to clear a previously-set override.

        Args:
            timezone: IANA timezone string (e.g. ``"America/New_York"``) or ``None``
                to clear the override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        params: dict[str, Any] = {"timezone": timezone}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setTimezoneOverride", params)
        return self._conn.execute(cmd)''',
            '''    def set_scripting_enabled(
        self,
        enabled=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setScriptingEnabled.

        Enables or disables scripting for specified browsing or user contexts.
        Pass ``enabled=None`` to restore the default behaviour.

        Args:
            enabled: ``True`` to enable scripting, ``False`` to disable it, or
                ``None`` to clear the override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        params: dict[str, Any] = {"enabled": enabled}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setScriptingEnabled", params)
        return self._conn.execute(cmd)''',
            '''    def set_user_agent_override(
        self,
        user_agent=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setUserAgentOverride.

        Overrides the User-Agent string for specified browsing or user contexts.
        Pass ``user_agent=None`` to clear a previously-set override.

        Args:
            user_agent: Custom User-Agent string, or ``None`` to clear the override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        params: dict[str, Any] = {"userAgent": user_agent}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setUserAgentOverride", params)
        return self._conn.execute(cmd)''',
            '''    def set_screen_orientation_override(
        self,
        screen_orientation=None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setScreenOrientationOverride.

        Sets or clears the screen orientation override for specified browsing or
        user contexts.

        Args:
            screen_orientation: A :class:`ScreenOrientation` instance (or dict with
                ``natural`` and ``type`` keys) to lock the orientation, or ``None``
                to clear a previously-set override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        if screen_orientation is None:
            so_value = None
        elif isinstance(screen_orientation, dict):
            so_value = screen_orientation
        else:
            natural = screen_orientation.natural
            orientation_type = screen_orientation.type
            so_value = {
                "natural": natural.lower() if isinstance(natural, str) else natural,
                "type": orientation_type.lower() if isinstance(orientation_type, str) else orientation_type,
            }
        params: dict[str, Any] = {"screenOrientation": so_value}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setScreenOrientationOverride", params)
        return self._conn.execute(cmd)''',
            '''    def set_network_conditions(
        self,
        network_conditions=None,
        offline: bool | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setNetworkConditions.

        Sets or clears network condition emulation for specified browsing or user
        contexts.

        Args:
            network_conditions: A dict with the raw ``networkConditions`` value
                (e.g. ``{"type": "offline"}``), or ``None`` to clear the override.
                Mutually exclusive with *offline*.
            offline: Convenience bool — ``True`` sets offline conditions,
                ``False`` clears them (sends ``null``).  When provided, this takes
                precedence over *network_conditions*.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        if offline is not None:
            nc_value = {"type": "offline"} if offline else None
        else:
            nc_value = network_conditions
        params: dict[str, Any] = {"networkConditions": nc_value}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setNetworkConditions", params)
        return self._conn.execute(cmd)''',
            '''    def set_screen_settings_override(
        self,
        width: int | None = None,
        height: int | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute emulation.setScreenSettingsOverride.

        Sets or clears the screen settings override for specified browsing or user
        contexts.

        Args:
            width: The screen width in pixels, or ``None`` to clear the override.
            height: The screen height in pixels, or ``None`` to clear the override.
            contexts: List of browsing context IDs to target.
            user_contexts: List of user context IDs to target.
        """
        screen_area = None
        if width is not None or height is not None:
            screen_area = {}
            if width is not None:
                screen_area["width"] = width
            if height is not None:
                screen_area["height"] = height
        params: dict[str, Any] = {"screenArea": screen_area}
        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("emulation.setScreenSettingsOverride", params)
        return self._conn.execute(cmd)''',
        ],
    },
    "script": {
        "extra_methods": [
            '''    def execute(self, function_declaration: str, *args, context_id: str | None = None) -> Any:
        """Execute a function declaration in the browser context.

        Args:
            function_declaration: The function as a string, e.g. ``"() => document.title"``.
            *args: Optional Python values to pass as arguments to the function.
                Each value is serialised to a BiDi ``LocalValue`` automatically.
                Supported types: ``None``, ``bool``, ``int``, ``float``
                (including ``NaN`` and ``Infinity``), ``str``, ``list``,
                ``dict``, and ``datetime.datetime``.
            context_id: The browsing context ID to run in. Defaults to the
                driver\'s current window handle when a driver was provided.

        Returns:
            The inner RemoteValue result dict, or raises WebDriverException on exception.
        """
        import math as _math
        import datetime as _datetime
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
        return raw''',
            '''    def _add_preload_script(
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
        return result''',
            '''    def _remove_preload_script(self, script_id):
        """Remove a preload script by ID.

        Args:
            script_id: The ID of the preload script to remove.
        """
        return self.remove_preload_script(script=script_id)''',
            '''    def pin(self, function_declaration):
        """Pin (add) a preload script that runs on every page load.

        Args:
            function_declaration: The JS function to execute on page load.

        Returns:
            script_id: The ID of the pinned script (str).
        """
        return self._add_preload_script(function_declaration)''',
            '''    def unpin(self, script_id):
        """Unpin (remove) a previously pinned preload script.

        Args:
            script_id: The ID returned by pin().
        """
        return self._remove_preload_script(script_id=script_id)''',
            '''    def _evaluate(
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
        return _EvalResult(realm=None, result=raw, exception_details=None)''',
            '''    def _call_function(
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
            this: Optional \'this\' binding.
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
        return _CallResult(result=raw, exception_details=None)''',
            '''    def _get_realms(self, context=None, type=None):
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
                result.append(_RealmInfo(
                    realm=r.get("realm"),
                    origin=r.get("origin"),
                    type_=r.get("type"),
                    context=r.get("context"),
                ))
        return result''',
            '''    def _disown(self, handles, target):
        """Disown handles in a browsing context.

        Args:
            handles: List of handle strings to disown.
            target: A dict like {"context": <id>}.
        """
        return self.disown(handles=handles, target=target)''',
            '''    def _subscribe_log_entry(self, callback, entry_type_filter=None):
        """Subscribe to log.entryAdded BiDi events with optional type filtering."""
        import threading as _threading
        from selenium.webdriver.common.bidi.session import Session as _Session
        from selenium.webdriver.common.bidi import log as _log_mod

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
                t = getattr(entry, "type_", None) or (
                    entry.get("type") if isinstance(entry, dict) else None
                )
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
                sub_id = (
                    result.get("subscription") if isinstance(result, dict) else None
                )
                self._log_subscriptions[bidi_event] = {
                    "callbacks": [],
                    "subscription_id": sub_id,
                }
            self._log_subscriptions[bidi_event]["callbacks"].append(callback_id)
        return callback_id''',
            '''    def _unsubscribe_log_entry(self, callback_id):
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
                del self._log_subscriptions[bidi_event]''',
            '''    def add_console_message_handler(self, callback: Callable) -> int:
        """Add a handler for console log messages (log.entryAdded type=console).

        Args:
            callback: Function called with a ConsoleLogEntry on each console message.

        Returns:
            callback_id for use with remove_console_message_handler.
        """
        return self._subscribe_log_entry(callback, entry_type_filter="console")''',
            '''    def remove_console_message_handler(self, callback_id: int) -> None:
        """Remove a console message handler by callback ID."""
        self._unsubscribe_log_entry(callback_id)''',
            '''    def add_javascript_error_handler(self, callback: Callable) -> int:
        """Add a handler for JavaScript error log messages (log.entryAdded type=javascript).

        Args:
            callback: Function called with a JavascriptLogEntry on each JS error.

        Returns:
            callback_id for use with remove_javascript_error_handler.
        """
        return self._subscribe_log_entry(callback, entry_type_filter="javascript")''',
            '''    def remove_javascript_error_handler(self, callback_id: int) -> None:
        """Remove a JavaScript error handler by callback ID."""
        self._unsubscribe_log_entry(callback_id)''',
        ],
    },
    "network": {
        "exclude_types": ["disownDataParameters"],
        # Initialize intercepts tracking list and per-handler intercept map
        "extra_init_code": [
            "self.intercepts: list[Any] = []",
            "self._handler_intercepts: dict[str, Any] = {}",
        ],
        # Request class wraps a beforeRequestSent event params and provides actions
        "extra_dataclasses": [
            '''@dataclass
class DisownDataParameters:
    """DisownDataParameters."""

    data_type: Any | None = None
    collector: Any | None = None
    request: Any | None = None


# Backward-compatible alias for existing imports
disownDataParameters = DisownDataParameters''',
            '''class BytesValue:
    """A string or base64-encoded bytes value used in cookie operations.

    This corresponds to network.BytesValue in the WebDriver BiDi specification,
    wrapping either a plain string or a base64-encoded binary value.
    """

    TYPE_STRING = "string"
    TYPE_BASE64 = "base64"

    def __init__(self, type: Any | None, value: Any | None) -> None:
        self.type = type
        self.value = value

    def to_bidi_dict(self) -> dict:
        return {"type": self.type, "value": self.value}''',
            '''class Request:
    """Wraps a BiDi network request event params and provides request action methods."""

    def __init__(self, conn, params):
        self._conn = conn
        self._params = params if isinstance(params, dict) else {}
        req = self._params.get("request", {}) or {}
        self.url = req.get("url", "")
        self._request_id = req.get("request")

    def continue_request(self, **kwargs):
        """Continue the intercepted request."""
        from selenium.webdriver.common.bidi.common import command_builder as _cb

        params = {"request": self._request_id}
        params.update(kwargs)
        self._conn.execute(_cb("network.continueRequest", params))''',
        ],
        # Override auth_required to use raw dict so _auth_callback receives all
        # fields (including "request") from the BiDi event params.  The
        # generated AuthRequiredParameters dataclass only contains "response",
        # losing the "request" field that holds the request ID required to call
        # network.continueWithAuth.  extra_events entries appear last in the
        # EVENT_CONFIGS dict literal, so this duplicate key overrides the
        # CDDL-generated entry.
        # Add before_request event (maps to network.beforeRequestSent)
        "extra_events": [
            {
                "event_key": "auth_required",
                "bidi_event": "network.authRequired",
                "event_class": "dict",
            },
            {
                "event_key": "before_request",
                "bidi_event": "network.beforeRequestSent",
                "event_class": "dict",
            },
        ],
        "extra_methods": [
            '''    def _add_intercept(self, phases=None, url_patterns=None):
        """Add a low-level network intercept.

        Args:
            phases: list of intercept phases (default: ["beforeRequestSent"])
            url_patterns: optional URL patterns to filter

        Returns:
            dict with "intercept" key containing the intercept ID
        """
        from selenium.webdriver.common.bidi.common import command_builder as _cb

        if phases is None:
            phases = ["beforeRequestSent"]
        params = {"phases": phases}
        if url_patterns:
            params["urlPatterns"] = url_patterns
        result = self._conn.execute(_cb("network.addIntercept", params))
        if result:
            intercept_id = result.get("intercept")
            if intercept_id and intercept_id not in self.intercepts:
                self.intercepts.append(intercept_id)
        return result''',
            '''    def _remove_intercept(self, intercept_id):
        """Remove a low-level network intercept."""
        from selenium.webdriver.common.bidi.common import command_builder as _cb

        self._conn.execute(_cb("network.removeIntercept", {"intercept": intercept_id}))
        if intercept_id in self.intercepts:
            self.intercepts.remove(intercept_id)''',
            '''    def _canonical_request_handler_event(self, event):
        """Map public request-handler aliases to supported event keys."""
        event_aliases = {
            "auth_required": "auth_required",
            "before_request": "before_request",
            "before_request_sent": "before_request",
        }
        canonical_event = event_aliases.get(event)
        if canonical_event is None:
            available_events = ", ".join(sorted(event_aliases))
            raise ValueError(
                f"Unsupported request handler event '{event}'. Available events: {available_events}"
            )
        return canonical_event''',
            '''    def add_request_handler(self, event, callback, url_patterns=None):
        """Add a handler for network requests at the specified phase.

        Args:
            event: Event name, e.g. ``"before_request"`` or ``"before_request_sent"``.
            callback: Callable receiving a :class:`Request` instance.
            url_patterns: optional list of URL pattern dicts to filter.

        Returns:
            callback_id int for later removal via remove_request_handler.
        """
        canonical_event = self._canonical_request_handler_event(event)
        phase_map = {
            "before_request": "beforeRequestSent",
            "auth_required": "authRequired",
        }
        phase = phase_map[canonical_event]
        intercept_result = self._add_intercept(phases=[phase], url_patterns=url_patterns)
        intercept_id = intercept_result.get("intercept") if intercept_result else None

        def _request_callback(params):
            raw = (
                params
                if isinstance(params, dict)
                else (params.__dict__ if hasattr(params, "__dict__") else {})
            )
            request = Request(self._conn, raw)
            callback(request)

        callback_id = self.add_event_handler(canonical_event, _request_callback)
        if intercept_id:
            self._handler_intercepts[callback_id] = intercept_id
        return callback_id''',
            '''    def remove_request_handler(self, event, callback_id):
        """Remove a network request handler and its associated network intercept.

        Args:
            event: The event name used when adding the handler.
            callback_id: The int returned by add_request_handler.
        """
        canonical_event = self._canonical_request_handler_event(event)
        self.remove_event_handler(canonical_event, callback_id)
        intercept_id = self._handler_intercepts.pop(callback_id, None)
        if intercept_id:
            self._remove_intercept(intercept_id)''',
            '''    def clear_request_handlers(self):
        """Clear all request handlers and remove all tracked intercepts."""
        self.clear_event_handlers()
        for intercept_id in list(self.intercepts):
            self._remove_intercept(intercept_id)''',
            '''    def add_auth_handler(self, username, password):
        """Add an auth handler that automatically provides credentials.

        Args:
            username: The username for basic authentication.
            password: The password for basic authentication.

        Returns:
            callback_id int for later removal via remove_auth_handler.
        """
        from selenium.webdriver.common.bidi.common import command_builder as _cb

        # Set up network intercept for authRequired phase
        intercept_result = self._add_intercept(phases=["authRequired"])
        intercept_id = intercept_result.get("intercept") if intercept_result else None

        def _auth_callback(params):
            raw = (
                params
                if isinstance(params, dict)
                else (params.__dict__ if hasattr(params, "__dict__") else {})
            )
            request_id = (
                raw.get("request", {}).get("request")
                if isinstance(raw, dict)
                else None
            )
            if request_id:
                self._conn.execute(
                    _cb(
                        "network.continueWithAuth",
                        {
                            "request": request_id,
                            "action": "provideCredentials",
                            "credentials": {
                                "type": "password",
                                "username": username,
                                "password": password,
                            },
                        },
                    )
                )

        callback_id = self.add_event_handler("auth_required", _auth_callback)
        if intercept_id:
            self._handler_intercepts[callback_id] = intercept_id
        return callback_id''',
            '''    def remove_auth_handler(self, callback_id):
        """Remove an auth handler by callback ID and its associated network intercept.

        Args:
            callback_id: The handler ID returned by add_auth_handler.
        """
        self.remove_event_handler("auth_required", callback_id)
        intercept_id = self._handler_intercepts.pop(callback_id, None)
        if intercept_id:
            self._remove_intercept(intercept_id)''',
        ],
    },
    "storage": {
        # Exclude auto-generated dataclasses that need custom to_bidi_dict()
        # for JSON-over-WebSocket serialization, or custom constructors.
        "exclude_types": [
            "CookieFilter",
            "PartialCookie",
            "BrowsingContextPartitionDescriptor",
            "StorageKeyPartitionDescriptor",
        ],
        "extra_dataclasses": [
            # Re-export network types used in cookie operations so they can be
            # imported from selenium.webdriver.common.bidi.storage alongside
            # the storage-specific classes.
            '''class BytesValue:
    """A string or base64-encoded bytes value used in cookie operations.

    This corresponds to network.BytesValue in the WebDriver BiDi specification,
    wrapping either a plain string or a base64-encoded binary value.
    """

    TYPE_STRING = "string"
    TYPE_BASE64 = "base64"

    def __init__(self, type: Any | None, value: Any | None) -> None:
        self.type = type
        self.value = value

    def to_bidi_dict(self) -> dict:
        return {"type": self.type, "value": self.value}

    def to_dict(self) -> dict:
        """Backward-compatible alias for to_bidi_dict()."""
        return self.to_bidi_dict()''',
            '''class SameSite:
    """SameSite cookie attribute values."""

    STRICT = "strict"
    LAX = "lax"
    NONE = "none"
    DEFAULT = "default"''',
            # Helper: cookie object returned inside a GetCookiesResult response
            '''@dataclass
class StorageCookie:
    """A cookie object returned by storage.getCookies."""

    name: str | None = None
    value: Any | None = None
    domain: str | None = None
    path: str | None = None
    size: Any | None = None
    http_only: bool | None = None
    secure: bool | None = None
    same_site: Any | None = None
    expiry: Any | None = None

    @classmethod
    def from_bidi_dict(cls, raw: dict) -> StorageCookie:
        """Deserialize a wire-level cookie dict to a StorageCookie."""
        value_raw = raw.get("value")
        if isinstance(value_raw, dict):
            value: Any = BytesValue(value_raw.get("type"), value_raw.get("value"))
        else:
            value = value_raw
        return cls(
            name=raw.get("name"),
            value=value,
            domain=raw.get("domain"),
            path=raw.get("path"),
            size=raw.get("size"),
            http_only=raw.get("httpOnly"),
            secure=raw.get("secure"),
            same_site=raw.get("sameSite"),
            expiry=raw.get("expiry"),
        )''',
            # Custom CookieFilter with camelCase serialization
            '''@dataclass
class CookieFilter:
    """CookieFilter."""

    name: str | None = None
    value: Any | None = None
    domain: str | None = None
    path: str | None = None
    size: Any | None = None
    http_only: bool | None = None
    secure: bool | None = None
    same_site: Any | None = None
    expiry: Any | None = None

    def to_bidi_dict(self) -> dict:
        """Serialize to the BiDi wire-protocol dict."""
        result: dict = {}
        if self.name is not None:
            result["name"] = self.name
        if self.value is not None:
            result["value"] = self.value.to_bidi_dict() if hasattr(self.value, "to_bidi_dict") else self.value
        if self.domain is not None:
            result["domain"] = self.domain
        if self.path is not None:
            result["path"] = self.path
        if self.size is not None:
            result["size"] = self.size
        if self.http_only is not None:
            result["httpOnly"] = self.http_only
        if self.secure is not None:
            result["secure"] = self.secure
        if self.same_site is not None:
            result["sameSite"] = self.same_site
        if self.expiry is not None:
            result["expiry"] = self.expiry
        return result

    def to_dict(self) -> dict:
        """Backward-compatible alias for to_bidi_dict()."""
        return self.to_bidi_dict()''',
            # Custom PartialCookie with camelCase serialization
            '''@dataclass
class PartialCookie:
    """PartialCookie."""

    name: str | None = None
    value: Any | None = None
    domain: str | None = None
    path: str | None = None
    http_only: bool | None = None
    secure: bool | None = None
    same_site: Any | None = None
    expiry: Any | None = None

    def to_bidi_dict(self) -> dict:
        """Serialize to the BiDi wire-protocol dict."""
        result: dict = {}
        if self.name is not None:
            result["name"] = self.name
        if self.value is not None:
            result["value"] = self.value.to_bidi_dict() if hasattr(self.value, "to_bidi_dict") else self.value
        if self.domain is not None:
            result["domain"] = self.domain
        if self.path is not None:
            result["path"] = self.path
        if self.http_only is not None:
            result["httpOnly"] = self.http_only
        if self.secure is not None:
            result["secure"] = self.secure
        if self.same_site is not None:
            result["sameSite"] = self.same_site
        if self.expiry is not None:
            result["expiry"] = self.expiry
        return result

    def to_dict(self) -> dict:
        """Backward-compatible alias for to_bidi_dict()."""
        return self.to_bidi_dict()''',
            # BrowsingContextPartitionDescriptor: first positional arg is *context*
            # (the auto-generated dataclass had `type` first, breaking positional
            # usage like BrowsingContextPartitionDescriptor(driver.current_window_handle))
            '''class BrowsingContextPartitionDescriptor:
    """BrowsingContextPartitionDescriptor.

    The first positional argument is *context* (a browsing-context ID / window
    handle), mirroring how the class is used throughout the test suite:
    ``BrowsingContextPartitionDescriptor(driver.current_window_handle)``.
    """

    def __init__(self, context: Any = None, type: str = "context") -> None:
        self.context = context
        self.type = type

    def to_bidi_dict(self) -> dict:
        return {"type": "context", "context": self.context}

    def to_dict(self) -> dict:
        """Backward-compatible alias for to_bidi_dict()."""
        return self.to_bidi_dict()''',
            # StorageKeyPartitionDescriptor with camelCase serialization
            '''@dataclass
class StorageKeyPartitionDescriptor:
    """StorageKeyPartitionDescriptor."""

    type: Any | None = "storageKey"
    user_context: str | None = None
    source_origin: str | None = None

    def to_bidi_dict(self) -> dict:
        """Serialize to the BiDi wire-protocol dict."""
        result: dict = {"type": "storageKey"}
        if self.user_context is not None:
            result["userContext"] = self.user_context
        if self.source_origin is not None:
            result["sourceOrigin"] = self.source_origin
        return result

    def to_dict(self) -> dict:
        """Backward-compatible alias for to_bidi_dict()."""
        return self.to_bidi_dict()''',
        ],
        # Override the generated Storage class methods (Python's last-definition-
        # wins semantics means these extra_methods shadow the generated ones).
        "extra_methods": [
            '''    def get_cookies(self, filter=None, partition=None):
        """Execute storage.getCookies and return a GetCookiesResult."""
        if filter and hasattr(filter, "to_bidi_dict"):
            filter = filter.to_bidi_dict()
        if partition and hasattr(partition, "to_bidi_dict"):
            partition = partition.to_bidi_dict()
        params = {
            "filter": filter,
            "partition": partition,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("storage.getCookies", params)
        result = self._conn.execute(cmd)
        if result and "cookies" in result:
            cookies = [
                StorageCookie.from_bidi_dict(c)
                for c in result.get("cookies", [])
                if isinstance(c, dict)
            ]
            pk_raw = result.get("partitionKey")
            pk = (
                PartitionKey(
                    user_context=pk_raw.get("userContext"),
                    source_origin=pk_raw.get("sourceOrigin"),
                )
                if isinstance(pk_raw, dict)
                else None
            )
            return GetCookiesResult(cookies=cookies, partition_key=pk)
        return GetCookiesResult(cookies=[], partition_key=None)''',
            '''    def set_cookie(self, cookie=None, partition=None):
        """Execute storage.setCookie."""
        if cookie and hasattr(cookie, "to_bidi_dict"):
            cookie = cookie.to_bidi_dict()
        if partition and hasattr(partition, "to_bidi_dict"):
            partition = partition.to_bidi_dict()
        params = {
            "cookie": cookie,
            "partition": partition,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("storage.setCookie", params)
        result = self._conn.execute(cmd)
        if isinstance(result, dict):
            pk_raw = result.get("partitionKey")
            pk = (
                PartitionKey(
                    user_context=pk_raw.get("userContext"),
                    source_origin=pk_raw.get("sourceOrigin"),
                )
                if isinstance(pk_raw, dict)
                else None
            )
            return SetCookieResult(partition_key=pk)
        return result''',
            '''    def delete_cookies(self, filter=None, partition=None):
        """Execute storage.deleteCookies."""
        if filter and hasattr(filter, "to_bidi_dict"):
            filter = filter.to_bidi_dict()
        if partition and hasattr(partition, "to_bidi_dict"):
            partition = partition.to_bidi_dict()
        params = {
            "filter": filter,
            "partition": partition,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("storage.deleteCookies", params)
        result = self._conn.execute(cmd)
        if isinstance(result, dict):
            pk_raw = result.get("partitionKey")
            pk = (
                PartitionKey(
                    user_context=pk_raw.get("userContext"),
                    source_origin=pk_raw.get("sourceOrigin"),
                )
                if isinstance(pk_raw, dict)
                else None
            )
            return DeleteCookiesResult(partition_key=pk)
        return result''',
        ],
    },
    "session": {
        # Override UserPromptHandler to add to_bidi_dict() for JSON serialization
        "exclude_types": ["UserPromptHandler"],
        "extra_dataclasses": [
            '''@dataclass
class UserPromptHandler:
    """UserPromptHandler."""

    alert: Any | None = None
    before_unload: Any | None = None
    confirm: Any | None = None
    default: Any | None = None
    file: Any | None = None
    prompt: Any | None = None

    def to_bidi_dict(self) -> dict:
        """Convert to BiDi protocol dict with camelCase keys."""
        result = {}
        if self.alert is not None:
            result["alert"] = self.alert
        if self.before_unload is not None:
            result["beforeUnload"] = self.before_unload
        if self.confirm is not None:
            result["confirm"] = self.confirm
        if self.default is not None:
            result["default"] = self.default
        if self.file is not None:
            result["file"] = self.file
        if self.prompt is not None:
            result["prompt"] = self.prompt
        return result

    def to_dict(self) -> dict:
        """Backward-compatible alias for to_bidi_dict()."""
        return self.to_bidi_dict()''',
        ],
    },
    "webExtension": {
        # Suppress the raw generated stubs; hand-written versions follow below
        "exclude_methods": ["install", "uninstall"],
        "extra_methods": [
            '''    def install(
        self,
        path: str | None = None,
        archive_path: str | None = None,
        base64_value: str | None = None,
    ):
        """Install a web extension.

        Exactly one of the three keyword arguments must be provided.

        Args:
            path: Directory path to an unpacked extension (also accepted for
                signed ``.xpi`` / ``.crx`` archive files on Firefox).
            archive_path: File-system path to a packed extension archive.
            base64_value: Base64-encoded extension archive string.

        Returns:
            The raw result dict from the BiDi ``webExtension.install`` command
            (contains at least an ``"extension"`` key with the extension ID).

        Raises:
            ValueError: If more than one, or none, of the arguments is provided.
        """
        provided = [
            k for k, v in {
                "path": path, "archive_path": archive_path, "base64_value": base64_value,
            }.items() if v is not None
        ]
        if len(provided) != 1:
            raise ValueError(
                f"Exactly one of path, archive_path, or base64_value must be provided; got: {provided}"
            )
        if path is not None:
            extension_data = {"type": "path", "path": path}
        elif archive_path is not None:
            extension_data = {"type": "archivePath", "path": archive_path}
        else:
            assert base64_value is not None
            extension_data = {"type": "base64", "value": base64_value}
        params = {"extensionData": extension_data}
        cmd = command_builder("webExtension.install", params)
        try:
            return self._conn.execute(cmd)
        except Exception as e:
            if "Method not available" in str(e):
                raise RuntimeError(
                    "webExtension.install failed with 'Method not available'. "
                    "This likely means that web extension support is disabled. "
                    "Enable unsafe extension debugging and/or set options.enable_webextensions "
                    "in your WebDriver configuration."
                ) from e
            raise''',
            '''    def uninstall(self, extension: str | dict):
        """Uninstall a web extension.

        Args:
            extension: Either the extension ID string returned by ``install``,
                or the full result dict returned by ``install`` (the
                ``"extension"`` value is extracted automatically).

        Raises:
            ValueError: If extension is not provided or is None.
        """
        if isinstance(extension, dict):
            extension_id: Any = extension.get("extension")
        else:
            extension_id = extension

        if extension_id is None:
            raise ValueError("extension parameter is required")

        params = {"extension": extension_id}
        cmd = command_builder("webExtension.uninstall", params)
        return self._conn.execute(cmd)''',
        ],
    },
    "input": {
        # FileDialogInfo needs from_json for event deserialization
        "exclude_types": ["FileDialogInfo", "PointerMoveAction", "PointerDownAction"],
        "extra_dataclasses": [
            '''@dataclass
class FileDialogInfo:
    """FileDialogInfo - parameters for the input.fileDialogOpened event."""

    context: Any | None = None
    element: Any | None = None
    multiple: bool | None = None

    @classmethod
    def from_json(cls, params: dict) -> FileDialogInfo:
        """Deserialize event params into FileDialogInfo."""
        return cls(
            context=params.get("context"),
            element=params.get("element"),
            multiple=params.get("multiple"),
        )''',
            '''@dataclass
class PointerMoveAction:
    """PointerMoveAction."""

    type: str = field(default="pointerMove", init=False)
    x: Any | None = None
    y: Any | None = None
    duration: Any | None = None
    origin: Any | None = None
    properties: Any | None = None''',
            '''@dataclass
class PointerDownAction:
    """PointerDownAction."""

    type: str = field(default="pointerDown", init=False)
    button: Any | None = None
    properties: Any | None = None''',
        ],
        "extra_methods": [
            '''    def add_file_dialog_handler(self, callback) -> int:
        """Subscribe to the input.fileDialogOpened event.

        Args:
            callback: Callable invoked with a FileDialogInfo when a file dialog opens.

        Returns:
            A handler ID that can be passed to remove_file_dialog_handler.
        """
        return self._event_manager.add_event_handler("file_dialog_opened", callback)

    def remove_file_dialog_handler(self, handler_id: int) -> None:
        """Unsubscribe a previously registered file dialog event handler.

        Args:
            handler_id: The handler ID returned by add_file_dialog_handler.
        """
        return self._event_manager.remove_event_handler("file_dialog_opened", handler_id)''',
        ],
    },
}


# ============================================================================
# Pre-processing Functions
# ============================================================================


def check_serialize_method(obj: Any) -> Any:
    """Check if object has to_bidi_dict() method and use it for serialization."""
    if obj and hasattr(obj, "to_bidi_dict"):
        return obj.to_bidi_dict()
    return obj


# ============================================================================
# Validation Functions
# ============================================================================


def validate_download_behavior(
    allowed: bool | None,
    destination_folder: str | None,
    user_contexts: Any | None = None,
) -> None:
    """Validate download behavior parameters.

    Args:
        allowed: Whether downloads are allowed
        destination_folder: Destination folder for downloads
        user_contexts: Optional list of user contexts (ignored for validation)

    Raises:
        ValueError: If parameters are invalid
    """
    if allowed is True and not destination_folder:
        raise ValueError("destination_folder is required when allowed=True")
    if allowed is False and destination_folder:
        raise ValueError("destination_folder should not be provided when allowed=False")


# ============================================================================
# Transformation Functions
# ============================================================================


def transform_download_params(
    allowed: bool | None,
    destination_folder: str | None,
) -> dict[str, Any]:
    """Transform download parameters into download_behavior object.

    Args:
        allowed: Whether downloads are allowed
        destination_folder: Destination folder for downloads

    Returns:
        Dictionary representing the download_behavior object, or None if allowed is None
    """
    if allowed is True:
        return {
            "type": "allowed",
            # Convert pathlib.Path (or any path-like) to str so the BiDi
            # protocol always receives a plain JSON string.
            "destinationFolder": (str(destination_folder) if destination_folder is not None else None),
        }
    elif allowed is False:
        return {"type": "denied"}
    else:  # None — reset to browser default (sent as JSON null)
        return None


# ============================================================================
# Dataclass Method Templates
# ============================================================================

DATACLASS_METHOD_TEMPLATES: dict[str, dict[str, str]] = {
    "ClientWindowInfo": {
        "get_client_window": "return self.client_window",
        "get_state": "return self.state",
        "get_width": "return self.width",
        "get_height": "return self.height",
        "is_active": "return self.active",
        "get_x": "return self.x",
        "get_y": "return self.y",
    },
    "BrowsingContext": {
        "add_event_handler": "_add_event_handler_impl",
        "remove_event_handler": "_remove_event_handler_impl",
    },
}

DATACLASS_METHOD_DOCSTRINGS: dict[str, dict[str, str]] = {
    "ClientWindowInfo": {
        "get_client_window": "Get the client window ID.",
        "get_state": "Get the client window state.",
        "get_width": "Get the client window width.",
        "get_height": "Get the client window height.",
        "is_active": "Check if the client window is active.",
        "get_x": "Get the client window X position.",
        "get_y": "Get the client window Y position.",
    },
    "BrowsingContext": {
        "add_event_handler": "Add an event handler for browsing context events.",
        "remove_event_handler": "Remove an event handler by callback ID.",
    },
}

# ============================================================================
# Event Handler Support for BrowsingContext
# ============================================================================


def _add_event_handler(
    self,
    event_name: str,
    callback: callable,
    contexts: list[str] | None = None,
) -> str:
    """Add an event handler for a browsing context event.

    Supported events:
    - 'context_created'
    - 'context_destroyed'
    - 'navigation_started'
    - 'navigation_committed'
    - 'navigation_failed'
    - 'dom_content_loaded'
    - 'load'
    - 'fragment_navigated'
    - 'user_prompt_opened'
    - 'user_prompt_closed'
    - 'download_will_begin'
    - 'download_end'
    - 'history_updated'

    Args:
        self: The module instance this handler is bound to.
        event_name: The name of the event to subscribe to
        callback: Callback function to invoke when event occurs
        contexts: Optional list of context IDs to limit event subscription

    Returns:
        A callback ID that can be used to unsubscribe the handler
    """
    if not hasattr(self, "_event_handlers"):
        self._event_handlers = {}
        self._event_callback_id_counter = 0

    # Generate unique callback ID
    self._event_callback_id_counter += 1
    callback_id = f"callback_{self._event_callback_id_counter}"

    # Store the handler
    self._event_handlers[callback_id] = {
        "event": event_name,
        "callback": callback,
        "contexts": contexts,
    }

    # Subscribe via the driver's event listening mechanism
    if hasattr(self._driver, "_subscribe_event"):
        self._driver._subscribe_event(event_name, callback, contexts)

    return callback_id


def _remove_event_handler(
    self,
    callback_id: str,
) -> None:
    """Remove an event handler by its callback ID.

    Args:
        self: The module instance this handler is bound to.
        callback_id: The callback ID returned from add_event_handler
    """
    if not hasattr(self, "_event_handlers"):
        return

    if callback_id in self._event_handlers:
        handler_info = self._event_handlers[callback_id]

        # Unsubscribe from the driver
        if hasattr(self._driver, "_unsubscribe_event"):
            self._driver._unsubscribe_event(
                handler_info["event"],
                handler_info["callback"],
                handler_info["contexts"],
            )

        del self._event_handlers[callback_id]
