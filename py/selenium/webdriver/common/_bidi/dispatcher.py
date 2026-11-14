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
registered through the generated ``add_<event>_listener`` methods and applies each
one to the typed payloads of its event. Listening is local: nothing here sends a
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
    """One listener with its own queue and worker, so its payloads run in order and never wait on another's."""

    def __init__(self, listener_id: str, event: str, payload_type: type | None, listener: Callable[[Any], Any]):
        self.event = event
        self.payload_type = payload_type
        self._listener = listener
        self._queue: queue.SimpleQueue[Any] = queue.SimpleQueue()
        self._stopped = threading.Event()
        threading.Thread(target=self._run, name=f"bidi-listener-{listener_id}", daemon=True).start()

    def deliver(self, payload: Any) -> None:
        self._queue.put(payload)

    def stop(self) -> None:
        # Not joined: the caller may be this listener itself, removing itself or quitting the driver.
        self._stopped.set()
        self._queue.put(_STOP)

    def _run(self) -> None:
        while True:
            payload = self._queue.get()
            if self._stopped.is_set():
                return
            try:
                self._listener(payload)
            except Exception:
                logger.exception("A listener for %s raised", self.event)


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

    def add_listener(self, event: str, payload_type: type | None, listener: Callable[[Any], Any]) -> str:
        with self._lock:
            if self._closed:
                raise WebDriverException("The BiDi connection is closed")
            listener_id = f"{event}#{next(self._ids)}"
            self._listeners[listener_id] = _Listener(listener_id, event, payload_type, listener)
        return listener_id

    def remove_listener(self, listener_id: str) -> None:
        with self._lock:
            removed = self._listeners.pop(listener_id, None)
        if removed is not None:
            removed.stop()

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
            listener.deliver(payload)

    def close(self) -> None:
        with self._lock:
            self._closed = True
            listeners, self._listeners = list(self._listeners.values()), {}
        for listener in listeners:
            listener.stop()
