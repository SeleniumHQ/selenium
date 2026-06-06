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

"""Shared event management helpers for generated WebDriver BiDi modules.

``EventConfig``, ``_EventWrapper``, and ``_EventManager`` are emitted
identically into every generated module that exposes events. Rather than
duplicating this logic across those modules, they are defined once here and
copied into generated outputs by Bazel.
"""

from __future__ import annotations

import logging
import queue
import threading
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.bidi.session import Session

logger = logging.getLogger(__name__)


@dataclass
class EventConfig:
    """Configuration for a BiDi event."""

    event_key: str
    bidi_event: str
    event_class: type


class _EventWrapper:
    """Wrapper to provide event_class attribute for WebSocketConnection callbacks."""

    def __init__(self, bidi_event: str, event_class: type):
        self.event_class = bidi_event  # WebSocket expects the BiDi event name as event_class
        self._python_class = event_class  # Keep reference to Python dataclass for deserialization

    def from_json(self, params: dict) -> Any:
        """Deserialize event params into the wrapped Python dataclass.

        Args:
            params: Raw BiDi event params with camelCase keys.

        Returns:
            An instance of the dataclass, or the raw dict on failure.
        """
        if self._python_class is None or self._python_class is dict:
            return params
        try:
            # Delegate to a classmethod from_json if the class defines one
            if hasattr(self._python_class, "from_json") and callable(self._python_class.from_json):
                return self._python_class.from_json(params)
            import dataclasses as dc

            snake_params = {self._camel_to_snake(k): v for k, v in params.items()}
            if dc.is_dataclass(self._python_class):
                valid_fields = {f.name for f in dc.fields(self._python_class)}
                filtered = {k: v for k, v in snake_params.items() if k in valid_fields}
                return self._python_class(**filtered)
            return self._python_class(**snake_params)
        except Exception:
            return params

    @staticmethod
    def _camel_to_snake(name: str) -> str:
        result = [name[0].lower()]
        for char in name[1:]:
            if char.isupper():
                result.extend(["_", char.lower()])
            else:
                result.append(char)
        return "".join(result)


_UNSET = object()


class Subscription:
    """A pending expectation for a single BiDi event.

    The event handler is registered when the subscription is created, so an
    event fired by an action inside a ``with`` block is captured without a
    race between the action and the wait::

        with driver.network.expect_response("**/api/**") as response_info:
            driver.find_element(By.ID, "load").click()
        response = response_info.value

    Exiting the ``with`` block waits for a matching event (raising
    :class:`~selenium.common.exceptions.TimeoutException` if none arrives
    within ``timeout``) and then removes the event handler.  Outside a
    ``with`` block, call :meth:`wait` (or read :attr:`value`) to block until
    the event arrives, and :meth:`cancel` to stop listening without waiting.

    Exactly the first matching event is captured; matches arriving after the
    subscription detaches are silently discarded.
    """

    def __init__(
        self,
        register: Callable[[Callable], Any],
        unregister: Callable[[Any], None],
        predicate: Callable[[Any], bool] | None = None,
        timeout: float = 30.0,
        transform: Callable[[Any], Any] | None = None,
        description: str = "event",
    ):
        self._unregister = unregister
        self._predicate = predicate
        self._timeout = timeout
        self._transform = transform
        self._description = description
        self._events: queue.SimpleQueue = queue.SimpleQueue()
        self._value = _UNSET
        self._detached = False
        self._detach_lock = threading.Lock()
        self._cleanups: list[Callable[[], None]] = []
        self._token = register(self._on_event)

    def _on_event(self, params: Any) -> None:
        if self._detached:
            return
        try:
            value = self._transform(params) if self._transform else params
            if self._predicate is None or self._predicate(value):
                self._events.put(value)
        except Exception:
            logger.exception("Predicate or transform for %s raised; event dropped", self._description)

    def wait(self, timeout: float | None = None) -> Any:
        """Block until a matching event arrives and return it.

        The first matching event is cached: later calls (and :attr:`value`)
        return it without waiting again.  The event handler is removed once a
        match is captured; on timeout it stays registered so the wait can be
        retried — call :meth:`cancel` to stop listening early.

        Args:
            timeout: Seconds to wait; defaults to the subscription's timeout.

        Raises:
            TimeoutException: If no matching event arrives in time.
        """
        if self._value is not _UNSET:
            return self._value
        timeout = self._timeout if timeout is None else timeout
        try:
            self._value = self._events.get(timeout=timeout)
        except queue.Empty:
            raise TimeoutException(f"Timed out after {timeout}s waiting for {self._description}") from None
        self._detach()
        return self._value

    @property
    def value(self) -> Any:
        """The captured event, waiting for it first if necessary."""
        return self.wait()

    def cancel(self) -> None:
        """Stop listening without waiting for an event."""
        self._detach()

    def add_cleanup(self, cleanup: Callable[[], None]) -> None:
        """Run ``cleanup`` when the subscription detaches.

        Used by ``expect_*`` helpers that register companion event handlers
        (e.g. ``expect_download``) so those are removed alongside this one.
        """
        self._cleanups.append(cleanup)

    def _detach(self) -> None:
        with self._detach_lock:
            if self._detached:
                return
            self._detached = True
        # Unregister and run cleanups outside the lock: they perform BiDi
        # I/O and must not block a concurrent detach attempt.
        try:
            self._unregister(self._token)
        except Exception:
            logger.exception("Failed to remove event handler for %s", self._description)
        for cleanup in self._cleanups:
            try:
                cleanup()
            except Exception:
                logger.exception("Subscription cleanup for %s failed", self._description)

    def __enter__(self) -> Subscription:
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        if exc_type is None:
            try:
                self.wait()
            finally:
                self._detach()
        else:
            self._detach()
        return False


class _EventManager:
    """Manages event subscriptions and callbacks."""

    def __init__(self, conn, event_configs: dict[str, EventConfig]):
        self.conn = conn
        self.event_configs = event_configs
        self.subscriptions: dict = {}
        self._event_wrappers = {}  # Cache of _EventWrapper objects
        self._raw_wrappers = {}  # Cache of raw-dict _EventWrapper objects
        self._bidi_to_class = {config.bidi_event: config.event_class for config in event_configs.values()}
        self._available_events = ", ".join(sorted(event_configs.keys()))
        self._subscription_lock = threading.Lock()

        # Create event wrappers for each event
        for config in event_configs.values():
            wrapper = _EventWrapper(config.bidi_event, config.event_class)
            self._event_wrappers[config.bidi_event] = wrapper

    def validate_event(self, event: str) -> EventConfig:
        event_config = self.event_configs.get(event)
        if not event_config:
            raise ValueError(f"Event '{event}' not found. Available events: {self._available_events}")
        return event_config

    def subscribe_to_event(self, bidi_event: str, contexts: list[str] | None = None) -> None:
        """Subscribe to a BiDi event if not already subscribed."""
        with self._subscription_lock:
            if bidi_event not in self.subscriptions:
                session = Session(self.conn)
                result = session.subscribe([bidi_event], contexts=contexts)
                sub_id = result.get("subscription") if isinstance(result, dict) else None
                self.subscriptions[bidi_event] = {
                    "callbacks": [],
                    "subscription_id": sub_id,
                }

    def unsubscribe_from_event(self, bidi_event: str) -> None:
        """Unsubscribe from a BiDi event if no more callbacks exist."""
        with self._subscription_lock:
            entry = self.subscriptions.get(bidi_event)
            if entry is not None and not entry["callbacks"]:
                session = Session(self.conn)
                sub_id = entry.get("subscription_id")
                if sub_id:
                    session.unsubscribe(subscriptions=[sub_id])
                else:
                    session.unsubscribe(events=[bidi_event])
                del self.subscriptions[bidi_event]

    def add_callback_to_tracking(self, bidi_event: str, callback_id: int) -> None:
        with self._subscription_lock:
            self.subscriptions[bidi_event]["callbacks"].append(callback_id)

    def remove_callback_from_tracking(self, bidi_event: str, callback_id: int) -> None:
        with self._subscription_lock:
            entry = self.subscriptions.get(bidi_event)
            if entry and callback_id in entry["callbacks"]:
                entry["callbacks"].remove(callback_id)

    def add_event_handler(
        self, event: str, callback: Callable, contexts: list[str] | None = None, raw: bool = False
    ) -> int:
        event_config = self.validate_event(event)
        # Use the event wrapper for add_callback.  Raw handlers receive the
        # unfiltered wire-level params dict instead of the typed dataclass,
        # which may not carry every event field.
        if raw:
            event_wrapper = self._raw_wrappers.get(event_config.bidi_event)
            if event_wrapper is None:
                event_wrapper = _EventWrapper(event_config.bidi_event, dict)
                self._raw_wrappers[event_config.bidi_event] = event_wrapper
        else:
            event_wrapper = self._event_wrappers.get(event_config.bidi_event)
        callback_id = self.conn.add_callback(event_wrapper, callback)
        self.subscribe_to_event(event_config.bidi_event, contexts)
        self.add_callback_to_tracking(event_config.bidi_event, callback_id)
        return callback_id

    def remove_event_handler(self, event: str, callback_id: int) -> None:
        event_config = self.validate_event(event)
        event_wrapper = self._event_wrappers.get(event_config.bidi_event)
        self.conn.remove_callback(event_wrapper, callback_id)
        self.remove_callback_from_tracking(event_config.bidi_event, callback_id)
        self.unsubscribe_from_event(event_config.bidi_event)

    def expect(
        self,
        event: str,
        predicate: Callable[[Any], bool] | None = None,
        timeout: float = 30.0,
        transform: Callable[[Any], Any] | None = None,
        raw: bool = False,
        contexts: list[str] | None = None,
    ) -> Subscription:
        """Return a :class:`Subscription` capturing the next matching ``event``.

        Args:
            event: The event key to subscribe to.
            predicate: Optional filter applied to each (transformed) event;
                the first event for which it returns true is captured.
            timeout: Default seconds the subscription waits for a match.
            transform: Optional conversion applied to the event payload
                before the predicate sees it and before it is returned.
            raw: When true the handler receives the wire-level params dict
                instead of the typed event dataclass.
            contexts: Optional browsing context IDs to subscribe to.
        """
        return Subscription(
            register=lambda callback: self.add_event_handler(event, callback, contexts, raw=raw),
            unregister=lambda callback_id: self.remove_event_handler(event, callback_id),
            predicate=predicate,
            timeout=timeout,
            transform=transform,
            description=f"event '{event}'",
        )

    def clear_event_handlers(self) -> None:
        """Clear all event handlers."""
        with self._subscription_lock:
            if not self.subscriptions:
                return
            session = Session(self.conn)
            for bidi_event, entry in list(self.subscriptions.items()):
                event_wrapper = self._event_wrappers.get(bidi_event)
                callbacks = entry["callbacks"] if isinstance(entry, dict) else entry
                if event_wrapper:
                    for callback_id in callbacks:
                        self.conn.remove_callback(event_wrapper, callback_id)
                sub_id = entry.get("subscription_id") if isinstance(entry, dict) else None
                if sub_id:
                    session.unsubscribe(subscriptions=[sub_id])
                else:
                    session.unsubscribe(events=[bidi_event])
            self.subscriptions.clear()
