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


from selenium.webdriver.common.driver_finder import DriverFinder
from selenium.webdriver.common.utils import normalize_local_driver_config
from selenium.webdriver.ie.options import Options
from selenium.webdriver.ie.service import Service
from selenium.webdriver.remote.client_config import ClientConfig
from selenium.webdriver.remote.remote_connection import RemoteConnection
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver


class WebDriver(RemoteWebDriver):
    """Control the IEServerDriver and drive Internet Explorer."""

    def __init__(
        self,
        options: Options | None = None,
        service: Service | None = None,
        keep_alive: bool = True,
        client_config: Optional[ClientConfig] = None,
    ) -> None:
        """Creates a new instance of the Ie driver.

        Starts the service and then creates new instance of Ie driver.

        Args:
            options: IE Options instance, providing additional IE options
            service: (Optional) service instance for managing the starting and stopping of the driver.
            keep_alive: Whether to configure RemoteConnection to use HTTP keep-alive.
                This parameter is ignored if client_config is provided.
            client_config: ClientConfig instance for advanced HTTP/WebSocket configuration.
                If provided, takes precedence over individual parameters like keep_alive.

        Example:
            Basic usage::

                driver = webdriver.Ie()

            With custom config::

                from selenium.webdriver.remote.client_config import ClientConfig
                config = ClientConfig(websocket_timeout=10)
                driver = webdriver.Ie(client_config=config)
        """
        self.service = service if service else Service()
        options = options if options else Options()

        self.service.path = self.service.env_path() or DriverFinder(self.service, options).get_driver_path()
        self.service.start()

        client_config = normalize_local_driver_config(
            self.service.service_url, user_config=client_config, keep_alive=keep_alive, timeout=120
        )

        executor = RemoteConnection(
            ignore_proxy=options._ignore_local_proxy,
            client_config=client_config,
        )

        try:
            super().__init__(command_executor=executor, options=options)
        except Exception:
            self.quit()
            raise

        self._is_remote = False

    def quit(self) -> None:
        """Closes the browser and shuts down the IEServerDriver executable."""
        try:
            super().quit()
        except Exception:
            # We don't care about the message because something probably has gone wrong
            pass
        finally:
            self.service.stop()

    def download_file(self, *args, **kwargs):
        raise NotImplementedError

    def get_downloadable_files(self, *args, **kwargs):
        raise NotImplementedError

    def delete_downloadable_files(self, *args, **kwargs):
        raise NotImplementedError
