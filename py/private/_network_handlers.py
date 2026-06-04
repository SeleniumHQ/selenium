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

"""High-level request interception helpers for the WebDriver BiDi network module.

This module is copied verbatim into the generated ``selenium.webdriver.common.bidi``
package by Bazel (see ``create-bidi-src`` in ``py/BUILD.bazel``).  The generated
``network`` module re-exports :class:`Request` and instantiates
:class:`RequestHandlerRegistry`, which layer a user-friendly handler API on top
of the CDDL-generated low-level commands (``network.addIntercept``,
``network.continueRequest``, ``network.failRequest``, ``network.provideResponse``).

Handlers registered through :meth:`RequestHandlerRegistry.add_handler` receive a
:class:`Request` and may observe it, mutate it, fail it, or stub a response.
After every matching handler has run, the registry reconciles the recorded
outcome and issues exactly one BiDi command per request:

1. If any handler called :meth:`Request.fail`, the request is failed.
2. Else if any handler called :meth:`Request.provide_response`, the stubbed
   response is provided.
3. Else if any handler mutated the request, it is continued with the mutations.
4. Otherwise the request is continued unmodified.

This mirrors the reconciliation rules in the cross-binding BiDi API design and
means purely observational handlers never stall the page.
"""

from __future__ import annotations

import logging
import re
from collections.abc import Callable
from typing import Any

from selenium.webdriver.common.bidi.common import command_builder

logger = logging.getLogger(__name__)

# Event names accepted by the legacy phase-based add_request_handler API.
LEGACY_REQUEST_HANDLER_EVENTS = ("auth_required", "before_request", "before_request_sent")


def looks_like_url_glob(value: Any) -> bool:
    """Heuristically distinguish a URL glob from a legacy event name.

    URL globs contain wildcard or URL punctuation (``* ? / : .``); bare
    word-like strings are assumed to be (possibly misspelled) event names so
    the legacy API can reject them with a helpful error.
    """
    return isinstance(value, str) and any(char in value for char in "*?/:.")


def _decode_bytes_value(value: Any) -> Any:
    """Decode a BiDi BytesValue dict to a plain string where possible."""
    if isinstance(value, dict) and value.get("type") == "string":
        return value.get("value")
    return value


def _encode_bytes_value(value: Any) -> Any:
    """Encode a plain string as a BiDi BytesValue dict; pass dicts through."""
    if isinstance(value, str):
        return {"type": "string", "value": value}
    if hasattr(value, "to_bidi_dict"):
        return value.to_bidi_dict()
    return value


def headers_to_dict(headers: list | None) -> dict[str, str]:
    """Convert a BiDi header list to a name → value mapping."""
    result: dict[str, str] = {}
    for header in headers or []:
        if isinstance(header, dict):
            result[header.get("name")] = _decode_bytes_value(header.get("value"))
    return result


def dict_to_headers(headers: dict[str, Any] | None) -> list[dict]:
    """Convert a name → value mapping to a BiDi header list."""
    return [{"name": name, "value": _encode_bytes_value(value)} for name, value in (headers or {}).items()]


def cookies_to_list(cookies: list | None) -> list[dict]:
    """Convert BiDi request cookies to plain dicts with decoded values."""
    result = []
    for cookie in cookies or []:
        if isinstance(cookie, dict):
            decoded = dict(cookie)
            decoded["value"] = _decode_bytes_value(cookie.get("value"))
            result.append(decoded)
    return result


def list_to_cookie_headers(cookies: list | None) -> list[dict]:
    """Convert plain cookie dicts to BiDi CookieHeader entries."""
    result = []
    for cookie in cookies or []:
        if hasattr(cookie, "to_bidi_dict"):
            result.append(cookie.to_bidi_dict())
        elif isinstance(cookie, dict):
            result.append({"name": cookie.get("name"), "value": _encode_bytes_value(cookie.get("value"))})
    return result


def glob_to_regex(pattern: str) -> re.Pattern:
    """Compile a URL glob (``*``, ``**``, ``?``) into a regular expression.

    ``*`` matches within a path segment, ``**`` matches across segments, and
    ``?`` matches a single character.  Matching is anchored at both ends.
    """
    parts: list[str] = []
    i = 0
    while i < len(pattern):
        char = pattern[i]
        if char == "*":
            if pattern[i : i + 2] == "**":
                parts.append(".*")
                i += 2
            else:
                parts.append("[^/]*")
                i += 1
        elif char == "?":
            parts.append("[^/]")
            i += 1
        else:
            parts.append(re.escape(char))
            i += 1
    return re.compile("".join(parts) + r"\Z")


def _glob_component(component: str) -> str:
    """Collapse ``**`` to the single URLPattern wildcard ``*``."""
    return component.replace("**", "*")


def glob_to_url_pattern(pattern: str) -> dict | None:
    """Translate a URL glob into a BiDi ``network.UrlPatternPattern`` dict.

    Returns ``{}`` when the glob matches everything (no browser-side filter
    needed) and ``None`` when the glob cannot be expressed as a UrlPattern —
    callers should then intercept everything and rely on Python-side matching.
    """
    if pattern in ("*", "**"):
        return {}
    # ``?`` is both a glob wildcard and the URL query separator; a UrlPattern
    # translation would be ambiguous, so defer to Python-side matching.
    if "://" not in pattern or "?" in pattern:
        return None
    scheme, _, rest = pattern.partition("://")
    host, slash, path = rest.partition("/")
    port = None
    if ":" in host:
        host, _, port = host.partition(":")
    result: dict[str, Any] = {"type": "pattern"}
    if scheme not in ("*", "**", ""):
        result["protocol"] = _glob_component(scheme)
    if host not in ("*", "**", ""):
        result["hostname"] = _glob_component(host)
    if port:
        result["port"] = port
    if slash:
        result["pathname"] = _glob_component("/" + path)
    return result


def globs_to_url_patterns(patterns: list | None) -> list[dict] | None:
    """Translate URL globs into BiDi UrlPatterns for ``network.addIntercept``.

    Returns ``None`` when no browser-side filtering should be applied (match
    everything, or at least one glob is untranslatable).  Raw dict patterns are
    passed through unchanged so callers can supply wire-level UrlPatterns.
    """
    if not patterns:
        return None
    translated = []
    for pattern in patterns:
        if isinstance(pattern, dict):
            translated.append(pattern)
            continue
        url_pattern = glob_to_url_pattern(pattern)
        if url_pattern is None or url_pattern == {}:
            return None
        translated.append(url_pattern)
    return translated or None


class Request:
    """Wraps a BiDi network request event and provides request action methods.

    Attributes:
        url: The request URL.
        method: The HTTP method (e.g. ``"GET"``).
        headers: The request headers as a name → value dict.
        cookies: The request cookies as a list of dicts.
        body: The request body. BiDi does not expose the outgoing body at the
            ``beforeRequestSent`` phase, so this is ``None`` unless mutated.
        resource_type: The resource destination (e.g. ``"script"``, ``"image"``)
            when reported by the browser.
    """

    def __init__(self, conn, params, deferred: bool = False):
        self._conn = conn
        self._params = params if isinstance(params, dict) else {}
        req = self._params.get("request", {}) or {}
        self.url = req.get("url", "")
        self._request_id = req.get("request")
        self.method = req.get("method")
        self.headers = headers_to_dict(req.get("headers"))
        self.cookies = cookies_to_list(req.get("cookies"))
        self.body = None
        self.resource_type = req.get("destination") or req.get("initiatorType")
        # Deferred requests record actions for later reconciliation by the
        # registry; non-deferred (legacy) requests execute actions immediately.
        self._deferred = deferred
        self._handled = False
        self._failed = False
        self._stub: dict | None = None
        self._mutations: dict[str, Any] = {}

    def set_url(self, url: str) -> None:
        """Change the request URL before it is continued."""
        self.url = url
        self._mutations["url"] = url

    def set_method(self, method: str) -> None:
        """Change the HTTP method before the request is continued."""
        self.method = method
        self._mutations["method"] = method

    def set_headers(self, headers: dict[str, Any]) -> None:
        """Replace the request headers before the request is continued."""
        self.headers = dict(headers)
        self._mutations["headers"] = self.headers

    def set_cookies(self, cookies: list) -> None:
        """Replace the request cookies before the request is continued."""
        self.cookies = list(cookies)
        self._mutations["cookies"] = self.cookies

    def set_body(self, body: str) -> None:
        """Set the request body before the request is continued."""
        self.body = body
        self._mutations["body"] = body

    def fail(self) -> None:
        """Fail the request.

        Takes precedence over stubbed responses and mutations when multiple
        handlers act on the same request.
        """
        if self._deferred:
            self._failed = True
        else:
            self._execute_fail()

    def provide_response(self, status=None, headers=None, body=None, reason_phrase=None) -> None:
        """Respond to the request with a stubbed response.

        Args:
            status: HTTP status code for the stubbed response.
            headers: Response headers as a name → value dict.
            body: Response body string.
            reason_phrase: Optional HTTP reason phrase.
        """
        stub = {
            "status": status,
            "headers": headers,
            "body": body,
            "reason_phrase": reason_phrase,
        }
        if self._deferred:
            if self._stub is None:
                self._stub = stub
        else:
            self._stub = stub
            self._execute_provide_response()

    def continue_request(self, **kwargs) -> None:
        """Continue the intercepted request, applying any recorded mutations.

        Keyword arguments are passed through to ``network.continueRequest`` and
        override recorded mutations.  Data URLs (``data:``) are skipped silently
        because browsers do not create an interceptable request entry for them,
        so calling ``network.continueRequest`` would raise "no such request".
        """
        self._handled = True
        if self.url.startswith("data:"):
            return
        params = self._continue_params()
        params.update(kwargs)
        self._conn.execute(command_builder("network.continueRequest", params))

    def _continue_params(self) -> dict:
        params: dict[str, Any] = {"request": self._request_id}
        mutations = self._mutations
        if "url" in mutations:
            params["url"] = mutations["url"]
        if "method" in mutations:
            params["method"] = mutations["method"]
        if "headers" in mutations:
            params["headers"] = dict_to_headers(mutations["headers"])
        if "cookies" in mutations:
            params["cookies"] = list_to_cookie_headers(mutations["cookies"])
        if "body" in mutations:
            params["body"] = _encode_bytes_value(mutations["body"])
        return params

    def _execute_fail(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        self._conn.execute(command_builder("network.failRequest", {"request": self._request_id}))

    def _execute_provide_response(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        stub = self._stub or {}
        params: dict[str, Any] = {"request": self._request_id}
        if stub.get("status") is not None:
            params["statusCode"] = stub["status"]
        if stub.get("reason_phrase") is not None:
            params["reasonPhrase"] = stub["reason_phrase"]
        if stub.get("headers") is not None:
            params["headers"] = dict_to_headers(stub["headers"])
        if stub.get("body") is not None:
            params["body"] = _encode_bytes_value(stub["body"])
        self._conn.execute(command_builder("network.provideResponse", params))

    def _resolve(self) -> None:
        """Reconcile recorded handler actions into a single BiDi command."""
        if self._handled:
            return
        if self._failed:
            self._execute_fail()
        elif self._stub is not None:
            self._execute_provide_response()
        else:
            self.continue_request()


class _HandlerEntry:
    """A registered request handler with its patterns and intercept."""

    def __init__(self, handler_id: str, patterns: list | None, callback: Callable, intercept_id: str | None):
        self.handler_id = handler_id
        self.callback = callback
        self.intercept_id = intercept_id
        self._regexes = [glob_to_regex(p) for p in patterns or [] if isinstance(p, str)]

    def matches(self, url: str) -> bool:
        if not self._regexes:
            return True
        return any(regex.match(url) for regex in self._regexes)


class RequestHandlerRegistry:
    """Tracks high-level request handlers and reconciles their outcomes.

    One ``network.beforeRequestSent`` subscription dispatches each event to all
    matching handlers, then reconciles the request exactly once.  Each handler
    gets its own browser-side intercept so removal restores prior behavior.
    """

    def __init__(self, network):
        self._network = network
        self._handlers: dict[str, _HandlerEntry] = {}
        self._subscription_callback_id: int | None = None
        self._counter = 0

    def add_handler(self, url_patterns, callback: Callable) -> str:
        """Register a handler; returns a handler ID for later removal."""
        if isinstance(url_patterns, str):
            url_patterns = [url_patterns]
        patterns = list(url_patterns) if url_patterns else None
        bidi_patterns = globs_to_url_patterns(patterns)
        intercept_result = self._network._add_intercept(phases=["beforeRequestSent"], url_patterns=bidi_patterns)
        intercept_id = intercept_result.get("intercept") if intercept_result else None
        if self._subscription_callback_id is None:
            self._subscription_callback_id = self._network.add_event_handler("before_request", self._on_event)
        self._counter += 1
        handler_id = f"request-handler-{self._counter}"
        self._handlers[handler_id] = _HandlerEntry(handler_id, patterns, callback, intercept_id)
        logger.debug("Added request handler %s (patterns=%s)", handler_id, patterns)
        return handler_id

    def remove_handler(self, handler_id: str) -> None:
        """Remove a handler and its intercept by handler ID."""
        entry = self._handlers.pop(handler_id, None)
        if entry is None:
            raise ValueError(f"Request handler '{handler_id}' not found")
        if entry.intercept_id:
            self._network._remove_intercept(entry.intercept_id)
        if not self._handlers and self._subscription_callback_id is not None:
            self._network.remove_event_handler("before_request", self._subscription_callback_id)
            self._subscription_callback_id = None
        logger.debug("Removed request handler %s", handler_id)

    def clear(self) -> None:
        """Remove all registered handlers and their intercepts."""
        for handler_id in list(self._handlers):
            self.remove_handler(handler_id)

    def _on_event(self, params) -> None:
        if not isinstance(params, dict):
            return
        request = Request(self._network._conn, params, deferred=True)
        for entry in list(self._handlers.values()):
            if not entry.matches(request.url):
                continue
            try:
                entry.callback(request)
            except Exception:
                logger.exception("Request handler %s raised; continuing request processing", entry.handler_id)
        if not params.get("isBlocked"):
            return
        # Only reconcile requests paused by one of our intercepts; requests
        # blocked by other subsystems (e.g. legacy handlers) are theirs to
        # continue.
        our_intercepts = {entry.intercept_id for entry in self._handlers.values() if entry.intercept_id}
        blocking_intercepts = set(params.get("intercepts") or [])
        if our_intercepts & blocking_intercepts:
            request._resolve()
