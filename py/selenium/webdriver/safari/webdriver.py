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

from typing import Optional

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.driver_finder import DriverFinder
from selenium.webdriver.remote.client_config import ClientConfig
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from selenium.webdriver.safari.options import Options
from selenium.webdriver.safari.remote_connection import SafariRemoteConnection
from selenium.webdriver.safari.service import Service


class WebDriver(RemoteWebDriver):
    """Controls the SafariDriver and allows you to drive the browser."""

    def __init__(
        self,
        keep_alive: bool = True,
        options: Optional[Options] = None,
        service: Optional[Service] = None,
        client_config: Optional[ClientConfig] = None,
    ) -> None:
        """Create a new Safari driver instance and launch or find a running safaridriver service.

        Args:
            keep_alive: Whether to configure SafariRemoteConnection to use
                HTTP keep-alive. Defaults to True.
                This parameter is ignored if client_config is provided.
            options: Instance of ``options.Options``.
            service: Service object for handling the browser driver if you need to pass extra details
            client_config: ClientConfig instance for advanced HTTP/WebSocket configuration.
                If provided, takes precedence over individual parameters like keep_alive.

        Example:
            Basic usage::

                driver = webdriver.Safari()

            With custom config::

                from selenium.webdriver.remote.client_config import ClientConfig
                config = ClientConfig(websocket_timeout=10)
                driver = webdriver.Safari(client_config=config)
        """
        self.service = service if service else Service()
        options = options if options else Options()

        self.service.path = self.service.env_path() or DriverFinder(self.service, options).get_driver_path()

        if not self.service.reuse_service:
            self.service.start()

        # If client_config is provided, use it; otherwise create from individual parameters
        if client_config is None:
            client_config = ClientConfig(
                remote_server_addr=self.service.service_url,
                keep_alive=keep_alive,
                timeout=120,
            )
        else:
            # If client_config is provided without remote_server_addr, set it
            if client_config.remote_server_addr is None:
                client_config = ClientConfig(
                    remote_server_addr=self.service.service_url,
                    keep_alive=client_config.keep_alive,
                    proxy=client_config.proxy,
                    ignore_certificates=client_config.ignore_certificates,
                    timeout=client_config.timeout,
                    ca_certs=client_config.ca_certs,
                    username=client_config.username,
                    password=client_config.password,
                    auth_type=client_config.auth_type,
                    token=client_config.token,
                    user_agent=client_config.user_agent,
                    extra_headers=client_config.extra_headers,
                    websocket_timeout=client_config.websocket_timeout,
                    websocket_interval=client_config.websocket_interval,
                )

        executor = SafariRemoteConnection(
            remote_server_addr=self.service.service_url,
            keep_alive=keep_alive,
            ignore_proxy=options._ignore_local_proxy,
            client_config=client_config,
        )

        try:
            super().__init__(command_executor=executor, options=options)
        except Exception:
            self.quit()
            raise

        self._is_remote = False

    def quit(self):
        """Closes the browser and shuts down the SafariDriver executable."""
        try:
            super().quit()
        except Exception:
            # We don't care about the message because something probably has gone wrong
            pass
        finally:
            if not self.service.reuse_service:
                self.service.stop()

    # safaridriver extension commands. The canonical command support matrix is here:
    # https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/WebDriverEndpointDoc/Commands/Commands.html

    # First available in Safari 11.1 and Safari Technology Preview 41.
    def set_permission(self, permission, value):
        if not isinstance(value, bool):
            raise WebDriverException("Value of a session permission must be set to True or False.")

        payload = {permission: value}
        self.execute("SET_PERMISSIONS", {"permissions": payload})

    # First available in Safari 11.1 and Safari Technology Preview 41.
    def get_permission(self, permission):
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
    def debug(self):
        self.execute("ATTACH_DEBUGGER")
        self.execute_script("debugger;")

    def download_file(self, *args, **kwargs):
        raise NotImplementedError

    def get_downloadable_files(self, *args, **kwargs):
        raise NotImplementedError

    def delete_downloadable_files(self, *args, **kwargs):
        raise NotImplementedError
