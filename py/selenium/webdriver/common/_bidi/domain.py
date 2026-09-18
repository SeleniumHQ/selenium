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

"""Base class for the generated BiDi domain modules.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.serialization import BiDiSerializationError, resolve
from selenium.webdriver.common._bidi.transport import Transport

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Event:
    """One BiDi event, bound to the payload type the schema declares for it.

    Shaped for ``WebSocketConnection.add_callback``, which reads the wire method name off
    ``event_class`` and calls :meth:`from_json` on every pushed payload — so registering one
    of these is what makes an event arrive as its generated type rather than as a raw dict.
    """

    event_class: str
    """The wire method name, e.g. ``log.entryAdded``. Named for what add_callback reads."""

    payload_type: str | None
    """The schema type name of the payload, resolved lazily; ``None`` for a payload-less event."""

    def from_json(self, params: Any) -> Any:
        if self.payload_type is None:
            return params
        try:
            return resolve(self.payload_type).from_json(params)  # type: ignore[attr-defined]
        except BiDiSerializationError:
            # A callback runs on its own daemon thread, where a raise reaches the user only
            # through threading.excepthook. Logging it too keeps a payload the contract rejects
            # distinguishable from an event that simply never arrived.
            logger.exception("%s: payload does not match this Selenium's BiDi schema", self.event_class)
            raise


class Domain:
    """Base for every generated domain module.

    ``source`` is a ``WebDriver`` — whose BiDi connection this domain wraps in its
    own :class:`Transport` (the driver starts BiDi if it hasn't already) — or a
    :class:`Transport` for the standalone path.
    """

    EVENTS: dict[str, str] = {}
    """Event method name -> wire method name. Generated; empty for a domain with no events."""

    EVENT_TYPES: dict[str, str | None] = {}
    """Wire method name -> the schema type of its payload. Generated alongside ``EVENTS``."""

    def __init__(self, source: Any) -> None:
        if isinstance(source, Transport):
            self._transport = source
            return
        connection = getattr(source, "_websocket_connection", None)
        if connection is None:
            start = getattr(source, "_start_bidi", None)
            if start is None:
                raise WebDriverException("a WebDriver or Transport is required")
            start()
            connection = source._websocket_connection
        self._transport = Transport(connection)

    def _execute(self, cmd: str, params: Any = None, result: Any = None) -> Any:
        return self._transport.execute(cmd, params=params, result=result)

    @classmethod
    def event(cls, name: str) -> Event:
        """The event this domain declares under ``name``, bound to its payload type.

        ``name`` is either the event's method name (``entry_added``) or its wire name
        (``log.entryAdded``); both name the same event.
        """
        wire = cls.EVENTS.get(name, name)
        if wire not in cls.EVENT_TYPES:
            raise WebDriverException(f"{cls.__name__} has no event {name!r}")
        return Event(event_class=wire, payload_type=cls.EVENT_TYPES[wire])

    def on(self, event: str, callback: Callable[[Any], Any]) -> int:
        """Call ``callback`` with each ``event`` payload, typed as the schema declares it.

        Returns the id :meth:`off` takes. Telling the remote end to send the event at all is
        a separate, orchestration-level concern (``session.subscribe``); this governs only how
        what arrives is typed.
        """
        return self._transport.connection.add_callback(self.event(event), callback)

    def off(self, event: str, callback_id: int) -> None:
        """Stop calling the callback :meth:`on` returned ``callback_id`` for."""
        self._transport.connection.remove_callback(self.event(event), callback_id)
