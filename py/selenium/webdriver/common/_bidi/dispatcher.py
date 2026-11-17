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
added through the generated ``add_<event>_listener`` methods and
invokes each one with the typed payloads of its event, in order by default or
concurrently on request. Listening is local: nothing here sends a
command, so the caller subscribes with ``session.subscribe`` itself.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

from __future__ import annotations

import itertools
import logging
import queue
import threading
from collections.abc import Callable
from typing import Any

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.serialization import BiDiSerializationError

logger = logging.getLogger(__name__)

_STOP = object()


class _Listener:
    """One listener and its pending payloads, invoked one at a time on its own worker or each on its own thread."""

    def __init__(
        self, listener_id: str, event: str, payload_type: type | None, listener: Callable[[Any], Any], concurrent: bool
    ):
        self.event = event
        self.payload_type = payload_type
        self._name = f"bidi-listener-{listener_id}"
        self._listener = listener
        self._concurrent = concurrent
        self._state = threading.Condition()
        self._pending = 0
        self._running: set[int] = set()
        self._active = True
        self._discarded = False
        if not concurrent:
            self._queue: queue.SimpleQueue[Any] = queue.SimpleQueue()
            threading.Thread(target=self._run_in_order, name=self._name, daemon=True).start()

    def dispatch(self, payload: Any) -> None:
        # Enqueued under the lock so a payload accepted before a drain is never queued behind its stop marker.
        with self._state:
            if not self._active:
                return
            self._pending += 1
            if self._concurrent:
                threading.Thread(target=self._invoke, args=(payload,), name=self._name, daemon=True).start()
            else:
                self._queue.put(payload)

    def invoking_on_current_thread(self) -> bool:
        with self._state:
            return threading.get_ident() in self._running

    def discard(self) -> None:
        # Not joined: the caller may be this listener itself, removing itself or quitting the driver.
        with self._state:
            self._deactivate()
            self._discarded = True
            self._state.notify_all()

    def drain(self) -> None:
        with self._state:
            self._deactivate()
            self._state.wait_for(lambda: self._pending == 0 or self._discarded)

    def _deactivate(self) -> None:
        if self._active and not self._concurrent:
            self._queue.put(_STOP)
        self._active = False

    def _run_in_order(self) -> None:
        while (payload := self._queue.get()) is not _STOP:
            self._invoke(payload)

    def _invoke(self, payload: Any) -> None:
        with self._state:
            if self._discarded:
                self._finish()
                return
            self._running.add(threading.get_ident())
        try:
            self._listener(payload)
        except Exception:
            logger.exception("A listener for %s raised", self.event)
        finally:
            with self._state:
                self._running.discard(threading.get_ident())
                self._finish()

    def _finish(self) -> None:
        self._pending -= 1
        if self._pending == 0:
            self._state.notify_all()


class EventDispatcher:
    """Holds the event listeners of one BiDi connection and runs them.

    There is one per connection, created by whatever opens it and attached with
    ``connection.set_event_receiver``; every :class:`Transport` on that connection
    reaches it from there, so a listener added through one domain instance can be
    removed through any other.
    """

    def __init__(self) -> None:
        self._listeners: dict[str, _Listener] = {}
        # Removed listeners still being drained, so a discard or close can release the wait.
        self._draining: dict[str, _Listener] = {}
        self._ids = itertools.count(1)
        self._lock = threading.Lock()
        self._closed = False

    def add_listener(
        self, event: str, payload_type: type | None, listener: Callable[[Any], Any], *, concurrent: bool = False
    ) -> str:
        with self._lock:
            if self._closed:
                raise WebDriverException("The BiDi connection is closed")
            listener_id = f"{event}#{next(self._ids)}"
            self._listeners[listener_id] = _Listener(listener_id, event, payload_type, listener, concurrent)
        return listener_id

    def remove_listener(self, listener_id: str, *, drain: bool = False) -> None:
        with self._lock:
            removed = self._listeners.pop(listener_id, None) or self._draining.get(listener_id)
            if removed is None:
                return
            if not drain:
                self._draining.pop(listener_id, None)
            elif removed.invoking_on_current_thread():
                self._listeners[listener_id] = removed
                raise RuntimeError("A listener cannot drain itself; remove it without drain from inside its own call")
            else:
                self._draining[listener_id] = removed
        if not drain:
            removed.discard()
            return
        try:
            removed.drain()
        finally:
            with self._lock:
                self._draining.pop(listener_id, None)

    def receive(self, method: str, params: dict[str, Any]) -> None:
        """Queue a payload for each listener of its event; runs on the socket's reader thread, so it never waits."""
        with self._lock:
            listeners = [listener for listener in self._listeners.values() if listener.event == method]
        if not listeners:
            return
        payload_type = listeners[0].payload_type
        try:
            payload = params if payload_type is None else payload_type.from_json(params)
        except BiDiSerializationError:
            logger.exception("Dropped a %s payload that failed validation", method)
            return
        for listener in listeners:
            listener.dispatch(payload)

    def close(self) -> None:
        with self._lock:
            self._closed = True
            listeners = [*self._listeners.values(), *self._draining.values()]
            self._listeners, self._draining = {}, {}
        for listener in listeners:
            listener.discard()
