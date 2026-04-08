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

import threading
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from selenium.webdriver.common.bidi.session import Session


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


class _EventManager:
    """Manages event subscriptions and callbacks."""

    def __init__(self, conn, event_configs: dict[str, EventConfig]):
        self.conn = conn
        self.event_configs = event_configs
        self.subscriptions: dict = {}
        self._event_wrappers = {}  # Cache of _EventWrapper objects
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

    def add_event_handler(self, event: str, callback: Callable, contexts: list[str] | None = None) -> int:
        event_config = self.validate_event(event)
        # Use the event wrapper for add_callback
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
