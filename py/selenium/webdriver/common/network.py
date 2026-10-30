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

"""Network interception for ``driver.network``.

:class:`Network` is the supported, protocol-neutral API (decision record 17670):
it hands out no protocol types and is reached as ``driver.network``.  It is
implemented on the internal BiDi protocol layer, composed with the driver.
"""

from __future__ import annotations

import logging
import warnings
from collections.abc import Callable
from typing import Any

from selenium.webdriver.common._bidi.network import DataType
from selenium.webdriver.common._bidi.network import Network as _NetworkProtocol
from selenium.webdriver.common._bidi.serialization import UNSET
from selenium.webdriver.common._bidi.session import Session as _SessionProtocol
from selenium.webdriver.common._network_handlers import (
    DEFAULT_MAX_BODY_SIZE,
    AlreadySettledError,
    AuthenticationRequest,
    AuthHandlerRegistry,
    HandlerHandle,
    Request,
    RequestHandlerRegistry,
    Response,
    ResponseHandlerRegistry,
    looks_like_url_pattern,
)

__all__ = [
    "AlreadySettledError",
    "AuthenticationRequest",
    "HandlerHandle",
    "Network",
    "Request",
    "Response",
]

logger = logging.getLogger(__name__)

# Event names accepted by the deprecated phase-based add_request_handler form.
_LEGACY_REQUEST_HANDLER_EVENTS = ("auth_required", "before_request", "before_request_sent")

# What driver.network handed out while it was the BiDi network module itself.
# They stay reachable for a deprecation period, but they are the protocol, which
# decision record 17670 keeps off the driver.
_PROTOCOL_MEMBERS = frozenset(
    {
        "add_data_collector",
        "add_event_handler",
        "add_intercept",
        "clear_event_handlers",
        "continue_request",
        "continue_response",
        "continue_with_auth",
        "disown_data",
        "fail_request",
        "get_data",
        "provide_response",
        "remove_data_collector",
        "remove_event_handler",
        "remove_intercept",
        "set_cache_behavior",
        "set_extra_headers",
    }
)


class _RawEvent:
    """Delivers an event to its callback as the parameters the remote end sent."""

    def __init__(self, name: str) -> None:
        self.event_class = name

    @staticmethod
    def from_json(params: Any) -> Any:
        return params


class Network:
    """Intercept and observe the requests, responses and authentication challenges of a session.

    Reached as ``driver.network``.  Handlers come in three families — request,
    response and authentication — each added, removed by the handle ``add``
    returns, and cleared as a family.
    """

    def __init__(self, driver) -> None:
        self._driver = driver
        self._commands = _NetworkProtocol(driver)
        # Every domain wraps the same session connection, so the session domain
        # shares the network domain's transport rather than opening its own.
        self._session = _SessionProtocol(self._commands._transport)
        self._connection = self._commands._transport.connection
        self._handler_errors: list[BaseException] = []
        self._warned: set[str] = set()
        self._protocol_module = None
        self._request_handlers = RequestHandlerRegistry(self)
        self._response_handlers = ResponseHandlerRegistry(self)
        self._auth_handlers = AuthHandlerRegistry(self)

    # ----------------------------------------------------------------------
    # Request handlers
    # ----------------------------------------------------------------------

    def add_request_handler(
        self,
        event=None,
        callback: Callable | None = None,
        url_patterns=None,
        *,
        collect_body: bool = False,
        window_handle: str | None = None,
        user_context: str | None = None,
    ):
        """Add a handler for requests about to be sent.

        Usage::

            driver.network.add_request_handler(handler)
            driver.network.add_request_handler([{"hostname": "api.example.com"}], handler)

        The handler receives a :class:`Request` and may observe it, mutate it
        via ``set_url``/``set_method``/``set_headers``/``add_header``/
        ``remove_header``/``set_cookies``/``set_body``, or settle it with
        ``fail()``, ``respond(...)`` or ``submit(...)``.  A request nothing
        settles is sent with whatever was staged, so observers never stall the
        page.

        Args:
            event: The handler callable, or URL patterns when ``callback`` is
                given.
            callback: The handler callable when ``event`` holds URL patterns.
            url_patterns: URL patterns limiting which requests reach the
                handler, as pattern strings and/or mappings of ``protocol``,
                ``hostname``, ``port``, ``pathname`` and ``search`` components,
                evaluated by the browser. Defaults to matching everything.
            collect_body: Collect the request body so the handler can read
                ``request.body``. Bodies are not available otherwise, and
                Selenium owns the collector's lifecycle and size cap.
            window_handle: The window handle the handler applies to.
            user_context: The user context the handler applies to, covering
                every window handle in it including ones opened later. Mutually
                exclusive with ``window_handle``.

        Returns:
            A :class:`HandlerHandle` for ``remove_request_handler(handle)``.

        The phase-based form ``add_request_handler("before_request", callback)``
        is deprecated; use the forms above.
        """
        self._drain_handler_errors()
        scope = {"collect_body": collect_body, "window_handle": window_handle, "user_context": user_context}
        if callable(event) and callback is None:
            return self._request_handlers.add_handler(url_patterns, event, **scope)
        if (
            callable(callback)
            and event not in _LEGACY_REQUEST_HANDLER_EVENTS
            and (not isinstance(event, str) or looks_like_url_pattern(event))
        ):
            patterns = event if event is not None else url_patterns
            return self._request_handlers.add_handler(patterns, callback, **scope)
        warnings.warn(
            "The phase-based add_request_handler(event, callback) form is deprecated, "
            "use add_request_handler(callback) or add_request_handler(url_patterns, callback) instead",
            DeprecationWarning,
            stacklevel=2,
        )
        return self._protocol.add_request_handler(event, callback, url_patterns)

    def remove_request_handler(self, event, callback_id=None) -> None:
        """Remove a request handler by the handle ``add_request_handler`` returned.

        Removing a handler stops it being consulted for later requests but does
        not disturb a request already in flight.

        Args:
            event: The :class:`HandlerHandle` to remove, or the event name used
                with the deprecated phase-based form.
            callback_id: The ID the deprecated phase-based form returned.
        """
        self._drain_handler_errors()
        if callback_id is None:
            self._request_handlers.remove_handler(event)
            return
        self._protocol.remove_request_handler(event, callback_id)

    def clear_request_handlers(self) -> None:
        """Remove every request handler.

        Response handlers, authentication handlers and extra headers are kept.
        """
        self._drain_handler_errors()
        self._request_handlers.clear()
        if self._protocol_module is not None:
            self._protocol_module.clear_request_handlers()

    # ----------------------------------------------------------------------
    # Response handlers
    # ----------------------------------------------------------------------

    def add_response_handler(
        self,
        url_patterns=None,
        callback: Callable | None = None,
        *,
        window_handle: str | None = None,
        user_context: str | None = None,
    ) -> HandlerHandle:
        """Add a handler for responses as they start.

        Usage::

            driver.network.add_response_handler(handler)
            driver.network.add_response_handler([{"hostname": "api.example.com"}], handler)

        The handler receives a :class:`Response` and may observe it, mutate it
        via ``set_status``/``set_headers``/``add_header``/``remove_header``/
        ``set_cookies``/``set_body``, or settle it with ``fail()`` or
        ``submit(...)``.  Intercepting a response holds it before its body is
        collected, so a response body is not readable while intercepting.

        Args:
            url_patterns: URL patterns limiting which responses reach the
                handler, evaluated by the browser. Defaults to matching
                everything.
            callback: The handler callable.
            window_handle: The window handle the handler applies to.
            user_context: The user context the handler applies to. Mutually
                exclusive with ``window_handle``.

        Returns:
            A :class:`HandlerHandle` for ``remove_response_handler(handle)``.
        """
        self._drain_handler_errors()
        scope = {"window_handle": window_handle, "user_context": user_context}
        if callable(url_patterns) and callback is None:
            return self._response_handlers.add_handler(None, url_patterns, **scope)
        if not callable(callback):
            raise TypeError("add_response_handler requires a callable handler")
        return self._response_handlers.add_handler(url_patterns, callback, **scope)

    def remove_response_handler(self, handle) -> None:
        """Remove a response handler by the handle ``add_response_handler`` returned."""
        self._drain_handler_errors()
        self._response_handlers.remove_handler(handle)

    def clear_response_handlers(self) -> None:
        """Remove every response handler."""
        self._drain_handler_errors()
        self._response_handlers.clear()

    # ----------------------------------------------------------------------
    # Authentication handlers
    # ----------------------------------------------------------------------

    def add_authentication_handler(
        self,
        url_patterns=None,
        callback: Callable | None = None,
        *,
        window_handle: str | None = None,
        user_context: str | None = None,
    ) -> HandlerHandle:
        """Add a handler for authentication challenges.

        Usage::

            driver.network.add_authentication_handler(handler)
            driver.network.add_authentication_handler([{"hostname": "secure.example.com"}], handler)

        The handler receives an :class:`AuthenticationRequest` and settles it
        with ``authenticate(username, password)`` or ``cancel()``.  A challenge
        nothing settles falls through to the browser's own behavior.  For a
        fixed username and password, prefer :meth:`add_authentication`.

        Args:
            url_patterns: URL patterns limiting which challenges reach the
                handler, evaluated by the browser. Defaults to matching
                everything.
            callback: The handler callable.
            window_handle: The window handle the handler applies to.
            user_context: The user context the handler applies to. Mutually
                exclusive with ``window_handle``.

        Returns:
            A :class:`HandlerHandle` for ``remove_authentication_handler(handle)``.
        """
        self._drain_handler_errors()
        scope = {"window_handle": window_handle, "user_context": user_context}
        if callable(url_patterns) and callback is None:
            return self._auth_handlers.add_handler(None, url_patterns, **scope)
        if not callable(callback):
            raise TypeError("add_authentication_handler requires a callable handler")
        return self._auth_handlers.add_handler(url_patterns, callback, **scope)

    def add_authentication(
        self,
        username: str,
        password: str,
        url_patterns=None,
        *,
        window_handle: str | None = None,
        user_context: str | None = None,
    ) -> HandlerHandle:
        """Answer authentication challenges with a fixed username and password.

        Usage::

            driver.network.add_authentication("user", "pass", [{"hostname": "secure.example.com"}])

        Belongs to the authentication family: remove it with
        ``remove_authentication_handler`` and clear it with
        ``clear_authentication_handlers``.

        Args:
            username: The username for the challenge.
            password: The password for the challenge.
            url_patterns: URL patterns limiting which challenges are answered.
                Defaults to matching everything.
            window_handle: The window handle the handler applies to.
            user_context: The user context the handler applies to. Mutually
                exclusive with ``window_handle``.

        Returns:
            A :class:`HandlerHandle` for ``remove_authentication_handler(handle)``.
        """

        def _authenticate(challenge):
            challenge.authenticate(username, password)

        return self.add_authentication_handler(
            url_patterns, _authenticate, window_handle=window_handle, user_context=user_context
        )

    def remove_authentication_handler(self, handle) -> None:
        """Remove an authentication handler by the handle it was added with."""
        self._drain_handler_errors()
        self._auth_handlers.remove_handler(handle)

    def clear_authentication_handlers(self) -> None:
        """Remove every authentication handler."""
        self._drain_handler_errors()
        self._auth_handlers.clear()

    def add_auth_handler(self, username, password):
        """Deprecated: use :meth:`add_authentication`."""
        warnings.warn(
            "add_auth_handler is deprecated, use add_authentication instead",
            DeprecationWarning,
            stacklevel=2,
        )
        self._drain_handler_errors()
        return self._protocol.add_auth_handler(username, password)

    def remove_auth_handler(self, callback_id) -> None:
        """Deprecated: use :meth:`remove_authentication_handler`."""
        warnings.warn(
            "remove_auth_handler is deprecated, use add_authentication and remove_authentication_handler instead",
            DeprecationWarning,
            stacklevel=2,
        )
        self._drain_handler_errors()
        self._protocol.remove_auth_handler(callback_id)

    # ----------------------------------------------------------------------
    # Extra headers
    # ----------------------------------------------------------------------

    def add_extra_header(self, name: str, value: str) -> None:
        """Add a header that is merged into every subsequent request.

        While any extra header is set every request is paused and continued with
        the merged headers, which adds a round trip per request, so remove the
        headers when no longer needed.  Header names are case-insensitive;
        adding a header replaces any request header of the same name.
        """
        self._drain_handler_errors()
        self._request_handlers.set_extra_header(name, value)

    def remove_extra_header(self, name: str) -> None:
        """Stop adding an extra header, by its (case-insensitive) name."""
        self._drain_handler_errors()
        self._request_handlers.remove_extra_header(name)

    def clear_extra_headers(self) -> None:
        """Stop adding all extra headers."""
        self._drain_handler_errors()
        self._request_handlers.clear_extra_headers()

    # ----------------------------------------------------------------------
    # Deprecated protocol surface
    # ----------------------------------------------------------------------

    @property
    def intercepts(self) -> list:
        """Deprecated: the protocol intercepts installed for this session's handlers."""
        warnings.warn(
            "driver.network.intercepts is deprecated; intercepts are an implementation detail of the handlers",
            DeprecationWarning,
            stacklevel=2,
        )
        intercepts = sorted(self._intercept_ids())
        if self._protocol_module is not None:
            intercepts += [i for i in self._protocol_module.intercepts if i not in intercepts]
        return intercepts

    def __getattr__(self, name: str) -> Any:
        if name in _PROTOCOL_MEMBERS:
            warnings.warn(
                f"driver.network.{name} is deprecated: it belongs to the internal WebDriver BiDi "
                "implementation, which is not supported API. Use the handler methods on driver.network instead.",
                DeprecationWarning,
                stacklevel=2,
            )
            return getattr(self._protocol, name)
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

    @property
    def _protocol(self):
        """The BiDi network module ``driver.network`` used to be, for deprecated calls."""
        if self._protocol_module is None:
            from selenium.webdriver.common.bidi.network import Network as _BidiNetwork

            self._protocol_module = _BidiNetwork(self._connection)
        return self._protocol_module

    # ----------------------------------------------------------------------
    # What the handler registries need
    # ----------------------------------------------------------------------

    def _drain_handler_errors(self) -> None:
        """Re-raise an exception a handler let escape on the event thread.

        Handlers run on the event-dispatch thread, which has no user frame for
        an exception to propagate into, so it is re-raised from the next call
        into ``driver.network``.  Errors surface one per call, oldest first.
        """
        if self._handler_errors:
            # pop() rather than clear(): an error appended by the event thread
            # between reading and clearing the queue would otherwise be erased.
            raise self._handler_errors.pop(0)

    def _warn_once(self, key: str, message: str) -> None:
        if key in self._warned:
            return
        self._warned.add(key)
        # Points past the registry and the driver.network method at the caller.
        warnings.warn(message, DeprecationWarning, stacklevel=5)

    def _add_intercept(self, phase, url_patterns, contexts) -> str:
        result = self._commands.add_intercept(
            phases=[phase],
            url_patterns=url_patterns or UNSET,
            contexts=contexts or UNSET,
        )
        return result.intercept

    def _remove_intercept(self, intercept_id: str) -> None:
        self._commands.remove_intercept(intercept=intercept_id)

    def _add_data_collector(self, contexts, user_context) -> str:
        result = self._commands.add_data_collector(
            data_types=[DataType.REQUEST],
            max_encoded_data_size=DEFAULT_MAX_BODY_SIZE,
            contexts=contexts or UNSET,
            user_contexts=[user_context] if user_context is not None else UNSET,
        )
        return result.collector

    def _remove_data_collector(self, collector_id: str) -> None:
        self._commands.remove_data_collector(collector=collector_id)

    def _subscribe(self, event: str, callback: Callable) -> tuple:
        raw_event = _RawEvent(event)
        # The callback is in place before the subscription so no event is missed.
        callback_id = self._connection.add_callback(raw_event, callback)
        try:
            subscription = self._session.subscribe(events=[event]).subscription
        except Exception:
            self._connection.remove_callback(raw_event, callback_id)
            raise
        return raw_event, callback_id, subscription

    def _unsubscribe(self, token: tuple) -> None:
        raw_event, callback_id, subscription = token
        try:
            # By subscription ID, so a subscription anything else holds on the
            # same event is left alone.
            self._session.unsubscribe(subscriptions=[subscription])
        finally:
            self._connection.remove_callback(raw_event, callback_id)

    def _intercept_ids(self) -> set:
        return (
            self._request_handlers.intercept_ids()
            | self._response_handlers.intercept_ids()
            | self._auth_handlers.intercept_ids()
        )

    def _collector_ids(self) -> set:
        return self._request_handlers.collector_ids()
