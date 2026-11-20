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
added through the generated ``add_<event>_listener`` methods and invokes each
one with the typed payloads of its event. Listening is local: nothing here sends
a command, so the caller subscribes with ``session.subscribe`` itself.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

from __future__ import annotations

import itertools
import logging
import os
import queue
import threading
from collections.abc import Callable
from typing import Any

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.serialization import BiDiSerializationError

logger = logging.getLogger(__name__)


class _Listener:
    """Invoked with each payload on a thread of its own, without waiting for earlier invocations."""

    def __init__(self, name: str, event: str, payload_type: type | None, listener: Callable[[Any], Any]):
        self.name = name
        self.event = event
        self.payload_type = payload_type
        self._listener = listener
        self._active = True

    def dispatch(self, payload: Any) -> None:
        threading.Thread(target=self._invoke, args=(payload,), name=self.name, daemon=True).start()

    def deactivate(self) -> None:
        # Not joined: the caller may be this listener itself, removing itself or quitting the driver.
        self._active = False

    def _invoke(self, payload: Any) -> None:
        if not self._active:
            return
        try:
            self._listener(payload)
        # Nothing above a listener's thread can handle what escapes it, and pytest.fail() is not an Exception.
        except BaseException:
            logger.exception("A listener for %s raised", self.event)


class _OrderedListener(_Listener):
    """Invoked with one payload at a time, in arrival order, on its own worker thread.

    Used only when SE_ORDERED_EVENTS is true; kept for evaluating ordered delivery.
    """

    _STOP = object()

    def __init__(self, name: str, event: str, payload_type: type | None, listener: Callable[[Any], Any]):
        super().__init__(name, event, payload_type, listener)
        self._queue: queue.SimpleQueue[Any] = queue.SimpleQueue()
        threading.Thread(target=self._run, name=name, daemon=True).start()

    def dispatch(self, payload: Any) -> None:
        self._queue.put(payload)

    def deactivate(self) -> None:
        # A payload queued behind the marker arrived after removal and is never invoked.
        super().deactivate()
        self._queue.put(self._STOP)

    def _run(self) -> None:
        while (payload := self._queue.get()) is not self._STOP:
            self._invoke(payload)


class EventDispatcher:
    """Holds the event listeners of one BiDi connection and runs them.

    The first :class:`Transport` to add a listener attaches one to the connection, and
    every other transport on that connection reaches the same one, so a listener added
    through one domain instance can be removed through any other.
    """

    def __init__(self) -> None:
        self._listeners: dict[str, _Listener] = {}
        self._ids = itertools.count(1)
        self._lock = threading.Lock()
        self._closed = False

    def add_listener(self, event: str, payload_type: type | None, listener: Callable[[Any], Any]) -> str:
        if not callable(listener):
            raise TypeError("a callable is required to listen for an event")
        with self._lock:
            if self._closed:
                raise WebDriverException("The BiDi connection is closed")
            listener_id = f"{event}#{next(self._ids)}"
            kind = _OrderedListener if os.environ.get("SE_ORDERED_EVENTS") == "true" else _Listener
            self._listeners[listener_id] = kind(f"bidi-listener-{listener_id}", event, payload_type, listener)
        return listener_id

    def remove_listener(self, listener_id: str) -> None:
        with self._lock:
            removed = self._listeners.pop(listener_id, None)
        if removed is not None:
            removed.deactivate()

    def receive(self, method: str, params: dict[str, Any]) -> None:
        """Hand a payload to each listener of its event; runs on the socket's reader thread, so it never waits."""
        with self._lock:
            listeners = [listener for listener in self._listeners.values() if listener.event == method]
        if not listeners:
            return
        payload_type = listeners[0].payload_type
        try:
            payload = params if payload_type is None else payload_type.from_json(params)
        except BiDiSerializationError as e:
            logger.error("Dropped a %s payload that failed validation: %s", method, e)
            return
        for listener in listeners:
            listener.dispatch(payload)

    def close(self) -> None:
        with self._lock:
            self._closed = True
            listeners, self._listeners = list(self._listeners.values()), {}
        for listener in listeners:
            listener.deactivate()
