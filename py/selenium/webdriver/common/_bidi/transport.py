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

"""The command seam between the generated BiDi protocol layer and the websocket.

Hand-written (not generated). :class:`Transport` serializes a command's params,
sends them over the session websocket, parses the reply into its declared result
type, and relays event listeners to the connection's dispatcher, which stores them.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

from __future__ import annotations

from collections.abc import Callable
from typing import TYPE_CHECKING, Any

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.errors import exception_for

if TYPE_CHECKING:
    from selenium.webdriver.common._bidi.dispatcher import EventDispatcher
    from selenium.webdriver.common._bidi.session import SubscribeResult


class Transport:
    """Serializes params, sends over a websocket connection, parses the reply.

    Deliberately narrow: it holds only an immutable connection reference (the id
    counter lives on the shared ``WebSocketConnection``, and event listeners on the
    dispatcher attached to it). Each domain wraps the session's connection in its
    own ``Transport``; all the state that matters lives on the shared connection,
    so those transports are equivalent.
    """

    def __init__(self, connection: Any) -> None:
        self._connection = connection

    @property
    def connection(self) -> Any:
        """The websocket connection this transport sends over."""
        return self._connection

    def execute(self, cmd: str, params: Any = None, result: Any = None) -> Any:
        reply = self._connection.send_cmd(cmd, params.as_json() if params is not None else {})
        if "error" in reply:
            raise self._error(reply)
        value = reply["result"]
        return result.from_json(value) if result is not None else value

    def add_listener(
        self,
        event: str,
        payload_type: type | None,
        listener: Callable[[Any], Any],
        browsing_context: str | None = None,
        user_context: str | None = None,
    ) -> SubscribeResult:
        """Subscribe ``listener`` to the ``payload_type`` payloads of ``event`` through the connection's dispatcher."""
        return self._dispatcher().add_listener(event, payload_type, listener, browsing_context, user_context)

    def remove_listener(self, subscription: SubscribeResult) -> None:
        self._dispatcher().remove_listener(subscription)

    def _dispatcher(self) -> EventDispatcher:
        dispatcher = getattr(self._connection, "event_receiver", None)
        if dispatcher is None:
            raise WebDriverException("This BiDi connection has no event dispatcher")
        return dispatcher

    @staticmethod
    def _error(reply: dict) -> Exception:
        code = reply["error"]
        # The class carries the code, so the message need not repeat it — except where the
        # remote sent no message, which would otherwise leave nothing to read.
        message = reply.get("message") or code
        stacktrace = reply.get("stacktrace")
        return exception_for(code)(message, stacktrace=stacktrace.split("\n") if stacktrace else None)
