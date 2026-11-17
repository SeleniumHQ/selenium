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

from collections.abc import Callable
from typing import Any

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.transport import Transport


class Domain:
    """Base for every generated domain module.

    ``source`` is a ``WebDriver`` — whose BiDi connection this domain wraps in its
    own :class:`Transport` (the driver starts BiDi if it hasn't already) — or a
    :class:`Transport` for the standalone path.
    """

    EVENT_TYPES: dict[str, type | None] = {}

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

    def add_listener(self, event: str, listener: Callable[[Any], Any], *, concurrent: bool = False) -> str:
        """Invoke ``listener`` with each typed payload of ``event``, a wire name such as ``"log.entryAdded"``.

        Internal, unsupported. Sends nothing: payloads arrive once the caller subscribes with
        ``Session.subscribe``. By default the listener gets one payload at a time in arrival order; with
        ``concurrent=True`` each payload is invoked as it arrives, without waiting for earlier ones.
        Returns the id to pass to ``remove_listener``.
        """
        if event not in self.EVENT_TYPES:
            raise ValueError(f"{type(self).__name__} has no event {event!r}")
        return self._transport.add_listener(event, self.EVENT_TYPES[event], listener, concurrent=concurrent)

    def remove_listener(self, listener_id: str, *, drain: bool = False) -> None:
        """Stop invoking the listener that ``listener_id`` names.

        Internal, unsupported. Local only: the subscription feeding it is left to the caller. A running
        invocation finishes either way. By default payloads not yet started are discarded and this returns at
        once, so a listener may remove itself; with ``drain=True`` every payload received before the call is
        invoked and this waits for them to finish. Removing an unknown or removed id does nothing.
        """
        self._transport.remove_listener(listener_id, drain=drain)
