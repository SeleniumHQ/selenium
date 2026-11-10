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
from typing import TYPE_CHECKING, Any

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.transport import Transport

if TYPE_CHECKING:
    from selenium.webdriver.common._bidi.session import SubscribeResult


class Domain:
    """Base for every generated domain module.

    ``source`` is a ``WebDriver`` — whose BiDi connection this domain wraps in its
    own :class:`Transport` (the driver starts BiDi if it hasn't already) — or a
    :class:`Transport` for the standalone path.
    """

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

    def remove_listener(self, subscription: SubscribeResult) -> None:
        """Unsubscribe and drop the listener an ``add_<event>_listener`` method registered (internal, unsupported).

        ``subscription`` is that method's result. The listener gets no further payload once this is
        called, even if the remote end refuses the unsubscribe, which raises. Removing it twice raises
        because the remote end rejects an unknown subscription id.
        """
        self._transport.remove_listener(subscription)

    def _add_listener(
        self,
        event: str,
        listener: Callable[[Any], Any],
        browsing_context: str | None,
        user_context: str | None,
    ) -> SubscribeResult:
        return self._transport.add_listener(event, self.EVENT_TYPES[event], listener, browsing_context, user_context)
