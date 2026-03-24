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


class WebDriver(ChromiumDriver):
    """Controls the ChromeDriver and allows you to drive the browser."""

    def __init__(
        self,
        options: Options | None = None,
        service: Service | None = None,
        keep_alive: bool = True,
        # Backward compatibility parameters
        executable_path: str | None = None,
        port: int = 0,
        service_args: list[str] | None = None,
        desired_capabilities: dict | None = None,
        service_log_path: str | None = None,
        chrome_options: Options | None = None,
    ) -> None:
        """Creates a new instance of the chrome driver.

        Starts the service and then creates new instance of chrome driver.

        Args:
            options: Instance of Options.
            service: Service object for handling the browser driver if you need to pass extra details.
            keep_alive: Whether to configure ChromeRemoteConnection to use HTTP keep-alive.
            executable_path: Deprecated: Path to the ChromeDriver executable. Use service instead.
            port: Deprecated: Port to run the ChromeDriver on. Use service instead.
            service_args: Deprecated: List of args to pass to ChromeDriver. Use service instead.
            desired_capabilities: Deprecated: Dictionary of desired capabilities. Use options instead.
            service_log_path: Deprecated: Path to the log file. Use service instead.
            chrome_options: Deprecated: Alias for options. Use options instead.
        """
        # Handle deprecated chrome_options alias
        if chrome_options is not None:
            options = chrome_options

        # Handle deprecated desired_capabilities
        if desired_capabilities:
            if options is None:
                options = Options()
            options.set_capability("cloud:options", desired_capabilities)

        # Create service from deprecated parameters if provided
        if service is None:
            service = Service(
                executable_path=executable_path,
                port=port,
                service_args=service_args,
                log_output=service_log_path,
            )

        service = service if service else Service()
        options = options if options else Options()

        super().__init__(
            browser_name=DesiredCapabilities.CHROME["browserName"],
            vendor_prefix="goog",
            options=options,
            service=service,
            keep_alive=keep_alive,
        )
