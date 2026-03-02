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

from __future__ import annotations

import threading
from collections.abc import Callable

from selenium.webdriver.common.bidi.session import Session


class PreloadingStatus:
    """Represents the different types of preloading statuses.

    This status is shared by prefetches and prerenders.
    """

    PENDING = "pending"
    READY = "ready"
    SUCCESS = "success"
    FAILURE = "failure"

    VALID_STATUSES = {PENDING, READY, SUCCESS, FAILURE}


class PrefetchStatusUpdatedParams:
    """Parameters for the speculation.prefetchStatusUpdated event."""

    def __init__(self, context: str, url: str, status: str):
        self.context = context
        self.url = url
        self.status = status

    @classmethod
    def from_json(cls, json: dict) -> PrefetchStatusUpdatedParams:
        """Creates a PrefetchStatusUpdatedParams instance from a dictionary.

        Args:
            json: A dictionary containing the prefetch status updated parameters.

        Returns:
            A new instance of PrefetchStatusUpdatedParams.

        Raises:
            ValueError: If required fields are missing or have invalid types.
        """
        context = json.get("context")
        if context is None or not isinstance(context, str):
            raise ValueError("context is required and must be a string")

        url = json.get("url")
        if url is None or not isinstance(url, str):
            raise ValueError("url is required and must be a string")

        status = json.get("status")
        if status is None or not isinstance(status, str):
            raise ValueError("status is required and must be a string")

        if status not in PreloadingStatus.VALID_STATUSES:
            raise ValueError(f"Invalid status: {status}. Must be one of {PreloadingStatus.VALID_STATUSES}")

        return cls(
            context=context,
            url=url,
            status=status,
        )


class PrefetchStatusUpdated:
    """Event class for speculation.prefetchStatusUpdated event."""

    event_class = "speculation.prefetchStatusUpdated"

    @classmethod
    def from_json(cls, json: dict):
        if isinstance(json, PrefetchStatusUpdatedParams):
            return json
        return PrefetchStatusUpdatedParams.from_json(json)


class Speculation:
    """BiDi implementation of the speculation module.

    The speculation module contains commands for managing the remote end
    behavior for prefetches, prerenders, and speculation rules.
    """

    # Maps Python event names to (bidi_event_name, event_class)
    _EVENT_MAP: dict[str, tuple[str, type]] = {
        "prefetch_status_updated": ("speculation.prefetchStatusUpdated", PrefetchStatusUpdated),
    }

    # Reverse mapping: BiDi event name to event class
    _BIDI_TO_CLASS: dict[str, type] = {
        "speculation.prefetchStatusUpdated": PrefetchStatusUpdated,
    }

    def __init__(self, conn):
        self.conn = conn
        self._session = Session(conn)
        self.subscriptions: dict[str, list[int]] = {}
        self._subscription_lock = threading.Lock()

    def _validate_event(self, event: str) -> tuple[str, type]:
        """Validate and resolve an event name to its BiDi event name and class.

        Args:
            event: The Python event name (e.g., "prefetch_status_updated").

        Returns:
            A tuple of (bidi_event_name, event_class).

        Raises:
            ValueError: If the event name is not recognized.
        """
        entry = self._EVENT_MAP.get(event)
        if not entry:
            available = ", ".join(sorted(self._EVENT_MAP.keys()))
            raise ValueError(f"Event '{event}' not found. Available events: {available}")
        return entry

    def add_event_handler(self, event: str, callback: Callable, contexts: list[str] | None = None) -> int:
        """Add an event handler for a speculation event.

        Args:
            event: The event to subscribe to (e.g., "prefetch_status_updated").
            callback: The callback function to execute on event.
            contexts: Optional browsing context IDs to subscribe to.

        Returns:
            Callback id for later removal.

        Raises:
            ValueError: If the event name is not recognized.
        """
        bidi_event, event_class = self._validate_event(event)

        callback_id = self.conn.add_callback(event_class, callback)

        with self._subscription_lock:
            if bidi_event not in self.subscriptions:
                self.conn.execute(self._session.subscribe(bidi_event, browsing_contexts=contexts))
                self.subscriptions[bidi_event] = []
            self.subscriptions[bidi_event].append(callback_id)

        return callback_id

    def remove_event_handler(self, event: str, callback_id: int) -> None:
        """Remove an event handler for a speculation event.

        Args:
            event: The event to unsubscribe from.
            callback_id: The callback id to remove.

        Raises:
            ValueError: If the event name is not recognized.
        """
        bidi_event, event_class = self._validate_event(event)

        self.conn.remove_callback(event_class, callback_id)

        with self._subscription_lock:
            callback_list = self.subscriptions.get(bidi_event)
            if callback_list and callback_id in callback_list:
                callback_list.remove(callback_id)

            if callback_list is not None and not callback_list:
                self.conn.execute(self._session.unsubscribe(bidi_event))
                del self.subscriptions[bidi_event]

    def clear_event_handlers(self) -> None:
        """Clear all event handlers from the speculation module."""
        with self._subscription_lock:
            if not self.subscriptions:
                return

            for bidi_event, callback_ids in list(self.subscriptions.items()):
                event_class = self._BIDI_TO_CLASS.get(bidi_event)
                if event_class:
                    for callback_id in callback_ids:
                        self.conn.remove_callback(event_class, callback_id)
                    self.conn.execute(self._session.unsubscribe(bidi_event))

            self.subscriptions.clear()
