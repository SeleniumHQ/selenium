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

import http.client as http_client
import typing

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from .options import Options
from .service import Service
from .remote_connection import SafariRemoteConnection


class WebDriver(RemoteWebDriver):
    """
    Starts an instance of the safari driver in a subprocess inline with the configuration supplied
    to the service argument and subsequently starts an instance of safari if required.
    """

    def __init__(
        self,
        keep_alive: bool = True,
        options: typing.Optional[Options] = None,
        service: typing.Optional[Service] = None,
    ):
        """
        :Args:
         - keep_alive - Boolean to allow the underlying connection to persist.
         - options : (Optional) Options instance for controlling the safari browser session.
         - service - (Optional) Service instance for controlling the safari driver sub process launching.
        """
        self.service = service or Service()
        self.service.start()
        safari_connection = SafariRemoteConnection(
            remote_server_addr=self.service.service_url, keep_alive=keep_alive
        )

        super().__init__(
            command_executor=safari_connection,
            options=options,
        )
        self._is_remote: bool = False

    def quit(self) -> None:
        """
        Closes the browser and shuts down the SafariDriver executable
        that is started when starting the SafariDriver
        """
        try:
            super().quit()
        except http_client.BadStatusLine:
            pass
        finally:
            self.service.stop()

    # safaridriver extension commands. The canonical command support matrix is here:
    # https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/WebDriverEndpointDoc/Commands/Commands.html

    # First available in Safari 11.1 and Safari Technology Preview 41.
    def set_permission(self, permission: str, value: bool) -> None:
        if not isinstance(value, bool):
            raise WebDriverException(
                "Value of a session permission must be set to True or False."
            )

        payload = {}
        payload[permission] = value
        self.execute("SET_PERMISSIONS", {"permissions": payload})

    # First available in Safari 11.1 and Safari Technology Preview 41.
    def get_permission(self, permission: str):
        payload = self.execute("GET_PERMISSIONS")["value"]
        permissions = payload["permissions"]
        if not permissions:
            return None

        if permission not in permissions:
            return None

        value = permissions[permission]
        if not isinstance(value, bool):
            return None

        return value

    # First available in Safari 11.1 and Safari Technology Preview 42.
    def debug(self) -> None:
        self.execute("ATTACH_DEBUGGER")
        self.execute_script("debugger;")
