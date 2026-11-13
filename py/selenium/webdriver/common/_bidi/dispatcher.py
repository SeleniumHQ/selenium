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


"""The event side of the generated BiDi protocol layer.

Hand-written (not generated). An :class:`EventDispatcher` holds the listeners
registered through the generated ``add_<event>_listener`` methods, gives each one
its own ``session.subscribe``, and applies it to the typed payloads of its event
that fall within its scope.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

from __future__ import annotations

import logging
import threading
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from selenium.common.exceptions import InvalidArgumentException, WebDriverException
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, Info
from selenium.webdriver.common._bidi.serialization import UNSET, BiDiSerializationError
from selenium.webdriver.common._bidi.session import Session, SubscribeResult
from selenium.webdriver.common._bidi.transport import Transport

logger = logging.getLogger(__name__)


@dataclass(eq=False)
class _Registration:
    event: str
    listener: Callable[[Any], Any]
    payload_type: type | None
    browsing_context: str | None
    user_context: str | None
    subscription: str | None = None


@dataclass(frozen=True)
class _Page:
    """The top-level browsing context a context belongs to, and that page's user context."""

    context: str
    user_context: str


class EventDispatcher:
    """Holds the event listeners of one BiDi connection and runs them.

    There is one per connection, created by whatever opens it and attached with
    ``connection.set_event_receiver``; every :class:`Transport` on that connection
    reaches it from there. Each listener runs on its own thread per payload, so it may
    send commands, and payloads are not delivered in any guaranteed order.
    """

    def __init__(self, connection: Any) -> None:
        transport = Transport(connection)
        self._session = Session(transport)
        self._browsing_context = BrowsingContext(transport)
        self._registrations: list[_Registration] = []
        self._pages: dict[str, _Page] = {}
        # Never held while a command is in flight: its reply arrives on the thread that calls ``receive``.
        self._lock = threading.Lock()
        self._closed = False

    def add_listener(
        self,
        event: str,
        payload_type: type | None,
        listener: Callable[[Any], Any],
        browsing_context: str | None = None,
        user_context: str | None = None,
    ) -> SubscribeResult:
        if browsing_context is not None and user_context is not None:
            raise InvalidArgumentException("A listener is scoped by a browsing context or a user context, not both")
        registration = _Registration(event, listener, payload_type, browsing_context, user_context)
        with self._lock:
            if self._closed:
                raise WebDriverException("The BiDi connection is closed")
            # Registered before subscribing: the remote end emits some payloads before it answers.
            self._registrations.append(registration)
        try:
            if browsing_context is not None and self._known_page(browsing_context) is None:
                # Resolved now: a window's own contextDestroyed arrives after the tree has dropped it.
                self._refresh_pages()
            result = self._session.subscribe(
                events=[event],
                contexts=[browsing_context] if browsing_context is not None else UNSET,
                user_contexts=[user_context] if user_context is not None else UNSET,
            )
        except BaseException:
            self._forget(lambda r: r is registration)
            raise
        registration.subscription = result.subscription
        return result

    def remove_listener(self, subscription: SubscribeResult) -> None:
        # Dropped before the unsubscribe so no further payload reaches it, whatever the remote end answers.
        self._forget(lambda r: r.subscription == subscription.subscription)
        self._session.unsubscribe(subscriptions=[subscription.subscription])

    def receive(self, method: str, params: dict[str, Any]) -> None:
        with self._lock:
            registrations = [r for r in self._registrations if r.event == method]
        if not registrations:
            return
        payload_type = registrations[0].payload_type
        try:
            payload = params if payload_type is None else payload_type.from_json(params)
        except BiDiSerializationError:
            logger.exception("Dropped a %s payload that failed validation", method)
            return
        for registration in registrations:
            if self._in_scope(registration, params) is not False:
                threading.Thread(target=self._apply, args=(registration, params, payload), daemon=True).start()

    def close(self) -> None:
        with self._lock:
            self._closed = True
            self._registrations.clear()
            self._pages.clear()

    def _forget(self, gone: Callable[[_Registration], bool]) -> None:
        with self._lock:
            self._registrations = [r for r in self._registrations if not gone(r)]

    def _apply(self, registration: _Registration, params: dict[str, Any], payload: Any) -> None:
        in_scope = self._in_scope(registration, params)
        if in_scope is None:
            self._refresh_pages()
            in_scope = self._in_scope(registration, params)
        if not in_scope:
            return
        try:
            registration.listener(payload)
        except Exception:
            logger.exception("A listener for %s raised", registration.event)

    def _in_scope(self, registration: _Registration, params: dict[str, Any]) -> bool | None:
        """Whether the payload is in the listener's scope; None while a context it names is not yet known."""
        if registration.browsing_context is None and registration.user_context is None:
            return True
        context = _context_of(params)
        if context is None:
            return False
        page = self._known_page(context)
        if page is None and params.get("parent"):
            # A destroyed frame is already out of the tree, but its payload names its parent.
            page = self._known_page(params["parent"])
        if page is None:
            return None
        if registration.user_context is not None:
            return page.user_context == registration.user_context
        scope = self._known_page(registration.browsing_context)
        return None if scope is None else scope.context == page.context

    def _known_page(self, context: str) -> _Page | None:
        with self._lock:
            return self._pages.get(context)

    def _refresh_pages(self) -> None:
        try:
            tree = self._browsing_context.get_tree().contexts
        except WebDriverException:
            logger.exception("Could not fetch the browsing context tree to scope a listener")
            return
        pages: dict[str, _Page] = {}

        def walk(info: Info, page: _Page) -> None:
            pages[info.context] = page
            for child in info.children or []:
                walk(child, page)

        for top in tree:
            walk(top, _Page(top.context, top.user_context))
        with self._lock:
            # Updated, not replaced: a context id is never reused, and a destroyed one still has payloads to scope.
            self._pages.update(pages)


def _context_of(params: dict[str, Any]) -> str | None:
    source = params.get("source")
    return params.get("context") or (source.get("context") if isinstance(source, dict) else None)
