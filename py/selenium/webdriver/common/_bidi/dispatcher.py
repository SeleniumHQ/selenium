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
import time
from collections.abc import Callable
from typing import Any

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.serialization import BiDiSerializationError

logger = logging.getLogger(__name__)

_STOP = object()


class _Listener:
    """A listener and how it is stopped; subclasses decide which threads invoke it."""

    def __init__(self, name: str, event: str, payload_type: type | None, listener: Callable[[Any], Any]):
        self.event = event
        self.payload_type = payload_type
        self.name = name
        self._listener = listener
        self._discarded = False

    def dispatch(self, payload: Any) -> None:
        raise NotImplementedError

    def discard(self) -> None:
        # Not joined: the caller may be this listener itself, removing itself or quitting the driver.
        self._discarded = True
        self._deactivate()

    def drain(self, timeout: float) -> None:
        deadline = time.monotonic() + timeout
        for thread in self._deactivate():
            thread.join(max(0.0, deadline - time.monotonic()))
            if thread.is_alive():
                self._discarded = True
                raise TimeoutError(f"Listener {self.name} did not finish draining within {timeout} seconds")

    def _deactivate(self) -> list[threading.Thread]:
        """Stop accepting payloads and return the threads that may still invoke the listener."""
        raise NotImplementedError

    def _invoke(self, payload: Any) -> None:
        if self._discarded:
            return
        try:
            self._listener(payload)
        except Exception:
            logger.exception("A listener for %s raised", self.event)


class _SequentialListener(_Listener):
    """Invoked with one payload at a time, in arrival order, on its own worker thread."""

    def __init__(self, name: str, event: str, payload_type: type | None, listener: Callable[[Any], Any]):
        super().__init__(name, event, payload_type, listener)
        self._queue: queue.SimpleQueue[Any] = queue.SimpleQueue()
        self._worker = threading.Thread(target=self._run, name=name, daemon=True)
        self._worker.start()

    def dispatch(self, payload: Any) -> None:
        self._queue.put(payload)

    def _deactivate(self) -> list[threading.Thread]:
        # A payload that lands behind this marker was dispatched after removal and is never invoked.
        self._queue.put(_STOP)
        return [self._worker]

    def _run(self) -> None:
        while (payload := self._queue.get()) is not _STOP:
            self._invoke(payload)


class _ConcurrentListener(_Listener):
    """Invoked with each payload on a thread of its own, without waiting for earlier invocations."""

    def __init__(self, name: str, event: str, payload_type: type | None, listener: Callable[[Any], Any]):
        super().__init__(name, event, payload_type, listener)
        self._threads: set[threading.Thread] = set()
        self._lock = threading.Lock()
        self._active = True

    def dispatch(self, payload: Any) -> None:
        # Checked under the lock so no thread is added once a drain has taken the set to join.
        with self._lock:
            if not self._active:
                return
            thread = threading.Thread(target=self._run, args=(payload,), name=self.name, daemon=True)
            self._threads.add(thread)
            try:
                thread.start()
            except RuntimeError:
                self._threads.discard(thread)
                logger.exception("Could not start a thread for a %s listener; the payload is dropped", self.event)

    def _deactivate(self) -> list[threading.Thread]:
        with self._lock:
            self._active = False
            return list(self._threads)

    def _run(self, payload: Any) -> None:
        try:
            self._invoke(payload)
        finally:
            with self._lock:
                self._threads.discard(threading.current_thread())


class EventDispatcher:
    """Holds the event listeners of one BiDi connection and runs them.

    There is one per connection, created by whatever opens it and attached with
    ``connection.set_event_receiver``; every :class:`Transport` on that connection
    reaches it from there, so a listener added through one domain instance can be
    removed through any other.
    """

    def __init__(self) -> None:
        self._listeners: dict[str, _Listener] = {}
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
            kind = _ConcurrentListener if concurrent else _SequentialListener
            self._listeners[listener_id] = kind(f"bidi-listener-{listener_id}", event, payload_type, listener)
        return listener_id

    def remove_listener(self, listener_id: str, *, drain_timeout: float | None = None) -> None:
        with self._lock:
            removed = self._listeners.pop(listener_id, None)
        if removed is None:
            return
        if drain_timeout is None:
            removed.discard()
        else:
            removed.drain(drain_timeout)

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
            listeners, self._listeners = list(self._listeners.values()), {}
        for listener in listeners:
            listener.discard()
