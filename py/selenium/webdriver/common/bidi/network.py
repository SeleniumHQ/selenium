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


class SameSite:
    """SameSite."""

    STRICT = "strict"
    LAX = "lax"
    NONE = "none"
    DEFAULT = "default"


class DataType:
    """DataType."""

    REQUEST = "request"
    RESPONSE = "response"


class InterceptPhase:
    """InterceptPhase."""

    BEFOREREQUESTSENT = "beforeRequestSent"
    RESPONSESTARTED = "responseStarted"
    AUTHREQUIRED = "authRequired"


class ContinueWithAuthNoCredentials:
    """ContinueWithAuthNoCredentials."""

    DEFAULT = "default"
    CANCEL = "cancel"


@dataclass
class AuthChallenge:
    """AuthChallenge."""

    scheme: str | None = None
    realm: str | None = None


@dataclass
class AuthCredentials:
    """AuthCredentials."""

    type: str = field(default="password", init=False)
    username: str | None = None
    password: str | None = None


@dataclass
class BaseParameters:
    """BaseParameters."""

    context: Any | None = None
    is_blocked: bool | None = None
    navigation: Any | None = None
    redirect_count: Any | None = None
    request: Any | None = None
    timestamp: Any | None = None
    user_context: Any | None = None
    intercepts: list[Any] = field(default_factory=list)


@dataclass
class StringValue:
    """StringValue."""

    type: str = field(default="string", init=False)
    value: str | None = None


@dataclass
class Base64Value:
    """Base64Value."""

    type: str = field(default="base64", init=False)
    value: str | None = None


@dataclass
class Cookie:
    """Cookie."""

    name: str | None = None
    value: Any | None = None
    domain: str | None = None
    path: str | None = None
    size: Any | None = None
    http_only: bool | None = None
    secure: bool | None = None
    same_site: Any | None = None
    expiry: Any | None = None


@dataclass
class CookieHeader:
    """CookieHeader."""

    name: str | None = None
    value: Any | None = None


@dataclass
class FetchTimingInfo:
    """FetchTimingInfo."""

    time_origin: Any | None = None
    request_time: Any | None = None
    redirect_start: Any | None = None
    redirect_end: Any | None = None
    fetch_start: Any | None = None
    dns_start: Any | None = None
    dns_end: Any | None = None
    connect_start: Any | None = None
    connect_end: Any | None = None
    tls_start: Any | None = None
    request_start: Any | None = None
    response_start: Any | None = None
    response_end: Any | None = None


@dataclass
class Header:
    """Header."""

    name: str | None = None
    value: Any | None = None


@dataclass
class Initiator:
    """Initiator."""

    column_number: Any | None = None
    line_number: Any | None = None
    request: Any | None = None
    stack_trace: Any | None = None
    type: Any | None = None


@dataclass
class ResponseContent:
    """ResponseContent."""

    size: Any | None = None


@dataclass
class ResponseData:
    """ResponseData."""

    url: str | None = None
    protocol: str | None = None
    status: Any | None = None
    status_text: str | None = None
    from_cache: bool | None = None
    headers: list[Any] = field(default_factory=list)
    mime_type: str | None = None
    bytes_received: Any | None = None
    headers_size: Any | None = None
    body_size: Any | None = None
    content: Any | None = None
    auth_challenges: list[Any] = field(default_factory=list)


@dataclass
class SetCookieHeader:
    """SetCookieHeader."""

    name: str | None = None
    value: Any | None = None
    domain: str | None = None
    http_only: bool | None = None
    expiry: str | None = None
    max_age: Any | None = None
    path: str | None = None
    same_site: Any | None = None
    secure: bool | None = None


@dataclass
class UrlPatternPattern:
    """UrlPatternPattern."""

    type: str = field(default="pattern", init=False)
    protocol: str | None = None
    hostname: str | None = None
    port: str | None = None
    pathname: str | None = None
    search: str | None = None


@dataclass
class UrlPatternString:
    """UrlPatternString."""

    type: str = field(default="string", init=False)
    pattern: str | None = None


@dataclass
class AddDataCollectorParameters:
    """AddDataCollectorParameters."""

    data_types: list[Any] = field(default_factory=list)
    max_encoded_data_size: Any | None = None
    collector_type: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class AddDataCollectorResult:
    """AddDataCollectorResult."""

    collector: Any | None = None


@dataclass
class AddInterceptParameters:
    """AddInterceptParameters."""

    phases: list[Any] = field(default_factory=list)
    contexts: list[Any] = field(default_factory=list)
    url_patterns: list[Any] = field(default_factory=list)


@dataclass
class AddInterceptResult:
    """AddInterceptResult."""

    intercept: Any | None = None


@dataclass
class ContinueResponseParameters:
    """ContinueResponseParameters."""

    request: Any | None = None
    cookies: list[Any] = field(default_factory=list)
    credentials: Any | None = None
    headers: list[Any] = field(default_factory=list)
    reason_phrase: str | None = None
    status_code: Any | None = None


@dataclass
class ContinueWithAuthParameters:
    """ContinueWithAuthParameters."""

    request: Any | None = None


@dataclass
class ContinueWithAuthCredentials:
    """ContinueWithAuthCredentials."""

    action: str = field(default="provideCredentials", init=False)
    credentials: Any | None = None


@dataclass
class FailRequestParameters:
    """FailRequestParameters."""

    request: Any | None = None


@dataclass
class GetDataParameters:
    """GetDataParameters."""

    data_type: Any | None = None
    collector: Any | None = None
    disown: bool | None = None
    request: Any | None = None


@dataclass
class GetDataResult:
    """GetDataResult."""

    bytes: Any | None = None


@dataclass
class ProvideResponseParameters:
    """ProvideResponseParameters."""

    request: Any | None = None
    body: Any | None = None
    cookies: list[Any] = field(default_factory=list)
    headers: list[Any] = field(default_factory=list)
    reason_phrase: str | None = None
    status_code: Any | None = None


@dataclass
class RemoveDataCollectorParameters:
    """RemoveDataCollectorParameters."""

    collector: Any | None = None


@dataclass
class RemoveInterceptParameters:
    """RemoveInterceptParameters."""

    intercept: Any | None = None


@dataclass
class SetCacheBehaviorParameters:
    """SetCacheBehaviorParameters."""

    cache_behavior: Any | None = None
    contexts: list[Any] = field(default_factory=list)


@dataclass
class SetExtraHeadersParameters:
    """SetExtraHeadersParameters."""

    headers: list[Any] = field(default_factory=list)
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class ResponseStartedParameters:
    """ResponseStartedParameters."""

    response: Any | None = None


@dataclass
class DisownDataParameters:
    """DisownDataParameters."""

    data_type: Any | None = None
    collector: Any | None = None
    request: Any | None = None


# Backward-compatible alias for existing imports
disownDataParameters = DisownDataParameters


class BytesValue:
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


class Request:
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
        self._conn.execute(_cb("network.continueRequest", params))


# BiDi Event Name to Parameter Type Mapping
EVENT_NAME_MAPPING = {
    "auth_required": "network.authRequired",
    "before_request": "network.beforeRequestSent",
}


class Network:
    """WebDriver BiDi network module."""

    EVENT_CONFIGS: dict[str, EventConfig] = {}

    def __init__(self, conn) -> None:
        self._conn = conn
        self._event_manager = _EventManager(conn, self.EVENT_CONFIGS)
        self.intercepts: list[Any] = []
        self._handler_intercepts: dict[str, Any] = {}

    def add_data_collector(
        self,
        data_types: list[Any] | None = None,
        max_encoded_data_size: Any | None = None,
        collector_type: Any | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute network.addDataCollector."""
        if data_types is None:
            raise TypeError("add_data_collector() missing required argument: 'data_types'")
        if max_encoded_data_size is None:
            raise TypeError("add_data_collector() missing required argument: 'max_encoded_data_size'")

        params = {
            "dataTypes": data_types,
            "maxEncodedDataSize": max_encoded_data_size,
            "collectorType": collector_type,
            "contexts": contexts,
            "userContexts": user_contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.addDataCollector", params)
        result = self._conn.execute(cmd)
        return result

    def add_intercept(
        self,
        phases: list[Any] | None = None,
        contexts: list[Any] | None = None,
        url_patterns: list[Any] | None = None,
    ):
        """Execute network.addIntercept."""
        if phases is None:
            raise TypeError("add_intercept() missing required argument: 'phases'")

        params = {
            "phases": phases,
            "contexts": contexts,
            "urlPatterns": url_patterns,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.addIntercept", params)
        result = self._conn.execute(cmd)
        return result

    def continue_request(
        self,
        request: Any | None = None,
        body: Any | None = None,
        cookies: list[Any] | None = None,
        headers: list[Any] | None = None,
        method: Any | None = None,
        url: Any | None = None,
    ):
        """Execute network.continueRequest."""
        if request is None:
            raise TypeError("continue_request() missing required argument: 'request'")

        params = {
            "request": request,
            "body": body,
            "cookies": cookies,
            "headers": headers,
            "method": method,
            "url": url,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.continueRequest", params)
        result = self._conn.execute(cmd)
        return result

    def continue_response(
        self,
        request: Any | None = None,
        cookies: list[Any] | None = None,
        credentials: Any | None = None,
        headers: list[Any] | None = None,
        reason_phrase: Any | None = None,
        status_code: Any | None = None,
    ):
        """Execute network.continueResponse."""
        if request is None:
            raise TypeError("continue_response() missing required argument: 'request'")

        params = {
            "request": request,
            "cookies": cookies,
            "credentials": credentials,
            "headers": headers,
            "reasonPhrase": reason_phrase,
            "statusCode": status_code,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.continueResponse", params)
        result = self._conn.execute(cmd)
        return result

    def continue_with_auth(self, request: Any | None = None):
        """Execute network.continueWithAuth."""
        if request is None:
            raise TypeError("continue_with_auth() missing required argument: 'request'")

        params = {
            "request": request,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.continueWithAuth", params)
        result = self._conn.execute(cmd)
        return result

    def disown_data(self, data_type: Any | None = None, collector: Any | None = None, request: Any | None = None):
        """Execute network.disownData."""
        if data_type is None:
            raise TypeError("disown_data() missing required argument: 'data_type'")
        if collector is None:
            raise TypeError("disown_data() missing required argument: 'collector'")
        if request is None:
            raise TypeError("disown_data() missing required argument: 'request'")

        params = {
            "dataType": data_type,
            "collector": collector,
            "request": request,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.disownData", params)
        result = self._conn.execute(cmd)
        return result

    def fail_request(self, request: Any | None = None):
        """Execute network.failRequest."""
        if request is None:
            raise TypeError("fail_request() missing required argument: 'request'")

        params = {
            "request": request,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.failRequest", params)
        result = self._conn.execute(cmd)
        return result

    def get_data(
        self,
        data_type: Any | None = None,
        collector: Any | None = None,
        disown: bool | None = None,
        request: Any | None = None,
    ):
        """Execute network.getData."""
        if data_type is None:
            raise TypeError("get_data() missing required argument: 'data_type'")
        if request is None:
            raise TypeError("get_data() missing required argument: 'request'")

        params = {
            "dataType": data_type,
            "collector": collector,
            "disown": disown,
            "request": request,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.getData", params)
        result = self._conn.execute(cmd)
        return result

    def provide_response(
        self,
        request: Any | None = None,
        body: Any | None = None,
        cookies: list[Any] | None = None,
        headers: list[Any] | None = None,
        reason_phrase: Any | None = None,
        status_code: Any | None = None,
    ):
        """Execute network.provideResponse."""
        if request is None:
            raise TypeError("provide_response() missing required argument: 'request'")

        params = {
            "request": request,
            "body": body,
            "cookies": cookies,
            "headers": headers,
            "reasonPhrase": reason_phrase,
            "statusCode": status_code,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.provideResponse", params)
        result = self._conn.execute(cmd)
        return result

    def remove_data_collector(self, collector: Any | None = None):
        """Execute network.removeDataCollector."""
        if collector is None:
            raise TypeError("remove_data_collector() missing required argument: 'collector'")

        params = {
            "collector": collector,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.removeDataCollector", params)
        result = self._conn.execute(cmd)
        return result

    def remove_intercept(self, intercept: Any | None = None):
        """Execute network.removeIntercept."""
        if intercept is None:
            raise TypeError("remove_intercept() missing required argument: 'intercept'")

        params = {
            "intercept": intercept,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.removeIntercept", params)
        result = self._conn.execute(cmd)
        return result

    def set_cache_behavior(self, cache_behavior: Any | None = None, contexts: list[Any] | None = None):
        """Execute network.setCacheBehavior."""
        if cache_behavior is None:
            raise TypeError("set_cache_behavior() missing required argument: 'cache_behavior'")

        params = {
            "cacheBehavior": cache_behavior,
            "contexts": contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.setCacheBehavior", params)
        result = self._conn.execute(cmd)
        return result

    def set_extra_headers(
        self,
        headers: list[Any] | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute network.setExtraHeaders."""
        if headers is None:
            raise TypeError("set_extra_headers() missing required argument: 'headers'")

        params = {
            "headers": headers,
            "contexts": contexts,
            "userContexts": user_contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.setExtraHeaders", params)
        result = self._conn.execute(cmd)
        return result

    def before_request_sent(self, initiator: Any | None = None, method: Any | None = None, params: Any | None = None):
        """Execute network.beforeRequestSent."""
        if method is None:
            raise TypeError("before_request_sent() missing required argument: 'method'")
        if params is None:
            raise TypeError("before_request_sent() missing required argument: 'params'")

        params = {
            "initiator": initiator,
            "method": method,
            "params": params,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.beforeRequestSent", params)
        result = self._conn.execute(cmd)
        return result

    def fetch_error(self, error_text: Any | None = None, method: Any | None = None, params: Any | None = None):
        """Execute network.fetchError."""
        if error_text is None:
            raise TypeError("fetch_error() missing required argument: 'error_text'")
        if method is None:
            raise TypeError("fetch_error() missing required argument: 'method'")
        if params is None:
            raise TypeError("fetch_error() missing required argument: 'params'")

        params = {
            "errorText": error_text,
            "method": method,
            "params": params,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.fetchError", params)
        result = self._conn.execute(cmd)
        return result

    def response_completed(self, response: Any | None = None, method: Any | None = None, params: Any | None = None):
        """Execute network.responseCompleted."""
        if response is None:
            raise TypeError("response_completed() missing required argument: 'response'")
        if method is None:
            raise TypeError("response_completed() missing required argument: 'method'")
        if params is None:
            raise TypeError("response_completed() missing required argument: 'params'")

        params = {
            "response": response,
            "method": method,
            "params": params,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.responseCompleted", params)
        result = self._conn.execute(cmd)
        return result

    def response_started(self, response: Any | None = None):
        """Execute network.responseStarted."""
        if response is None:
            raise TypeError("response_started() missing required argument: 'response'")

        params = {
            "response": response,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("network.responseStarted", params)
        result = self._conn.execute(cmd)
        return result

    def _add_intercept(self, phases=None, url_patterns=None):
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
        return result

    def _remove_intercept(self, intercept_id):
        """Remove a low-level network intercept."""
        from selenium.webdriver.common.bidi.common import command_builder as _cb

        self._conn.execute(_cb("network.removeIntercept", {"intercept": intercept_id}))
        if intercept_id in self.intercepts:
            self.intercepts.remove(intercept_id)

    def add_request_handler(self, event, callback, url_patterns=None):
        """Add a handler for network requests at the specified phase.

        Args:
            event: Event name, e.g. ``"before_request"``.
            callback: Callable receiving a :class:`Request` instance.
            url_patterns: optional list of URL pattern dicts to filter.

        Returns:
            callback_id int for later removal via remove_request_handler.
        """
        phase_map = {
            "before_request": "beforeRequestSent",
            "before_request_sent": "beforeRequestSent",
            "response_started": "responseStarted",
            "auth_required": "authRequired",
        }
        phase = phase_map.get(event, "beforeRequestSent")
        intercept_result = self._add_intercept(phases=[phase], url_patterns=url_patterns)
        intercept_id = intercept_result.get("intercept") if intercept_result else None

        def _request_callback(params):
            raw = params if isinstance(params, dict) else (params.__dict__ if hasattr(params, "__dict__") else {})
            request = Request(self._conn, raw)
            callback(request)

        callback_id = self.add_event_handler(event, _request_callback)
        if intercept_id:
            self._handler_intercepts[callback_id] = intercept_id
        return callback_id

    def remove_request_handler(self, event, callback_id):
        """Remove a network request handler and its associated network intercept.

        Args:
            event: The event name used when adding the handler.
            callback_id: The int returned by add_request_handler.
        """
        self.remove_event_handler(event, callback_id)
        intercept_id = self._handler_intercepts.pop(callback_id, None)
        if intercept_id:
            self._remove_intercept(intercept_id)

    def clear_request_handlers(self):
        """Clear all request handlers and remove all tracked intercepts."""
        self.clear_event_handlers()
        for intercept_id in list(self.intercepts):
            self._remove_intercept(intercept_id)

    def add_auth_handler(self, username, password):
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
            raw = params if isinstance(params, dict) else (params.__dict__ if hasattr(params, "__dict__") else {})
            request_id = raw.get("request", {}).get("request") if isinstance(raw, dict) else None
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
        return callback_id

    def remove_auth_handler(self, callback_id):
        """Remove an auth handler by callback ID and its associated network intercept.

        Args:
            callback_id: The handler ID returned by add_auth_handler.
        """
        self.remove_event_handler("auth_required", callback_id)
        intercept_id = self._handler_intercepts.pop(callback_id, None)
        if intercept_id:
            self._remove_intercept(intercept_id)

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
# Event: network.authRequired
AuthRequired = globals().get("AuthRequiredParameters", dict)  # Fallback to dict if type not defined


# Populate EVENT_CONFIGS with event configuration mappings
_globals = globals()
Network.EVENT_CONFIGS = {
    "auth_required": EventConfig(
        "auth_required",
        "network.authRequired",
        _globals.get("AuthRequired", dict) if _globals.get("AuthRequired") else dict,
    ),
    "before_request": EventConfig("before_request", "network.beforeRequestSent", _globals.get("dict", dict)),
}
