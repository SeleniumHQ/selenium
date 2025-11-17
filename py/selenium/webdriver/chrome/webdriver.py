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


from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chromium.webdriver import ChromiumDriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.remote.client_config import ClientConfig


class WebDriver(ChromiumDriver):
    """Controls the ChromeDriver and allows you to drive the browser."""

    def __init__(
        self,
        options: Options | None = None,
        service: Service | None = None,
        keep_alive: bool = True,
        client_config: Optional[ClientConfig] = None,
    ) -> None:
        """Creates a new instance of the chrome driver.

        Starts the service and then creates new instance of chrome driver.

        Args:
            options: This takes an instance of ChromeOptions.
            service: Service object for handling the browser driver if you need to pass extra details.
            keep_alive: Whether to configure ChromeRemoteConnection to use HTTP keep-alive.
                This parameter is ignored if client_config is provided.
            client_config: ClientConfig instance for advanced HTTP/WebSocket configuration.
                If provided, takes precedence over individual parameters like keep_alive.

        Example:
            Basic usage::

                driver = webdriver.Chrome()

            With custom config::

                from selenium.webdriver.remote.client_config import ClientConfig
                config = ClientConfig(
                    remote_server_addr="http://localhost:9515",
                    websocket_timeout=10
                )
                driver = webdriver.Chrome(client_config=config)
        """
        service = service if service else Service()
        options = options if options else Options()

        super().__init__(
            browser_name=DesiredCapabilities.CHROME["browserName"],
            vendor_prefix="goog",
            options=options,
            service=service,
            keep_alive=keep_alive,
            client_config=client_config,
        )
