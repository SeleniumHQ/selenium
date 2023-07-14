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
import typing

from selenium.webdriver.common.driver_finder import DriverFinder
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver

from ..remote.client_config import ClientConfig
from .options import Options
from .service import Service


class WebDriver(RemoteWebDriver):
    """Controls the IEServerDriver and allows you to drive Internet
    Explorer."""

    def __init__(
        self,
        options: Options = None,
        service: Service = None,
        keep_alive: typing.Optional[bool] = None,
        client_config: typing.Optional[ClientConfig] = None,
    ) -> None:
        """Creates a new instance of the Ie driver.

        Starts the service and then creates new instance of Ie driver.

        :Args:
         - options - (Optional) IE Options instance, providing additional IE options
         - service - (Optional) service instance for managing the starting and stopping of the driver.
         - keep_alive - Deprecated: Whether to configure RemoteConnection to use HTTP keep-alive.
         - client_config - configuration values for the http client
        """

        self.service = service if service else Service()
        options = options if options else Options()

        self.service.path = DriverFinder.get_path(self.service, options)
        self.service.start()

        try:
            super().__init__(
                command_executor=self.service.service_url,
                options=options,
                keep_alive=keep_alive,
                client_config=client_config,
            )
        except Exception:
            self.quit()
            raise

        self._is_remote = False

    def quit(self):
        """Ends the driver session and shuts down the safaridriver executable if necessary."""
        try:
            super().quit()
        except Exception:
            # We don't care about the message because something probably has gone wrong
            pass
        finally:
            self.service.stop()
