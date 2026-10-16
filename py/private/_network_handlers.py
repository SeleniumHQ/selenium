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

"""High-level request/response interception helpers for the WebDriver BiDi network module.

This module is copied verbatim into the generated ``selenium.webdriver.common.bidi``
package by Bazel (see ``create-bidi-src`` in ``py/BUILD.bazel``).  The generated
``network`` module re-exports :class:`Request` and :class:`Response` and
instantiates the handler registries, which layer a user-friendly handler API on
top of the CDDL-generated low-level commands (``network.addIntercept``,
``network.continueRequest``, ``network.continueResponse``,
``network.failRequest``, ``network.provideResponse``).

The behavior here implements decision record 17685, "The network async/event
API" (``docs/decisions/17685-network-handler-behavior.md``).  The rules that
shape this module:

* **Later-registered handlers are consulted first** (decision 6).  Registering a
  handler locally therefore overrides one installed by a shared suite.
* **The first handler to settle a disposition resolves the event and stops the
  chain** (decision 4).  A request settles with :meth:`Request.fail`,
  :meth:`Request.respond` or :meth:`Request.submit`; a response with
  :meth:`Response.fail` or :meth:`Response.submit`; a challenge with
  :meth:`AuthenticationRequest.authenticate` or
  :meth:`AuthenticationRequest.cancel`.  Settling twice inside one handler
  raises :class:`AlreadySettledError`.
* **A handler that only stages mutations does not settle** (decision 5); the
  event, carrying those mutations, passes to the next handler, and if nothing
  ever settles it proceeds with them.
* **An uncaught exception fails the event** (decision 7): staged mutations are
  discarded, ``network.failRequest`` is sent so the failure is visible on the
  wire, no further handler runs, and the exception is re-raised from the next
  call into ``driver.network`` rather than being swallowed.
* **URL patterns are evaluated by the remote end** (decision 2).  Selenium
  validates them locally and forwards them; it performs no matching and expands
  no globs of its own.  Which handlers are in an event's chain is therefore
  decided by which of their intercepts blocked it.
* **Request bodies are collected only when a handler opts in at registration**
  (decision 10), and Selenium owns the collector's lifecycle and size cap.
* **Handlers are scoped to one window handle by default** (decision 11), or to a
  window handle or user context named at registration — never both.

Extra headers registered through :meth:`RequestHandlerRegistry.set_extra_header`
are merged into every subsequent request.  The registry pauses each request at
``beforeRequestSent`` with a match-everything intercept and merges the headers
while resolving it — the same single continue cycle that applies handler
mutations.
"""

from __future__ import annotations

import logging
import warnings
from collections.abc import Callable
from typing import Any

from selenium.webdriver.common.bidi.common import command_builder

logger = logging.getLogger(__name__)

# Event names accepted by the legacy phase-based add_request_handler API.
LEGACY_REQUEST_HANDLER_EVENTS = ("auth_required", "before_request", "before_request_sent")

# Decision 10 puts the collector's size cap on Selenium rather than the user.
DEFAULT_MAX_BODY_SIZE = 5 * 1024 * 1024

# The components network.UrlPatternPattern accepts; each is an optional string.
URL_PATTERN_COMPONENTS = ("protocol", "hostname", "port", "pathname", "search")


class AlreadySettledError(RuntimeError):
    """Raised when a handler settles the same event more than once.

    Decision 4 makes the first disposition final, so a second call is a bug in
    the handler rather than an override of the first.
    """


class HandlerHandle(str):
    """The handle returned when a handler is registered.

    Decision 1 requires ``add`` to return a handle object rather than a bare id,
    so the handle cannot be confused with an unrelated identifier.  It subclasses
    ``str`` so that handles remain usable everywhere the plain string handler IDs
    returned by earlier releases were accepted.
    """

    def __new__(cls, handler_id: str, family: str) -> HandlerHandle:
        handle = super().__new__(cls, handler_id)
        handle.family = family
        return handle

    def __repr__(self) -> str:
        return f"<HandlerHandle {self.family} {str.__repr__(self)}>"


class _Original:
    """A read-only snapshot of an event as it arrived.

    Decision 9 lets a handler evaluate a condition against the unmodified event
    even while earlier handlers have staged changes onto the live wrapper.
    """

    def __init__(self, **values: Any) -> None:
        self.__dict__.update(values)

    def __setattr__(self, name: str, value: Any) -> None:
        raise AttributeError("The original event value is read-only")

    def __repr__(self) -> str:
        fields = ", ".join(f"{name}={value!r}" for name, value in self.__dict__.items())
        return f"<Original {fields}>"


def looks_like_url_glob(value: Any) -> bool:
    """Heuristically distinguish a URL pattern from a legacy event name.

    URL patterns contain wildcard or URL punctuation (``* ? / : .``); bare
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


# Optional network.SetCookieHeader fields, accepting both snake_case (Python
# style) and camelCase (wire style) keys from user-supplied cookie dicts.
_SET_COOKIE_FIELD_ALIASES = {
    "domain": "domain",
    "expiry": "expiry",
    "http_only": "httpOnly",
    "httpOnly": "httpOnly",
    "max_age": "maxAge",
    "maxAge": "maxAge",
    "path": "path",
    "same_site": "sameSite",
    "sameSite": "sameSite",
    "secure": "secure",
}


def list_to_set_cookie_headers(cookies: list | None) -> list[dict]:
    """Convert plain cookie dicts to BiDi SetCookieHeader entries."""
    result = []
    for cookie in cookies or []:
        if hasattr(cookie, "to_bidi_dict"):
            result.append(cookie.to_bidi_dict())
        elif isinstance(cookie, dict):
            entry = {"name": cookie.get("name"), "value": _encode_bytes_value(cookie.get("value"))}
            for key, wire_key in _SET_COOKIE_FIELD_ALIASES.items():
                if cookie.get(key) is not None:
                    entry[wire_key] = cookie[key]
            result.append(entry)
    return result


def _url_pattern_from_string(pattern: str) -> dict:
    """Wrap a pattern string as a BiDi ``network.UrlPatternString``."""
    if not pattern:
        raise ValueError("A URL pattern string must not be empty")
    if any(char in pattern for char in "*?"):
        logger.warning(
            "URL pattern %r looks like a glob. Selenium forwards URL patterns to the remote end "
            "unchanged and does not expand them; put finer matching inside the handler instead.",
            pattern,
        )
    return {"type": "string", "pattern": pattern}


def _url_pattern_from_mapping(pattern: dict) -> dict:
    """Validate a component mapping as a BiDi ``network.UrlPatternPattern``."""
    kind = pattern.get("type")
    if kind == "string":
        value = pattern.get("pattern")
        if not isinstance(value, str) or not value:
            raise ValueError("A 'string' URL pattern requires a non-empty 'pattern' value")
        return {"type": "string", "pattern": value}
    if kind not in (None, "pattern"):
        raise ValueError(f"Unsupported URL pattern type '{kind}'; use 'string' or 'pattern'")
    components = {name: value for name, value in pattern.items() if name != "type"}
    unknown = sorted(set(components) - set(URL_PATTERN_COMPONENTS))
    if unknown:
        raise ValueError(
            f"Unsupported URL pattern component(s): {', '.join(unknown)}. "
            f"Supported components: {', '.join(URL_PATTERN_COMPONENTS)}"
        )
    result: dict[str, Any] = {"type": "pattern"}
    for name in URL_PATTERN_COMPONENTS:
        value = components.get(name)
        if value is None:
            continue
        if not isinstance(value, str):
            raise ValueError(f"URL pattern component '{name}' must be a string, got {type(value).__name__}")
        result[name] = value
    return result


def normalize_url_patterns(patterns: Any) -> list[dict] | None:
    """Translate user URL patterns into BiDi ``network.UrlPattern`` values.

    Decision 2 keeps URL matching on the remote end: a pattern is validated here
    and forwarded as given, and Selenium neither expands globs nor matches URLs
    itself.  Anything that is not a valid pattern raises before a command is
    sent.

    Accepts a single pattern or an iterable of them, where each is a pattern
    string, a mapping of ``network.UrlPatternPattern`` components, an object
    exposing ``to_bidi_dict()``, or a parsed URL exposing ``geturl()``.

    Returns:
        A list of wire-level UrlPattern dicts, or ``None`` when no patterns were
        given (match everything).
    """
    if patterns is None:
        return None
    if isinstance(patterns, (str, dict)) or hasattr(patterns, "to_bidi_dict") or hasattr(patterns, "geturl"):
        patterns = [patterns]
    normalized: list[dict] = []
    for pattern in patterns:
        if hasattr(pattern, "to_bidi_dict"):
            pattern = pattern.to_bidi_dict()
        elif hasattr(pattern, "geturl"):
            # A parsed URL is forwarded as a pattern string rather than being
            # taken apart into components (decision 2).
            pattern = pattern.geturl()
        if isinstance(pattern, str):
            normalized.append(_url_pattern_from_string(pattern))
        elif isinstance(pattern, dict):
            normalized.append(_url_pattern_from_mapping(pattern))
        else:
            raise TypeError(
                f"A URL pattern must be a string or a mapping of pattern components, got {type(pattern).__name__}"
            )
    return normalized or None


def default_window_handle(network: Any) -> str | None:
    """The window handle a handler is scoped to when none was given (decision 11)."""
    driver = getattr(network, "_driver", None)
    if driver is None:
        logger.debug("No driver is available, so the handler is not scoped to a window handle")
        return None
    try:
        return driver.current_window_handle
    except Exception:
        logger.debug("Could not resolve the current window handle", exc_info=True)
        return None


def record_handler_error(network: Any, error: BaseException, label: str) -> None:
    """Stash a handler's uncaught exception so it can surface to the user.

    Handlers run on the BiDi event-dispatch thread, which has no user frame to
    propagate into, so decision 7's "surfaces to the user" is honored by
    re-raising the exception from the next call into ``driver.network``.
    """
    logger.error("%s raised; the event was failed", label.capitalize(), exc_info=error)
    errors = getattr(network, "_handler_errors", None)
    if errors is None:
        errors = []
        network._handler_errors = errors
    errors.append(error)


class Request:
    """Wraps a BiDi network request event and provides request action methods.

    Attributes:
        url: The request URL.
        method: The HTTP method (e.g. ``"GET"``).
        headers: The request headers as a name → value dict.
        cookies: The request cookies as a list of dicts.
        body: The request body, available when the handler opted in with
            ``collect_body=True`` at registration (decision 10) or once a
            handler has staged one.
        resource_type: The resource destination (e.g. ``"script"``, ``"image"``)
            when reported by the browser.
        original: The event as it arrived, before any handler staged a change
            (decision 9).
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
        self.resource_type = req.get("destination") or req.get("initiatorType")
        self._body_size = req.get("bodySize")
        self.original = _Original(
            url=self.url,
            method=self.method,
            headers=dict(self.headers),
            cookies=list(self.cookies),
            resource_type=self.resource_type,
        )
        # Deferred requests are resolved by the registry once the handler chain
        # stops; non-deferred (legacy) requests execute actions immediately.
        self._deferred = deferred
        self._handled = False
        self._settled: str | None = None
        self._stub: dict | None = None
        self._mutations: dict[str, Any] = {}
        self._body: Any = None
        self._body_fetched = False
        self._body_collector: str | None = None

    @property
    def settled(self) -> bool:
        """Whether a handler has settled this request's disposition (decision 4)."""
        return self._settled is not None

    @property
    def body(self) -> Any:
        """The request body, or ``None`` when it was not collected.

        A body is fetched from the collector Selenium installed for a handler
        registered with ``collect_body=True``; it is not available otherwise
        (decision 10).
        """
        if self._body_fetched or self._body is not None:
            return self._body
        if self._body_collector is None or self._request_id is None:
            return None
        # A request the browser reports as bodyless has nothing to collect, and
        # asking for it anyway stalls the page: while the request is blocked in
        # the handler, network.getData never answers for a body that will never
        # arrive, so the request is not continued until the command times out.
        if not self._body_size:
            logger.debug("Request %s has no body to collect (bodySize=%r)", self.url, self._body_size)
            return None
        self._body_fetched = True
        params = {
            "dataType": "request",
            "collector": self._body_collector,
            "disown": False,
            "request": self._request_id,
        }
        try:
            result = self._conn.execute(command_builder("network.getData", params))
        except Exception:
            logger.debug("Could not collect the request body for %s", self.url, exc_info=True)
            return None
        self._body = _decode_bytes_value((result or {}).get("bytes"))
        return self._body

    @body.setter
    def body(self, value: Any) -> None:
        self._body = value
        self._body_fetched = True

    def _settle(self, disposition: str) -> None:
        if self._settled is not None:
            raise AlreadySettledError(
                f"This request was already settled with '{self._settled}'; a handler settles an event once"
            )
        self._settled = disposition

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

    def add_header(self, name: str, value: Any) -> None:
        """Stage one additional request header, leaving the others in place."""
        headers = dict(self.headers)
        headers[name] = value
        self.set_headers(headers)

    def remove_header(self, name: str) -> None:
        """Stage the removal of one request header by (case-insensitive) name."""
        lowered = name.lower()
        self.set_headers({key: value for key, value in self.headers.items() if key.lower() != lowered})

    def set_cookies(self, cookies: list) -> None:
        """Replace the request cookies before the request is continued."""
        self.cookies = list(cookies)
        self._mutations["cookies"] = self.cookies

    def set_body(self, body: str) -> None:
        """Set the request body before the request is continued."""
        self._body = body
        self._body_fetched = True
        self._mutations["body"] = body

    def fail(self) -> None:
        """Settle the request as an error; nothing reaches the server.

        Settling resolves the event and stops the handler chain (decision 4).
        """
        self._settle("fail")
        if not self._deferred:
            self._execute_fail()

    def respond(self, status=None, headers=None, body=None, reason_phrase=None) -> None:
        """Settle the request with a stubbed response; nothing reaches the server.

        Settling resolves the event and stops the handler chain (decision 4).

        Args:
            status: HTTP status code for the stubbed response.
            headers: Response headers as a name → value dict.
            body: Response body string.
            reason_phrase: Optional HTTP reason phrase.
        """
        self._settle("respond")
        self._stub = {
            "status": status,
            "headers": headers,
            "body": body,
            "reason_phrase": reason_phrase,
        }
        if not self._deferred:
            self._execute_provide_response()

    def submit(
        self,
        *,
        url: str | None = None,
        method: str | None = None,
        headers: dict[str, Any] | None = None,
        cookies: list | None = None,
        body: str | None = None,
    ) -> None:
        """Send the request now, with any staged mutations, and stop the chain.

        ``submit`` is never required — a request nothing settles continues anyway
        (decision 5) — and because it short-circuits the chain it overrides what
        a handler registered earlier would have done.

        Each keyword argument stages the corresponding mutation before the
        request is sent, overriding one recorded via ``set_url``/``set_method``/
        ``set_headers``/``set_cookies``/``set_body``.  Data URLs (``data:``) are
        skipped silently because browsers do not create an interceptable request
        entry for them.

        Args:
            url: Replacement request URL.
            method: Replacement HTTP method.
            headers: Replacement request headers as a name → value dict.
            cookies: Replacement request cookies as a list of dicts.
            body: Replacement request body string.
        """
        self._settle("submit")
        if url is not None:
            self.set_url(url)
        if method is not None:
            self.set_method(method)
        if headers is not None:
            self.set_headers(headers)
        if cookies is not None:
            self.set_cookies(cookies)
        if body is not None:
            self.set_body(body)
        if not self._deferred:
            self._execute_continue()

    def provide_response(self, status=None, headers=None, body=None, reason_phrase=None) -> None:
        """Deprecated alias for :meth:`respond`."""
        warnings.warn(
            "provide_response is deprecated, use respond instead",
            DeprecationWarning,
            stacklevel=2,
        )
        self.respond(status=status, headers=headers, body=body, reason_phrase=reason_phrase)

    def continue_request(
        self,
        *,
        url: str | None = None,
        method: str | None = None,
        headers: dict[str, Any] | None = None,
        cookies: list | None = None,
        body: str | None = None,
    ) -> None:
        """Deprecated alias for :meth:`submit`."""
        warnings.warn(
            "continue_request is deprecated, use submit instead",
            DeprecationWarning,
            stacklevel=2,
        )
        self.submit(url=url, method=method, headers=headers, cookies=cookies, body=body)

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

    def _execute_continue(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        self._conn.execute(command_builder("network.continueRequest", self._continue_params()))

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
        """Issue exactly one BiDi command for the settled (or unsettled) event."""
        if self._handled:
            return
        if self._settled == "fail":
            self._execute_fail()
        elif self._settled == "respond":
            self._execute_provide_response()
        else:
            self._execute_continue()

    def _fail_after_handler_error(self) -> None:
        """Discard staged mutations and fail the request (decision 7)."""
        self._mutations.clear()
        self._stub = None
        self._settled = "fail"
        if not self._handled:
            self._execute_fail()


class Response:
    """Wraps a BiDi ``network.responseStarted`` event and provides response action methods.

    Attributes:
        url: The response URL.
        status: The HTTP status code.
        reason_phrase: The HTTP status text reported by the browser.
        headers: The response headers as a name → value dict.
        mime_type: The response MIME type when reported by the browser.
        cookies: Cookies to set on the response. BiDi does not expose parsed
            response cookies at the ``responseStarted`` phase, so this is empty
            unless mutated via :meth:`set_cookies`.
        body: The response body. Intercepting a response holds it before its
            body is collected, so this is ``None`` unless mutated via
            :meth:`set_body` (decision 10).
        original: The event as it arrived, before any handler staged a change
            (decision 9).
    """

    def __init__(self, conn, params, deferred: bool = False):
        self._conn = conn
        self._params = params if isinstance(params, dict) else {}
        req = self._params.get("request", {}) or {}
        resp = self._params.get("response", {}) or {}
        self._request_id = req.get("request")
        self.url = resp.get("url") or req.get("url", "")
        self.status = resp.get("status")
        self.reason_phrase = resp.get("statusText")
        self.headers = headers_to_dict(resp.get("headers"))
        self.mime_type = resp.get("mimeType")
        self.cookies: list = []
        self.body = None
        self.original = _Original(
            url=self.url,
            status=self.status,
            reason_phrase=self.reason_phrase,
            headers=dict(self.headers),
            mime_type=self.mime_type,
        )
        # Deferred responses are resolved by the registry once the handler chain
        # stops; non-deferred responses execute actions immediately.
        self._deferred = deferred
        self._handled = False
        self._settled: str | None = None
        self._mutations: dict[str, Any] = {}

    @property
    def settled(self) -> bool:
        """Whether a handler has settled this response's disposition (decision 4)."""
        return self._settled is not None

    def _settle(self, disposition: str) -> None:
        if self._settled is not None:
            raise AlreadySettledError(
                f"This response was already settled with '{self._settled}'; a handler settles an event once"
            )
        self._settled = disposition

    def set_status(self, status: int, reason_phrase: str | None = None) -> None:
        """Change the response status code (and optionally the reason phrase)."""
        self.status = status
        self._mutations["status"] = status
        if reason_phrase is not None:
            self.reason_phrase = reason_phrase
            self._mutations["reason_phrase"] = reason_phrase

    def set_headers(self, headers: dict[str, Any]) -> None:
        """Replace the response headers before the response is continued."""
        self.headers = dict(headers)
        self._mutations["headers"] = self.headers

    def add_header(self, name: str, value: Any) -> None:
        """Stage one additional response header, leaving the others in place."""
        headers = dict(self.headers)
        headers[name] = value
        self.set_headers(headers)

    def remove_header(self, name: str) -> None:
        """Stage the removal of one response header by (case-insensitive) name."""
        lowered = name.lower()
        self.set_headers({key: value for key, value in self.headers.items() if key.lower() != lowered})

    def set_cookies(self, cookies: list) -> None:
        """Replace the cookies set by the response before it is continued."""
        self.cookies = list(cookies)
        self._mutations["cookies"] = self.cookies

    def set_body(self, body: str) -> None:
        """Replace the response body.

        The wire protocol cannot continue a response with a new body, so a
        body mutation is sent via ``network.provideResponse``, carrying
        over the (possibly mutated) status and headers.
        """
        self.body = body
        self._mutations["body"] = body

    def fail(self) -> None:
        """Settle the response as a failed request.

        Settling resolves the event and stops the handler chain (decision 4).
        """
        self._settle("fail")
        if not self._deferred:
            self._execute_fail()

    def submit(
        self,
        *,
        status: int | None = None,
        reason_phrase: str | None = None,
        headers: dict[str, Any] | None = None,
        cookies: list | None = None,
        body: str | None = None,
    ) -> None:
        """Deliver the response now, with any staged mutations, and stop the chain.

        The response has already round-tripped, so ``submit`` maps to
        ``network.provideResponse`` when a replacement body was given and to
        ``network.continueResponse`` otherwise (decision 4).  Data URLs
        (``data:``) are skipped silently because browsers do not create an
        interceptable entry for them.

        Args:
            status: Replacement HTTP status code.
            reason_phrase: Replacement HTTP reason phrase.
            headers: Replacement response headers as a name → value dict.
            cookies: Replacement set-cookie entries as a list of dicts.
            body: Replacement response body string.
        """
        self._settle("submit")
        if status is not None or reason_phrase is not None:
            self.set_status(self.status if status is None else status, reason_phrase)
        if headers is not None:
            self.set_headers(headers)
        if cookies is not None:
            self.set_cookies(cookies)
        if body is not None:
            self.set_body(body)
        if not self._deferred:
            self._execute_submit()

    def continue_response(
        self,
        *,
        status: int | None = None,
        reason_phrase: str | None = None,
        headers: dict[str, Any] | None = None,
        cookies: list | None = None,
    ) -> None:
        """Deprecated alias for :meth:`submit`."""
        warnings.warn(
            "continue_response is deprecated, use submit instead",
            DeprecationWarning,
            stacklevel=2,
        )
        self.submit(status=status, reason_phrase=reason_phrase, headers=headers, cookies=cookies)

    def _continue_params(self) -> dict:
        params: dict[str, Any] = {"request": self._request_id}
        mutations = self._mutations
        if "status" in mutations:
            params["statusCode"] = mutations["status"]
        if "reason_phrase" in mutations:
            params["reasonPhrase"] = mutations["reason_phrase"]
        if "headers" in mutations:
            params["headers"] = dict_to_headers(mutations["headers"])
        if "cookies" in mutations:
            params["cookies"] = list_to_set_cookie_headers(mutations["cookies"])
        return params

    def _execute_continue(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        self._conn.execute(command_builder("network.continueResponse", self._continue_params()))

    def _execute_fail(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        self._conn.execute(command_builder("network.failRequest", {"request": self._request_id}))

    def _execute_provide_response(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        # provideResponse replaces the whole response, so carry over the
        # current (possibly mutated) status and headers alongside the body.
        params: dict[str, Any] = {"request": self._request_id}
        if self.status is not None:
            params["statusCode"] = self.status
        if self.reason_phrase:
            params["reasonPhrase"] = self.reason_phrase
        if self.headers:
            params["headers"] = dict_to_headers(self.headers)
        if "cookies" in self._mutations:
            params["cookies"] = list_to_set_cookie_headers(self._mutations["cookies"])
        if self.body is not None:
            params["body"] = _encode_bytes_value(self.body)
        self._conn.execute(command_builder("network.provideResponse", params))

    def _execute_submit(self) -> None:
        if "body" not in self._mutations:
            self._execute_continue()
            return
        try:
            self._execute_provide_response()
        except Exception:
            # Some browsers cannot replace a body at the responseStarted
            # phase; continue with the remaining mutations rather than
            # leaving the response blocked and stalling the page.
            logger.exception("provideResponse failed; continuing response without the body mutation")
            self._handled = False
            self._execute_continue()

    def _resolve(self) -> None:
        """Issue exactly one BiDi command for the settled (or unsettled) event."""
        if self._handled:
            return
        if self._settled == "fail":
            self._execute_fail()
        else:
            self._execute_submit()

    def _fail_after_handler_error(self) -> None:
        """Discard staged mutations and fail the response (decision 7)."""
        self._mutations.clear()
        self.body = None
        self._settled = "fail"
        if not self._handled:
            self._execute_fail()


class AuthenticationRequest:
    """Wraps a BiDi ``network.authRequired`` event and provides auth action methods.

    Attributes:
        url: The URL of the request that triggered the challenge.
        realm: The authentication realm of the first challenge, when reported.
        scheme: The authentication scheme (e.g. ``"basic"``) of the first
            challenge, when reported.
        challenges: Every challenge as a list of ``{"scheme", "realm"}`` dicts.
        original: The event as it arrived (decision 9).
    """

    def __init__(self, conn, params, deferred: bool = False):
        self._conn = conn
        self._params = params if isinstance(params, dict) else {}
        req = self._params.get("request", {}) or {}
        resp = self._params.get("response", {}) or {}
        self._request_id = req.get("request")
        self.url = resp.get("url") or req.get("url", "")
        self.challenges = [challenge for challenge in resp.get("authChallenges") or [] if isinstance(challenge, dict)]
        first = self.challenges[0] if self.challenges else {}
        self.realm = first.get("realm")
        self.scheme = first.get("scheme")
        self.original = _Original(
            url=self.url,
            realm=self.realm,
            scheme=self.scheme,
            challenges=list(self.challenges),
        )
        # Deferred challenges are resolved by the registry once the handler
        # chain stops; non-deferred challenges execute actions immediately.
        self._deferred = deferred
        self._handled = False
        self._settled: str | None = None
        self._credentials: dict | None = None

    @property
    def settled(self) -> bool:
        """Whether a handler has settled this challenge (decision 4)."""
        return self._settled is not None

    def _settle(self, disposition: str) -> None:
        if self._settled is not None:
            raise AlreadySettledError(
                f"This challenge was already settled with '{self._settled}'; a handler settles an event once"
            )
        self._settled = disposition

    def authenticate(self, username: str, password: str) -> None:
        """Settle the challenge with the given credentials.

        Settling resolves the challenge and stops the handler chain (decision 4).
        """
        self._settle("authenticate")
        self._credentials = {"type": "password", "username": username, "password": password}
        if not self._deferred:
            self._execute_continue("provideCredentials")

    def cancel(self) -> None:
        """Cancel the challenge, failing the request with an auth error.

        Settling resolves the challenge and stops the handler chain (decision 4).
        """
        self._settle("cancel")
        if not self._deferred:
            self._execute_continue("cancel")

    def provide_credentials(self, username: str, password: str) -> None:
        """Deprecated alias for :meth:`authenticate`."""
        warnings.warn(
            "provide_credentials is deprecated, use authenticate instead",
            DeprecationWarning,
            stacklevel=2,
        )
        self.authenticate(username, password)

    def _execute_continue(self, action: str) -> None:
        self._handled = True
        params: dict[str, Any] = {"request": self._request_id, "action": action}
        if action == "provideCredentials":
            params["credentials"] = self._credentials
        self._conn.execute(command_builder("network.continueWithAuth", params))

    def _resolve(self) -> None:
        """Issue exactly one BiDi command for the settled (or unsettled) challenge."""
        if self._handled:
            return
        if self._settled == "cancel":
            self._execute_continue("cancel")
        elif self._settled == "authenticate":
            self._execute_continue("provideCredentials")
        else:
            # Nothing settled the challenge, so the browser's own behavior
            # (usually the authentication prompt) applies (decision 5).
            self._execute_continue("default")

    def _fail_after_handler_error(self) -> None:
        """Cancel the challenge after a handler raised (decision 7)."""
        self._credentials = None
        self._settled = "cancel"
        if not self._handled:
            self._execute_continue("cancel")


class _HandlerEntry:
    """A registered handler with its intercept, scope and body collector."""

    def __init__(
        self,
        handle: HandlerHandle,
        callback: Callable,
        intercept_id: str | None,
        *,
        window_handle: str | None = None,
        user_context: str | None = None,
        collector_id: str | None = None,
    ):
        self.handle = handle
        self.callback = callback
        self.intercept_id = intercept_id
        self.window_handle = window_handle
        self.user_context = user_context
        self.collector_id = collector_id

    def consulted_for(self, params: dict, blocking_intercepts: set) -> bool:
        """Whether this handler belongs to one event's chain.

        URL matching belongs to the remote end (decision 2), so a handler is in
        the chain when its own intercept is one of those that blocked the event
        — an event blocked on another handler's behalf does not reach it
        (decision 4).  Window-handle scope is likewise enforced by the remote
        through the intercept's ``contexts``; user-context scope is checked here
        because ``network.addIntercept`` cannot express it (decision 11).
        """
        if self.intercept_id is not None and self.intercept_id not in blocking_intercepts:
            return False
        if self.user_context is not None and params.get("userContext") != self.user_context:
            return False
        return True


class _BaseHandlerRegistry:
    """Tracks high-level handlers for one intercept phase and resolves their events.

    One event subscription dispatches each event along the chain of handlers
    that match it, last-registered first, and stops at the first handler to
    settle a disposition.  The event is then resolved exactly once.
    """

    # Subclasses configure the intercept phase, the subscription event key,
    # the handler-ID prefix and the wrapper class handed to callbacks.
    _phase: str
    _event_name: str
    _id_prefix: str
    _label: str
    # Only request handlers can collect a body (decision 10).
    _supports_body_collection = False

    def __init__(self, network):
        self._network = network
        self._handlers: dict[str, _HandlerEntry] = {}
        self._subscription_callback_id: int | None = None
        self._counter = 0

    def _wrap(self, params):
        raise NotImplementedError

    def add_handler(
        self,
        url_patterns,
        callback: Callable,
        *,
        collect_body: bool = False,
        window_handle: str | None = None,
        user_context: str | None = None,
    ) -> HandlerHandle:
        """Register a handler; returns the handle that removes it (decision 1)."""
        if window_handle is not None and user_context is not None:
            raise ValueError("A handler is scoped by a window handle or a user context, never both")
        if collect_body and not self._supports_body_collection:
            raise ValueError(f"A {self._label} cannot collect a body; only request bodies are collected")
        patterns = normalize_url_patterns(url_patterns)
        if window_handle is None and user_context is None:
            window_handle = default_window_handle(self._network)
        contexts = [window_handle] if window_handle is not None else None
        if user_context is not None:
            logger.debug(
                "network.addIntercept cannot scope to a user context, so every request is intercepted "
                "and those outside user context %s are continued untouched",
                user_context,
            )
        intercept_result = self._network._add_intercept(phases=[self._phase], url_patterns=patterns, contexts=contexts)
        intercept_id = intercept_result.get("intercept") if intercept_result else None
        collector_id = None
        if collect_body:
            collector_id = self._network._add_data_collector(
                contexts=contexts,
                user_contexts=[user_context] if user_context is not None else None,
            )
        if self._subscription_callback_id is None:
            self._subscription_callback_id = self._network.add_event_handler(self._event_name, self._on_event)
        self._counter += 1
        handle = HandlerHandle(f"{self._id_prefix}-{self._counter}", self._label)
        self._handlers[str(handle)] = _HandlerEntry(
            handle,
            callback,
            intercept_id,
            window_handle=window_handle,
            user_context=user_context,
            collector_id=collector_id,
        )
        logger.debug(
            "Added %s %s (patterns=%s, window_handle=%s, user_context=%s, collect_body=%s)",
            self._label,
            handle,
            patterns,
            window_handle,
            user_context,
            collect_body,
        )
        return handle

    def remove_handler(self, handle) -> None:
        """Remove a handler, its intercept and its body collector by handle."""
        entry = self._handlers.pop(str(handle), None)
        if entry is None:
            raise ValueError(f"{self._label.capitalize()} '{handle}' not found")
        if entry.intercept_id:
            self._network._remove_intercept(entry.intercept_id)
        if entry.collector_id:
            self._network._remove_data_collector(entry.collector_id)
        if not self._keep_subscription() and self._subscription_callback_id is not None:
            self._network.remove_event_handler(self._event_name, self._subscription_callback_id)
            self._subscription_callback_id = None
        logger.debug("Removed %s %s", self._label, handle)

    def clear(self) -> None:
        """Remove all registered handlers and their intercepts."""
        for handler_id in list(self._handlers):
            self.remove_handler(handler_id)

    def intercept_ids(self) -> set:
        """Intercept IDs owned by this registry's handlers."""
        return {entry.intercept_id for entry in self._handlers.values() if entry.intercept_id}

    def _keep_subscription(self) -> bool:
        """Whether the event subscription is still needed."""
        return bool(self._handlers)

    def resubscribe(self) -> None:
        """Re-establish the event subscription after an external event-handler clear."""
        if self._keep_subscription():
            self._subscription_callback_id = self._network.add_event_handler(self._event_name, self._on_event)
        else:
            self._subscription_callback_id = None

    def _before_resolve(self, wrapped) -> None:
        """Hook run after the handler chain and before the event is resolved."""

    def _prepare(self, wrapped, entry: _HandlerEntry) -> None:
        """Hook run before each handler in the chain is called."""

    def _on_event(self, params) -> None:
        if not isinstance(params, dict):
            return
        blocking_intercepts = set(params.get("intercepts") or []) if params.get("isBlocked") else set()
        # Only resolve events paused by one of our intercepts; events blocked by
        # other subsystems (e.g. legacy handlers) are theirs to continue.
        ours = bool(self.intercept_ids() & blocking_intercepts)
        wrapped = self._wrap(params)
        error: BaseException | None = None
        # Decision 6: later-registered handlers are consulted first.
        for entry in reversed(list(self._handlers.values())):
            if not entry.consulted_for(params, blocking_intercepts):
                continue
            self._prepare(wrapped, entry)
            try:
                entry.callback(wrapped)
            except BaseException as exc:
                error = exc
                break
            # Decision 4: the first handler to settle stops the chain.
            if wrapped.settled:
                break
        if not ours:
            return
        if error is not None:
            # Record before failing: failing unblocks the browser, which lets the
            # user's navigation raise and call back into driver.network. Recording
            # afterwards races that call, so the exception could go unseen until a
            # later one (decision 7).
            record_handler_error(self._network, error, self._label)
            wrapped._fail_after_handler_error()
            return
        self._before_resolve(wrapped)
        wrapped._resolve()


class RequestHandlerRegistry(_BaseHandlerRegistry):
    """Dispatches ``network.beforeRequestSent`` events to request handlers.

    Also owns the extra-headers store: while any extra header is set every
    request is paused by a dedicated match-everything intercept and continued
    with the merged headers.  Sharing the registry's subscription and resolution
    means a request paused by both the extra-headers intercept and user handlers
    is still continued exactly once.
    """

    _phase = "beforeRequestSent"
    _event_name = "before_request"
    _id_prefix = "request-handler"
    _label = "request handler"
    _supports_body_collection = True

    def __init__(self, network):
        super().__init__(network)
        # Header names are case-insensitive per HTTP, so keys are lowercased.
        self.extra_headers: dict[str, Any] = {}
        self._extra_headers_intercept: str | None = None

    def _wrap(self, params):
        return Request(self._network._conn, params, deferred=True)

    def _prepare(self, request, entry: _HandlerEntry) -> None:
        # A body is readable only inside a handler that opted in (decision 10).
        request._body_collector = entry.collector_id

    def set_extra_header(self, name: str, value: str) -> None:
        """Record a header to merge into every subsequent request."""
        self.extra_headers[name.lower()] = value
        if self._extra_headers_intercept is None:
            result = self._network._add_intercept(phases=[self._phase])
            self._extra_headers_intercept = result.get("intercept") if result else None
        if self._subscription_callback_id is None:
            self._subscription_callback_id = self._network.add_event_handler(self._event_name, self._on_event)
        logger.debug("Added extra header %s", name.lower())

    def remove_extra_header(self, name: str) -> None:
        """Stop merging a header by (case-insensitive) name."""
        if self.extra_headers.pop(name.lower(), None) is None:
            raise ValueError(f"Extra header '{name}' not found")
        if not self.extra_headers:
            self._drop_extra_headers_intercept()
        logger.debug("Removed extra header %s", name.lower())

    def clear_extra_headers(self) -> None:
        """Stop merging all extra headers."""
        self.extra_headers.clear()
        self._drop_extra_headers_intercept()

    def _drop_extra_headers_intercept(self) -> None:
        if self._extra_headers_intercept:
            self._network._remove_intercept(self._extra_headers_intercept)
            self._extra_headers_intercept = None
        if not self._keep_subscription() and self._subscription_callback_id is not None:
            self._network.remove_event_handler(self._event_name, self._subscription_callback_id)
            self._subscription_callback_id = None

    def intercept_ids(self) -> set:
        ids = super().intercept_ids()
        if self._extra_headers_intercept:
            ids.add(self._extra_headers_intercept)
        return ids

    def _keep_subscription(self) -> bool:
        return bool(self._handlers or self.extra_headers)

    def _before_resolve(self, request) -> None:
        """Merge extra headers into requests about to be sent.

        Failed and stubbed requests never reach the wire and manually submitted
        requests have already been sent, so only requests still heading to the
        server are merged.
        """
        if not self.extra_headers:
            return
        if request._handled or request._settled in ("fail", "respond"):
            return
        merged = {name: value for name, value in request.headers.items() if name.lower() not in self.extra_headers}
        merged.update(self.extra_headers)
        request.set_headers(merged)


class ResponseHandlerRegistry(_BaseHandlerRegistry):
    """Dispatches ``network.responseStarted`` events to response handlers."""

    _phase = "responseStarted"
    _event_name = "response_started"
    _id_prefix = "response-handler"
    _label = "response handler"

    def _wrap(self, params):
        return Response(self._network._conn, params, deferred=True)


class AuthHandlerRegistry(_BaseHandlerRegistry):
    """Dispatches ``network.authRequired`` events to authentication handlers."""

    _phase = "authRequired"
    _event_name = "auth_required"
    _id_prefix = "auth-handler"
    _label = "authentication handler"

    def _wrap(self, params):
        return AuthenticationRequest(self._network._conn, params, deferred=True)
