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

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from selenium.webdriver.common.bidi._event_manager import EventConfig, _EventManager


class Level:
    """Level."""

    DEBUG = "debug"
    INFO = "info"
    WARN = "warn"
    ERROR = "error"


LogLevel = Level


@dataclass
class BaseLogEntry:
    """BaseLogEntry."""

    level: Any | None = None
    source: Any | None = None
    text: Any | None = None
    timestamp: Any | None = None
    stack_trace: Any | None = None


@dataclass
class GenericLogEntry:
    """GenericLogEntry."""

    type: str | None = None


@dataclass
class ConsoleLogEntry:
    """ConsoleLogEntry - a console log entry from the browser."""

    type_: str | None = None
    method: str | None = None
    args: list | None = None
    level: Any | None = None
    text: Any | None = None
    source: Any | None = None
    timestamp: Any | None = None
    stack_trace: Any | None = None

    @classmethod
    def from_json(cls, params: dict) -> ConsoleLogEntry:
        """Deserialize from BiDi params dict."""
        return cls(
            type_=params.get("type"),
            method=params.get("method"),
            args=params.get("args"),
            level=params.get("level"),
            text=params.get("text"),
            source=params.get("source"),
            timestamp=params.get("timestamp"),
            stack_trace=params.get("stackTrace"),
        )


@dataclass
class JavascriptLogEntry:
    """JavascriptLogEntry - a JavaScript error log entry from the browser."""

    type_: str | None = None
    level: Any | None = None
    text: Any | None = None
    source: Any | None = None
    timestamp: Any | None = None
    stacktrace: Any | None = None

    @classmethod
    def from_json(cls, params: dict) -> JavascriptLogEntry:
        """Deserialize from BiDi params dict."""
        return cls(
            type_=params.get("type"),
            level=params.get("level"),
            text=params.get("text"),
            source=params.get("source"),
            timestamp=params.get("timestamp"),
            stacktrace=params.get("stackTrace"),
        )


Entry = GenericLogEntry | ConsoleLogEntry | JavascriptLogEntry

# BiDi Event Name to Parameter Type Mapping
EVENT_NAME_MAPPING = {
    "entry_added": "log.entryAdded",
}


class Log:
    """WebDriver BiDi log module."""

    EVENT_CONFIGS: dict[str, EventConfig] = {}

    def __init__(self, conn) -> None:
        self._conn = conn
        self._event_manager = _EventManager(conn, self.EVENT_CONFIGS)

    def add_event_handler(self, event: str, callback: Callable, contexts: list[str] | None = None) -> int:
        """Add an event handler.

        Args:
            event: The event to subscribe to.
            callback: The callback function to execute on event.
            contexts: The context IDs to subscribe to (optional).

        Returns:
            The callback ID.
        """
        return self._event_manager.add_event_handler(event, callback, contexts)

    def remove_event_handler(self, event: str, callback_id: int) -> None:
        """Remove an event handler.

        Args:
            event: The event to unsubscribe from.
            callback_id: The callback ID.
        """
        return self._event_manager.remove_event_handler(event, callback_id)

    def clear_event_handlers(self) -> None:
        """Clear all event handlers."""
        return self._event_manager.clear_event_handlers()


# Event Info Type Aliases
# Event: log.entryAdded
EntryAdded = Entry


# Populate EVENT_CONFIGS with event configuration mappings
_globals = globals()
Log.EVENT_CONFIGS = {
    "entry_added": EventConfig(
        "entry_added",
        "log.entryAdded",
        _globals.get("EntryAdded", dict) if _globals.get("EntryAdded") else dict,
    ),
}
