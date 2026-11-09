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

Hand-written (not generated). An :class:`EventDispatcher` holds the callables
registered through the generated ``add_<event>_callback`` methods, gives each one
its own ``session.subscribe``, and calls it with the raw params of its events.

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
from selenium.webdriver.common._bidi.serialization import UNSET, UnsetType
from selenium.webdriver.common._bidi.session import Session, SubscribeResult
from selenium.webdriver.common._bidi.transport import Transport

logger = logging.getLogger(__name__)


@dataclass(eq=False)
class _Registration:
    event: str
    callback: Callable[[dict[str, Any]], Any]
    subscription: str | None = None
    removing: bool = False


class EventDispatcher:
    """Holds the event callables of one BiDi connection and runs them.

    There is one per connection, created by whatever opens it and attached with
    ``connection.set_event_receiver``; every :class:`Transport` on that connection
    reaches it from there. Each callable runs on its own thread per event, so it may
    send commands, and events are not delivered in any guaranteed order.
    """

    def __init__(self, connection: Any) -> None:
        self._session = Session(Transport(connection))
        self._registrations: list[_Registration] = []
        # Never held while a command is in flight: its reply arrives on the thread that calls ``receive``.
        self._lock = threading.Lock()
        self._closed = False

    def add_callback(
        self,
        event: str,
        callback: Callable[[dict[str, Any]], Any],
        contexts: list[str] | UnsetType = UNSET,
        user_contexts: list[str] | UnsetType = UNSET,
    ) -> SubscribeResult:
        registration = _Registration(event, callback)
        with self._lock:
            if self._closed:
                raise WebDriverException("The BiDi connection is closed")
            # Registered before subscribing so no event can arrive ahead of its callable.
            self._registrations.append(registration)
        try:
            result = self._session.subscribe(events=[event], contexts=contexts, user_contexts=user_contexts)
        except BaseException:
            self._discard(registration)
            raise
        registration.subscription = result.subscription
        return result

    def remove_callback(self, subscription: str) -> None:
        with self._lock:
            registration = next(
                (r for r in self._registrations if r.subscription == subscription and not r.removing), None
            )
            if registration is not None:
                # Claimed here so a concurrent remove finds nothing and sends no second unsubscribe.
                registration.removing = True
        if registration is None:
            raise InvalidArgumentException(f"No callback is registered for subscription {subscription!r}")
        try:
            self._session.unsubscribe(subscriptions=[subscription])
        except WebDriverException:
            logger.warning("Unsubscribing %s failed; its callback was removed anyway", subscription, exc_info=True)
        finally:
            # Kept until the reply: the subscription is live until then, and its events are still owed.
            self._discard(registration)

    def receive(self, method: str, params: dict[str, Any]) -> None:
        with self._lock:
            callbacks = [r.callback for r in self._registrations if r.event == method]
        for callback in callbacks:
            threading.Thread(target=self._run, args=(method, callback, params), daemon=True).start()

    def close(self) -> None:
        with self._lock:
            self._closed = True
            self._registrations.clear()

    def _discard(self, registration: _Registration) -> None:
        with self._lock:
            if registration in self._registrations:
                self._registrations.remove(registration)

    @staticmethod
    def _run(method: str, callback: Callable[[dict[str, Any]], Any], params: dict[str, Any]) -> None:
        try:
            callback(params)
        except Exception:
            logger.exception("A callback for %s raised", method)
