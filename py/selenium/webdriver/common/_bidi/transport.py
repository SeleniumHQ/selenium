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
type, and exposes the underlying connection for event subscription.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

from __future__ import annotations

from typing import Any

from selenium.common.exceptions import WebDriverException


class Transport:
    """Serializes params, sends over a websocket connection, parses the reply.

    Deliberately narrow: it holds only an immutable connection reference (the id
    counter and callbacks live on the shared ``WebSocketConnection``). Each domain
    wraps the session's connection in its own ``Transport``; all the state that
    matters lives on the shared connection, so those transports are equivalent.
    """

    def __init__(self, connection: Any) -> None:
        self._connection = connection

    @property
    def connection(self) -> Any:
        """The underlying websocket, for event subscription (which lives on it, not here)."""
        return self._connection

    def execute(self, cmd: str, params: Any = None, result: Any = None) -> Any:
        reply = self._connection.send_cmd(cmd, params.as_json() if params is not None else {})
        if reply.get("error"):
            message = reply.get("message")
            raise WebDriverException(f"{reply['error']}: {message}" if message else reply["error"])
        value = reply["result"]
        return result.from_json(value) if result is not None else value
