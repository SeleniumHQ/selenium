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

"""The handler engine behind :class:`selenium.webdriver.common.network.Network`.

This is internal, not a supported API.  It turns registered handlers into
intercepts and resolves the events those intercepts block, issuing every wire
command through the internal BiDi protocol layer
(``selenium.webdriver.common._bidi``) rather than building payloads by hand.

The behavior implements decision record 17685, "The network async/event API"
(``docs/decisions/17685-network-handler-behavior.md``):

* **Later-registered handlers are consulted first** (decision 6), and **the first
  handler to settle a disposition resolves the event and stops the chain**
  (decision 4).  Settling twice inside one handler raises
  :class:`AlreadySettledError`.
* **A handler that only stages mutations does not settle** (decision 5); if
  nothing ever settles, the event proceeds with what was staged.
* **An uncaught exception fails the event** (decision 7) and is re-raised from
  the next call into ``driver.network``.
* **URL patterns are evaluated by the remote end** (decision 2).
* **Request bodies are collected only when a handler opts in** (decision 10).
* **Handlers are scoped to one window handle by default** (decision 11).

Decisions 4, 6, 7 and 11 change what an existing call does without changing the
call, so they cannot be deprecated side by side with the behavior they replace.
Until :data:`ADR_17685_DISPATCH` is switched on, handlers keep the behavior of
earlier releases — every matching handler runs in registration order and their
outcomes are merged, an exception is logged rather than failing the event, and a
handler with no scope sees every window — and Selenium warns wherever the
outcome is about to change.  Glob URL patterns (``"**/api/**"``) are likewise
still matched in Python, with a deprecation warning, because the remote end
rejects them.
"""

from __future__ import annotations

import copy
import logging
import re
import warnings
from collections.abc import Callable
from typing import Any
from urllib.parse import urlsplit

from selenium.webdriver.common._bidi.network import (
    AuthCredentials,
    Base64Value,
    CookieHeader,
    DataType,
    Header,
    InterceptPhase,
    SameSite,
    SetCookieHeader,
    StringValue,
    UrlPatternPattern,
    UrlPatternString,
)
from selenium.webdriver.common._bidi.serialization import UNSET

logger = logging.getLogger(__name__)

# Decisions 4, 6, 7 and 11 replace earlier behavior under the same method names,
# so they switch on in a later release instead of alongside a deprecation.
ADR_17685_DISPATCH = False

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

    def __getnewargs__(self) -> tuple[str, str]:
        # str's own __getnewargs__ passes only the value, which __new__ rejects,
        # so copy and pickle could not rebuild a handle without this.
        return (str(self), self.family)

    def __repr__(self) -> str:
        return f"<HandlerHandle {self.family} {str.__repr__(self)}>"


class _Original:
    """A read-only snapshot of an event as it arrived.

    Decision 9 lets a handler evaluate a condition against the unmodified event
    even while earlier handlers have staged changes onto the live wrapper.
    Every read hands out a fresh copy, so mutating a header dict or cookie list
    taken from it cannot change what a later handler sees as original.
    """

    def __init__(self, **values: Any) -> None:
        object.__setattr__(self, "_values", copy.deepcopy(values))

    def __getattr__(self, name: str) -> Any:
        values = object.__getattribute__(self, "_values")
        if name not in values:
            raise AttributeError(f"The original event has no '{name}' value")
        return copy.deepcopy(values[name])

    def __setattr__(self, name: str, value: Any) -> None:
        raise AttributeError("The original event value is read-only")

    def __repr__(self) -> str:
        fields = ", ".join(f"{name}={value!r}" for name, value in self._values.items())
        return f"<Original {fields}>"


def looks_like_url_pattern(value: Any) -> bool:
    """Heuristically distinguish a URL pattern from a legacy event name.

    URL patterns contain wildcard or URL punctuation (``* ? / : .``); bare
    word-like strings are assumed to be (possibly misspelled) event names so
    the legacy API can reject them with a helpful error.
    """
    return isinstance(value, str) and any(char in value for char in "*?/:.")


# --------------------------------------------------------------------------
# Conversions between the plain Python values handlers see and wire records
# --------------------------------------------------------------------------


def _decode_bytes_value(value: Any) -> Any:
    """Decode a raw BiDi BytesValue dict to a plain string where possible."""
    if isinstance(value, dict) and value.get("type") == "string":
        return value.get("value")
    return value


def _bytes_value(value: Any) -> StringValue | Base64Value:
    """Encode a handler-supplied value as a ``network.BytesValue`` record."""
    if isinstance(value, (StringValue, Base64Value)):
        return value
    if hasattr(value, "to_bidi_dict"):
        value = value.to_bidi_dict()
    if isinstance(value, dict):
        if value.get("type") == "base64":
            return Base64Value(value=value.get("value"))
        return StringValue(value=value.get("value"))
    # Header values such as True or 1 are stringified rather than sent as-is,
    # which the remote end would reject.
    return StringValue(value=value if isinstance(value, str) else str(value))


def _decoded_bytes_record(value: Any) -> Any:
    """Turn a ``network.BytesValue`` record back into what handlers expect."""
    if isinstance(value, StringValue):
        return value.value
    if isinstance(value, Base64Value):
        return {"type": "base64", "value": value.value}
    return _decode_bytes_value(value)


def headers_to_dict(headers: list | None) -> dict[str, str]:
    """Convert a raw BiDi header list to a name → value mapping."""
    result: dict[str, str] = {}
    for header in headers or []:
        if isinstance(header, dict):
            result[header.get("name")] = _decode_bytes_value(header.get("value"))
    return result


def _header_records(headers: dict[str, Any] | None) -> list[Header]:
    return [Header(name=name, value=_bytes_value(value)) for name, value in (headers or {}).items()]


def cookies_to_list(cookies: list | None) -> list[dict]:
    """Convert raw BiDi request cookies to plain dicts with decoded values."""
    result = []
    for cookie in cookies or []:
        if isinstance(cookie, dict):
            decoded = dict(cookie)
            decoded["value"] = _decode_bytes_value(cookie.get("value"))
            result.append(decoded)
    return result


def _cookie_name_and_value(cookie: Any) -> dict | None:
    if hasattr(cookie, "to_bidi_dict"):
        cookie = cookie.to_bidi_dict()
    return cookie if isinstance(cookie, dict) else None


def _cookie_header_records(cookies: list | None) -> list[CookieHeader]:
    records = []
    for cookie in cookies or []:
        entry = _cookie_name_and_value(cookie)
        if entry is not None:
            records.append(CookieHeader(name=entry.get("name"), value=_bytes_value(entry.get("value"))))
    return records


# Optional network.SetCookieHeader fields, accepting both snake_case (Python
# style) and camelCase (wire style) keys from user-supplied cookie dicts.
_SET_COOKIE_FIELD_ALIASES = {
    "domain": "domain",
    "expiry": "expiry",
    "http_only": "http_only",
    "httpOnly": "http_only",
    "max_age": "max_age",
    "maxAge": "max_age",
    "path": "path",
    "same_site": "same_site",
    "sameSite": "same_site",
    "secure": "secure",
}


def _set_cookie_header_records(cookies: list | None) -> list[SetCookieHeader]:
    records = []
    for cookie in cookies or []:
        entry = _cookie_name_and_value(cookie)
        if entry is None:
            continue
        optional: dict[str, Any] = {}
        for key, field_name in _SET_COOKIE_FIELD_ALIASES.items():
            if entry.get(key) is not None:
                optional[field_name] = entry[key]
        if isinstance(optional.get("same_site"), str):
            optional["same_site"] = SameSite(optional["same_site"])
        records.append(SetCookieHeader(name=entry.get("name"), value=_bytes_value(entry.get("value")), **optional))
    return records


def _or_unset(value: Any) -> Any:
    return UNSET if value is None else value


# --------------------------------------------------------------------------
# URL patterns
# --------------------------------------------------------------------------


def _is_glob(pattern: Any) -> bool:
    if not isinstance(pattern, str):
        return False
    if "*" in pattern:
        return True
    # In a URL a "?" starts the query, which the remote end evaluates exactly.
    return "?" in pattern and "://" not in pattern


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


def _literal_component(component: str) -> str | None:
    """Return the component when it is literal, ``None`` when it has wildcards."""
    if not component or "*" in component or "?" in component:
        return None
    return component


def _glob_to_url_pattern(pattern: str) -> UrlPatternPattern | None:
    """The browser-side pre-filter for a glob, or ``None`` to intercept everything.

    Only the glob's literal components can be forwarded, because the remote end
    rejects wildcards, so the filter is broader than the glob and Python-side
    matching narrows it.
    """
    if "://" not in pattern:
        return None
    scheme, _, rest = pattern.partition("://")
    host, slash, path = rest.partition("/")
    port = None
    if ":" in host:
        host, _, port = host.partition(":")
    components: dict[str, str] = {}
    if _literal_component(scheme):
        components["protocol"] = scheme
    if _literal_component(host):
        components["hostname"] = host
    if port and _literal_component(port):
        components["port"] = port
    if slash and _literal_component("/" + path):
        components["pathname"] = "/" + path
    return UrlPatternPattern(**components) if components else None


def _url_pattern_from_string(pattern: str) -> UrlPatternString:
    if not pattern:
        raise ValueError("A URL pattern string must not be empty")
    return UrlPatternString(pattern=pattern)


def _url_pattern_from_mapping(pattern: dict) -> UrlPatternString | UrlPatternPattern:
    """Validate a component mapping as a ``network.UrlPattern``."""
    kind = pattern.get("type")
    if kind == "string":
        extra = sorted(set(pattern) - {"type", "pattern"})
        if extra:
            raise ValueError(
                f"A 'string' URL pattern takes only a 'pattern' value, got {', '.join(extra)}; "
                "use a 'pattern' mapping to restrict URL components"
            )
        value = pattern.get("pattern")
        if not isinstance(value, str) or not value:
            raise ValueError("A 'string' URL pattern requires a non-empty 'pattern' value")
        return UrlPatternString(pattern=value)
    if kind not in (None, "pattern"):
        raise ValueError(f"Unsupported URL pattern type '{kind}'; use 'string' or 'pattern'")
    components = {name: value for name, value in pattern.items() if name != "type"}
    unknown = sorted(set(components) - set(URL_PATTERN_COMPONENTS))
    if unknown:
        raise ValueError(
            f"Unsupported URL pattern component(s): {', '.join(unknown)}. "
            f"Supported components: {', '.join(URL_PATTERN_COMPONENTS)}"
        )
    for name, value in components.items():
        if value is not None and not isinstance(value, str):
            raise ValueError(f"URL pattern component '{name}' must be a string, got {type(value).__name__}")
    return UrlPatternPattern(**{name: value for name, value in components.items() if value is not None})


class _UrlPatterns:
    """User URL patterns translated for ``network.addIntercept``.

    ``wire`` is what the remote end evaluates (``None`` intercepts everything).
    ``matchers`` re-checks every alternative in Python when a deprecated glob is
    among them, because the remote end cannot evaluate a glob and the event does
    not say which alternative matched; it is empty when the remote end decides alone.
    """

    def __init__(self, wire: list | None, matchers: list[Callable[[str], bool]]):
        self.wire = wire
        self.matchers = matchers

    def matches(self, url: str) -> bool:
        return not self.matchers or any(matcher(url) for matcher in self.matchers)


def _component_matcher(pattern: UrlPatternPattern) -> Callable[[str], bool]:
    """Match a URL against the literal components of a ``network.UrlPatternPattern``."""
    expected = {
        "protocol": pattern.protocol,
        "hostname": pattern.hostname,
        "port": pattern.port,
        "pathname": pattern.pathname,
        "search": pattern.search,
    }

    def matches(url: str) -> bool:
        parts = urlsplit(url)
        actual = {
            "protocol": parts.scheme,
            "hostname": parts.hostname or "",
            "port": str(parts.port) if parts.port is not None else "",
            "pathname": parts.path,
            "search": parts.query,
        }
        for name, value in expected.items():
            if value is UNSET:
                continue
            if name == "protocol":
                value = value.rstrip(":").lower()
            elif name == "hostname":
                value = value.lower()
            elif name == "search":
                value = value.lstrip("?")
            if actual[name] != value:
                return False
        return True

    return matches


def _string_matcher(value: str) -> Callable[[str], bool]:
    regex = glob_to_regex(value) if _is_glob(value) else re.compile(re.escape(value) + r"\Z")
    return lambda url: regex.match(url) is not None


def normalize_url_patterns(patterns: Any) -> _UrlPatterns:
    """Translate user URL patterns into ``network.UrlPattern`` records.

    Decision 2 keeps URL matching on the remote end: a pattern is validated here
    and forwarded as given.  Accepts a single pattern or an iterable of them,
    where each is a pattern string, a mapping of ``network.UrlPatternPattern``
    components, an object exposing ``to_bidi_dict()``, or a parsed URL exposing
    ``geturl()``.

    A glob string (one containing ``*`` or ``?``) is deprecated: the remote end
    rejects wildcards, so as in earlier releases its literal components pre-filter
    in the browser and the glob itself is matched in Python.
    """
    if patterns is None:
        return _UrlPatterns(None, [])
    if isinstance(patterns, (str, dict)) or hasattr(patterns, "to_bidi_dict") or hasattr(patterns, "geturl"):
        patterns = [patterns]
    values = []
    for pattern in patterns:
        if hasattr(pattern, "to_bidi_dict"):
            pattern = pattern.to_bidi_dict()
        elif hasattr(pattern, "geturl"):
            pattern = pattern.geturl()
        if not isinstance(pattern, (str, dict)):
            raise TypeError(
                f"A URL pattern must be a string or a mapping of pattern components, got {type(pattern).__name__}"
            )
        values.append(pattern)
    if any(_is_glob(value) for value in values):
        return _glob_url_patterns(values)
    wire = [
        _url_pattern_from_string(value) if isinstance(value, str) else _url_pattern_from_mapping(value)
        for value in values
    ]
    return _UrlPatterns(wire or None, [])


def _glob_url_patterns(values: list) -> _UrlPatterns:
    globs = [value for value in values if _is_glob(value)]
    warnings.warn(
        f"Glob URL patterns such as {globs[0]!r} are deprecated, because the browser cannot evaluate them; "
        "pass a URL pattern string without wildcards or a mapping of URL components instead, "
        "and do finer matching inside the handler",
        DeprecationWarning,
        # Points past the registry and the driver.network method at the caller.
        stacklevel=5,
    )
    wire: list = []
    matchers: list[Callable[[str], bool]] = []
    intercept_everything = False
    for value in values:
        if isinstance(value, dict):
            url_pattern = _url_pattern_from_mapping(value)
            wire.append(url_pattern)
            if isinstance(url_pattern, UrlPatternPattern):
                matchers.append(_component_matcher(url_pattern))
            else:
                matchers.append(_string_matcher(url_pattern.pattern))
            continue
        matchers.append(_string_matcher(value))
        url_pattern = _glob_to_url_pattern(value) if _is_glob(value) else _url_pattern_from_string(value)
        if url_pattern is None:
            # One pattern that cannot be pre-filtered means intercepting everything.
            intercept_everything = True
        else:
            wire.append(url_pattern)
    return _UrlPatterns(None if intercept_everything else wire or None, matchers)


# --------------------------------------------------------------------------
# Event wrappers handed to handlers
# --------------------------------------------------------------------------


class _Event:
    """Settling shared by the request, response and challenge wrappers.

    Under :data:`ADR_17685_DISPATCH` the first disposition is final.  Otherwise
    every matching handler runs, as in earlier releases, so a later disposition
    replaces an earlier one only when it outranks it in ``_PRIORITY``.
    """

    _PRIORITY: dict[str, int] = {}
    _noun = "event"

    def _init_settling(self, deferred: bool, merge_outcomes: bool) -> None:
        # Deferred events are resolved by the registry once the handler chain
        # stops; non-deferred events execute actions immediately.
        self._deferred = deferred
        self._merge_outcomes = merge_outcomes
        self._handled = False
        self._settled: str | None = None

    @property
    def settled(self) -> bool:
        """Whether a handler has settled this event's disposition (decision 4)."""
        return self._settled is not None

    def _settle(self, disposition: str) -> bool:
        """Record a disposition; returns whether it is the one now in force."""
        if self._merge_outcomes:
            if self._settled is None or self._PRIORITY.get(disposition, 0) > self._PRIORITY.get(self._settled, 0):
                self._settled = disposition
                return True
            return False
        if self._settled is not None:
            raise AlreadySettledError(
                f"This {self._noun} was already settled with '{self._settled}'; a handler settles an event once"
            )
        self._settled = disposition
        return True


class Request(_Event):
    """A request paused before it is sent, handed to a request handler.

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

    # Matches earlier releases: a failure beats a stubbed response, which beats
    # continuing, whichever handler asked for it.
    _PRIORITY = {"respond": 1, "fail": 2}
    _noun = "request"

    def __init__(self, commands, params, deferred: bool = False, merge_outcomes: bool = False):
        self._commands = commands
        self._params = params if isinstance(params, dict) else {}
        req = self._params.get("request", {}) or {}
        self.url = req.get("url", "")
        # Handlers can rewrite self.url, so the data-URL skip keys off this.
        self._intercepted_url = self.url
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
        self._init_settling(deferred, merge_outcomes)
        self._stub: dict | None = None
        self._mutations: dict[str, Any] = {}
        self._body: Any = None
        self._body_fetched = False
        self._body_staged = False
        self._body_collector: str | None = None

    @property
    def body(self) -> Any:
        """The request body, or ``None`` when it was not collected.

        A body is fetched from the collector Selenium installed for a handler
        registered with ``collect_body=True``; it is not available otherwise
        (decision 10).  A body a handler staged is visible to every later
        handler; a collected one only to handlers that opted in.
        """
        if self._body_staged:
            return self._body
        if self._body_collector is None or self._request_id is None:
            return None
        if self._body_fetched:
            return self._body
        # A request the browser reports as bodyless has nothing to collect, and
        # asking for it anyway stalls the page: while the request is blocked in
        # the handler, network.getData never answers for a body that will never
        # arrive, so the request is not continued until the command times out.
        if not self._body_size:
            logger.debug("Request %s has no body to collect (bodySize=%r)", self.url, self._body_size)
            return None
        self._body_fetched = True
        try:
            result = self._commands.get_data(
                data_type=DataType.REQUEST,
                request=self._request_id,
                collector=self._body_collector,
                disown=False,
            )
        except Exception:
            logger.debug("Could not collect the request body for %s", self.url, exc_info=True)
            return None
        self._body = _decoded_bytes_record(result.bytes)
        return self._body

    @body.setter
    def body(self, value: Any) -> None:
        self._body = value
        self._body_staged = True

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
        self._body_staged = True
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
        if not self._settle("respond"):
            return
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
        if not self._merge_outcomes:
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
        # Earlier releases sent an explicit continue straight away, ahead of any
        # failure or stub another handler staged.
        if not self._deferred or (self._merge_outcomes and not self._handled):
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

    def _execute_continue(self) -> None:
        self._handled = True
        if self._intercepted_url.startswith("data:"):
            return
        mutations = self._mutations
        self._commands.continue_request(
            request=self._request_id,
            url=mutations.get("url", UNSET),
            method=mutations.get("method", UNSET),
            headers=_header_records(mutations["headers"]) if "headers" in mutations else UNSET,
            cookies=_cookie_header_records(mutations["cookies"]) if "cookies" in mutations else UNSET,
            body=_bytes_value(mutations["body"]) if "body" in mutations else UNSET,
        )

    def _execute_fail(self) -> None:
        self._handled = True
        if self._intercepted_url.startswith("data:"):
            return
        self._commands.fail_request(request=self._request_id)

    def _execute_provide_response(self) -> None:
        self._handled = True
        if self._intercepted_url.startswith("data:"):
            return
        stub = self._stub or {}
        self._commands.provide_response(
            request=self._request_id,
            status_code=_or_unset(stub.get("status")),
            reason_phrase=_or_unset(stub.get("reason_phrase")),
            headers=_header_records(stub["headers"]) if stub.get("headers") is not None else UNSET,
            body=_bytes_value(stub["body"]) if stub.get("body") is not None else UNSET,
        )

    def _resolve(self) -> None:
        """Issue exactly one command for the settled (or unsettled) event."""
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


class Response(_Event):
    """A response paused as it starts, handed to a response handler.

    Attributes:
        url: The response URL.
        status: The HTTP status code.
        reason_phrase: The HTTP status text reported by the browser.
        headers: The response headers as a name → value dict.
        mime_type: The response MIME type when reported by the browser.
        cookies: Cookies to set on the response. The browser does not report
            parsed response cookies when a response starts, so this is empty
            unless mutated via :meth:`set_cookies`.
        body: The response body. Intercepting a response holds it before its
            body is collected, so this is ``None`` unless mutated via
            :meth:`set_body` (decision 10).
        original: The event as it arrived, before any handler staged a change
            (decision 9).
    """

    _PRIORITY = {"fail": 1}
    _noun = "response"

    def __init__(self, commands, params, deferred: bool = False, merge_outcomes: bool = False):
        self._commands = commands
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
        self._init_settling(deferred, merge_outcomes)
        self._mutations: dict[str, Any] = {}

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

        A response cannot be continued with a new body, so a body mutation is
        delivered as a replacement response carrying over the (possibly
        mutated) status and headers.
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

        A replacement body is delivered as a replacement response; other
        mutations continue the response the server sent.  Data URLs (``data:``)
        are skipped silently because browsers do not create an interceptable
        entry for them.

        Args:
            status: Replacement HTTP status code.
            reason_phrase: Replacement HTTP reason phrase.
            headers: Replacement response headers as a name → value dict.
            cookies: Replacement set-cookie entries as a list of dicts.
            body: Replacement response body string.
        """
        if not self._merge_outcomes:
            self._settle("submit")
        if status is not None or reason_phrase is not None:
            self.set_status(self.status if status is None else status, reason_phrase)
        if headers is not None:
            self.set_headers(headers)
        if cookies is not None:
            self.set_cookies(cookies)
        if body is not None:
            self.set_body(body)
        if not self._deferred or (self._merge_outcomes and not self._handled):
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

    def _execute_continue(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        mutations = self._mutations
        self._commands.continue_response(
            request=self._request_id,
            status_code=mutations.get("status", UNSET),
            reason_phrase=mutations.get("reason_phrase", UNSET),
            headers=_header_records(mutations["headers"]) if "headers" in mutations else UNSET,
            cookies=_set_cookie_header_records(mutations["cookies"]) if "cookies" in mutations else UNSET,
        )

    def _execute_fail(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        self._commands.fail_request(request=self._request_id)

    def _execute_provide_response(self) -> None:
        self._handled = True
        if self.url.startswith("data:"):
            return
        # A replacement response replaces everything, so carry over the
        # current (possibly mutated) status and headers alongside the body.
        self._commands.provide_response(
            request=self._request_id,
            status_code=_or_unset(self.status),
            reason_phrase=self.reason_phrase or UNSET,
            headers=_header_records(self.headers) if self.headers else UNSET,
            cookies=_set_cookie_header_records(self._mutations["cookies"]) if "cookies" in self._mutations else UNSET,
            body=_bytes_value(self.body) if self.body is not None else UNSET,
        )

    def _execute_submit(self) -> None:
        if "body" not in self._mutations:
            self._execute_continue()
            return
        try:
            self._execute_provide_response()
        except Exception:
            # Some browsers cannot replace a body when a response starts;
            # continue with the remaining mutations rather than leaving the
            # response blocked and stalling the page.
            logger.exception("Replacing the response body failed; continuing the response without it")
            self._handled = False
            self._execute_continue()

    def _resolve(self) -> None:
        """Issue exactly one command for the settled (or unsettled) event."""
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


class AuthenticationRequest(_Event):
    """An authentication challenge, handed to an authentication handler.

    Attributes:
        url: The URL of the request that triggered the challenge.
        realm: The authentication realm of the first challenge, when reported.
        scheme: The authentication scheme (e.g. ``"basic"``) of the first
            challenge, when reported.
        challenges: Every challenge as a list of ``{"scheme", "realm"}`` dicts.
        original: The event as it arrived (decision 9).
    """

    # Matches earlier releases: cancelling beats supplying credentials.
    _PRIORITY = {"authenticate": 1, "cancel": 2}
    _noun = "challenge"

    def __init__(self, commands, params, deferred: bool = False, merge_outcomes: bool = False):
        self._commands = commands
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
        self._init_settling(deferred, merge_outcomes)
        self._credentials: AuthCredentials | None = None

    def authenticate(self, username: str, password: str) -> None:
        """Settle the challenge with the given credentials.

        Settling resolves the challenge and stops the handler chain (decision 4).
        """
        if not self._settle("authenticate"):
            return
        self._credentials = AuthCredentials(username=username, password=password)
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
        self._commands.continue_with_auth(
            request=self._request_id,
            action=action,
            credentials=self._credentials if action == "provideCredentials" else UNSET,
        )

    def _resolve(self) -> None:
        """Issue exactly one command for the settled (or unsettled) challenge."""
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


# --------------------------------------------------------------------------
# Registries
# --------------------------------------------------------------------------


def default_window_handle(network: Any) -> str:
    """The window handle a handler is scoped to when none was given (decision 11).

    Any failure propagates: falling back to no scope would silently widen a
    handler meant for one window to every window in the session.
    """
    return network._driver.current_window_handle


def record_handler_error(network: Any, error: BaseException, label: str) -> None:
    """Stash a handler's uncaught exception so it can surface to the user.

    Handlers run on the event-dispatch thread, which has no user frame to
    propagate into, so decision 7's "surfaces to the user" is honored by
    re-raising the exception from the next call into ``driver.network``.
    """
    logger.error("%s raised; the event was failed", label.capitalize(), exc_info=error)
    network._handler_errors.append(error)


class _HandlerEntry:
    """A registered handler with its intercept, scope and body collector."""

    def __init__(
        self,
        handle: HandlerHandle,
        callback: Callable,
        intercept_id: str | None,
        patterns: _UrlPatterns,
        *,
        window_handle: str | None = None,
        user_context: str | None = None,
        collector_id: str | None = None,
    ):
        self.handle = handle
        self.callback = callback
        self.intercept_id = intercept_id
        self.patterns = patterns
        self.window_handle = window_handle
        self.user_context = user_context
        self.collector_id = collector_id
        self.removing = False

    def consulted_for(self, params: dict, url: str, blocking_intercepts: set) -> bool:
        """Whether this handler belongs to one event's chain.

        A handler is consulted only for events its own intercept blocked, so
        URL-pattern and window-handle scope are decided by the remote end —
        an event blocked on another handler's behalf does not reach it
        (decision 4).  User-context scope is checked here because
        ``network.addIntercept`` cannot express it (decision 11), and a
        deprecated glob is matched here because the remote end cannot evaluate it.
        """
        if self.removing:
            return False
        if self.intercept_id is not None and self.intercept_id not in blocking_intercepts:
            return False
        if not self.patterns.matches(url):
            return False
        if self.user_context is not None:
            event_user_context = params.get("userContext")
            if event_user_context is None:
                # Without it the event cannot be placed in scope, so the handler
                # is skipped; say so, or a handler that never runs is a mystery.
                logger.warning(
                    "The browser did not report a user context for a network event, so the handler "
                    "scoped to user context %s was skipped",
                    self.user_context,
                )
            if event_user_context != self.user_context:
                return False
        return True


class _BaseHandlerRegistry:
    """Tracks the handlers for one intercept phase and resolves their events.

    One event subscription dispatches each event along the chain of handlers
    that match it, and the event is then resolved exactly once.
    """

    # Subclasses configure the intercept phase, the subscribed event, the
    # handler-ID prefix and the wrapper class handed to callbacks.
    _phase: InterceptPhase
    _event_name: str
    _id_prefix: str
    _label: str
    _wrapper: type
    # Only request handlers can collect a body (decision 10).
    _supports_body_collection = False

    def __init__(self, network):
        self._network = network
        self._handlers: dict[str, _HandlerEntry] = {}
        self._subscription = None
        self._counter = 0
        self._warned_about_chain = False

    def _wrap(self, params):
        return self._wrapper(
            self._network._commands,
            params,
            deferred=True,
            merge_outcomes=not ADR_17685_DISPATCH,
        )

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
            window_handle = self._default_window_handle()
        if self._handlers:
            self._warn_about_chain()
        contexts = [window_handle] if window_handle is not None else None
        if user_context is not None:
            logger.debug(
                "network.addIntercept cannot scope to a user context, so every request is intercepted "
                "and those outside user context %s are continued untouched",
                user_context,
            )
        intercept_id = self._network._add_intercept(self._phase, patterns.wire, contexts)
        collector_id = None
        if collect_body:
            try:
                collector_id = self._network._add_data_collector(contexts, user_context)
            except Exception:
                # No callback is subscribed yet, so an intercept left behind
                # would block matching requests with nothing to resolve them.
                self._network._remove_intercept(intercept_id)
                raise
        self._ensure_subscribed()
        self._counter += 1
        handle = HandlerHandle(f"{self._id_prefix}-{self._counter}", self._label)
        self._handlers[str(handle)] = _HandlerEntry(
            handle,
            callback,
            intercept_id,
            patterns,
            window_handle=window_handle,
            user_context=user_context,
            collector_id=collector_id,
        )
        logger.debug(
            "Added %s %s (patterns=%s, window_handle=%s, user_context=%s, collect_body=%s)",
            self._label,
            handle,
            patterns.wire,
            window_handle,
            user_context,
            collect_body,
        )
        return handle

    def _default_window_handle(self) -> str | None:
        if ADR_17685_DISPATCH:
            return default_window_handle(self._network)
        self._network._warn_once(
            "default-scope",
            "A network handler registered without window_handle or user_context applies to every window; "
            "in a future release it will apply only to the window that is current when it is registered. "
            "Pass window_handle or user_context to choose the scope now.",
        )
        return None

    def _warn_about_chain(self) -> None:
        if ADR_17685_DISPATCH or self._warned_about_chain:
            return
        self._warned_about_chain = True
        self._network._warn_once(
            f"chain-{self._label}",
            f"More than one {self._label} is registered. They currently all run in the order they were added "
            "and their outcomes are merged; in a future release the most recently added runs first, the first "
            "to settle an event stops the rest, and an exception a handler raises fails the event.",
        )

    def remove_handler(self, handle) -> None:
        """Remove a handler, its intercept and its body collector by handle."""
        entry = self._handlers.get(str(handle))
        if entry is None:
            raise ValueError(f"{self._label.capitalize()} '{handle}' not found")
        # The entry stays registered until its remote state is gone, and each
        # piece is forgotten as it goes, so a failed removal can be retried
        # without leaving an orphaned intercept or collector behind.
        entry.removing = True
        if entry.intercept_id:
            self._network._remove_intercept(entry.intercept_id)
            entry.intercept_id = None
        if entry.collector_id:
            self._network._remove_data_collector(entry.collector_id)
            entry.collector_id = None
        del self._handlers[str(handle)]
        self._release_subscription_if_unused()
        logger.debug("Removed %s %s", self._label, handle)

    def clear(self) -> None:
        """Remove all registered handlers and their intercepts."""
        for handler_id in list(self._handlers):
            self.remove_handler(handler_id)

    def intercept_ids(self) -> set:
        """Intercept IDs owned by this registry."""
        return {entry.intercept_id for entry in self._handlers.values() if entry.intercept_id}

    def collector_ids(self) -> set:
        """Body collector IDs owned by this registry."""
        return {entry.collector_id for entry in self._handlers.values() if entry.collector_id}

    def _keep_subscription(self) -> bool:
        return bool(self._handlers)

    def _ensure_subscribed(self) -> None:
        if self._subscription is None:
            self._subscription = self._network._subscribe(self._event_name, self._on_event)

    def _release_subscription_if_unused(self) -> None:
        if not self._keep_subscription() and self._subscription is not None:
            subscription, self._subscription = self._subscription, None
            self._network._unsubscribe(subscription)

    def _before_resolve(self, wrapped) -> None:
        """Hook run after the handler chain and before the event is resolved."""

    def _prepare(self, wrapped, entry: _HandlerEntry) -> None:
        """Hook run before each handler in the chain is called."""

    def _on_event(self, params) -> None:
        if not isinstance(params, dict):
            return
        blocking_intercepts = set(params.get("intercepts") or []) if params.get("isBlocked") else set()
        # Only resolve events paused by one of our intercepts; events blocked by
        # other subsystems are theirs to continue.
        ours = bool(self.intercept_ids() & blocking_intercepts)
        wrapped = self._wrap(params)
        if ADR_17685_DISPATCH:
            error = self._run_chain(wrapped, params, blocking_intercepts)
        else:
            error = None
            self._run_all(wrapped, params, blocking_intercepts)
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

    def _consulted(self, wrapped, params, blocking_intercepts) -> list[_HandlerEntry]:
        return [
            entry
            for entry in list(self._handlers.values())
            if entry.consulted_for(params, wrapped.url, blocking_intercepts)
        ]

    def _run_chain(self, wrapped, params, blocking_intercepts) -> BaseException | None:
        # Decision 6: later-registered handlers are consulted first.
        for entry in reversed(self._consulted(wrapped, params, blocking_intercepts)):
            self._prepare(wrapped, entry)
            try:
                entry.callback(wrapped)
            except BaseException as exc:
                return exc
            # Decision 4: the first handler to settle stops the chain.
            if wrapped.settled:
                break
        return None

    def _run_all(self, wrapped, params, blocking_intercepts) -> None:
        for entry in self._consulted(wrapped, params, blocking_intercepts):
            self._prepare(wrapped, entry)
            try:
                entry.callback(wrapped)
            except Exception:
                logger.warning(
                    "%s %s raised; processing continues. In a future release an exception a handler "
                    "raises will fail the event and be raised from the next call into driver.network.",
                    self._label.capitalize(),
                    entry.handle,
                    exc_info=True,
                )


class RequestHandlerRegistry(_BaseHandlerRegistry):
    """Dispatches ``network.beforeRequestSent`` events to request handlers.

    Also owns the extra-headers store: while any extra header is set every
    request is paused by a dedicated match-everything intercept and continued
    with the merged headers.  Sharing the registry's subscription and resolution
    means a request paused by both the extra-headers intercept and user handlers
    is still continued exactly once.
    """

    _phase = InterceptPhase.BEFORE_REQUEST_SENT
    _event_name = "network.beforeRequestSent"
    _id_prefix = "request-handler"
    _label = "request handler"
    _wrapper = Request
    _supports_body_collection = True

    def __init__(self, network):
        super().__init__(network)
        # Header names are case-insensitive per HTTP, so keys are lowercased.
        self.extra_headers: dict[str, Any] = {}
        self._extra_headers_intercept: str | None = None

    def _prepare(self, request, entry: _HandlerEntry) -> None:
        # A body is readable only inside a handler that opted in (decision 10).
        request._body_collector = entry.collector_id

    def set_extra_header(self, name: str, value: str) -> None:
        """Record a header to merge into every subsequent request."""
        self.extra_headers[name.lower()] = value
        if self._extra_headers_intercept is None:
            self._extra_headers_intercept = self._network._add_intercept(self._phase, None, None)
        self._ensure_subscribed()
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
        self._release_subscription_if_unused()

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

    _phase = InterceptPhase.RESPONSE_STARTED
    _event_name = "network.responseStarted"
    _id_prefix = "response-handler"
    _label = "response handler"
    _wrapper = Response


class AuthHandlerRegistry(_BaseHandlerRegistry):
    """Dispatches ``network.authRequired`` events to authentication handlers."""

    _phase = InterceptPhase.AUTH_REQUIRED
    _event_name = "network.authRequired"
    _id_prefix = "auth-handler"
    _label = "authentication handler"
    _wrapper = AuthenticationRequest
