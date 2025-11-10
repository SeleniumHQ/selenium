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

"""Unit tests for ChromeDriver ClientConfig support."""

from unittest.mock import Mock, patch

import pytest

from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.webdriver import WebDriver as ChromeDriver
from selenium.webdriver.remote.client_config import ClientConfig


@pytest.fixture
def mock_chrome_service():
    """Mock ChromeService for testing."""
    service = Mock(spec=Service)
    service.service_url = "http://localhost:9515"
    return service


@pytest.fixture
def chrome_options():
    """Create ChromeOptions for testing."""
    options = Options()
    return options


class TestChromeDriverClientConfig:
    """Test cases for ChromeDriver ClientConfig support."""

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_chrome_driver_accepts_client_config(
        self, mock_remote_connection, mock_finder, mock_chrome_service, chrome_options
    ):
        """Test that ChromeDriver accepts ClientConfig parameter."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/chromedriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {
                    "browserName": "chrome",
                    "browserVersion": "91.0"
                }
            }
        }

        client_config = ClientConfig(
            remote_server_addr="http://localhost:9515",
            keep_alive=True,
            timeout=30,
        )

        with patch.object(mock_chrome_service, "start"):
            driver = ChromeDriver(
                service=mock_chrome_service,
                options=chrome_options,
                client_config=client_config,
            )

            assert mock_remote_connection.called
            call_kwargs = mock_remote_connection.call_args[1]
            actual_config = call_kwargs["client_config"]
            assert isinstance(actual_config, ClientConfig)
            assert actual_config.remote_server_addr == "http://localhost:9515"
            assert actual_config.keep_alive is True
            assert actual_config.timeout == 30

            driver.quit()


    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_chrome_driver_passes_client_config_to_parent(
        self, mock_remote_connection, mock_finder, mock_chrome_service, chrome_options
    ):
        """Test that ChromeDriver properly passes ClientConfig to ChromiumDriver."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/chromedriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {
                    "browserName": "chrome",
                    "browserVersion": "91.0"
                }
            }
        }

        client_config = ClientConfig(
            remote_server_addr="http://localhost:9515",
            keep_alive=True,
            timeout=45,
            user_agent="Chrome/90.0",
        )

        with patch.object(mock_chrome_service, "start"):
            driver = ChromeDriver(
                service=mock_chrome_service,
                options=chrome_options,
                client_config=client_config,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            actual_config = call_kwargs["client_config"]
            assert actual_config.remote_server_addr == "http://localhost:9515"
            assert actual_config.keep_alive is True
            assert actual_config.timeout == 45
            assert actual_config.user_agent == "Chrome/90.0"

            driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_chrome_driver_creates_default_client_config(
        self, mock_remote_connection, mock_finder, mock_chrome_service, chrome_options
    ):
        """Test that ChromeDriver creates default ClientConfig when not provided."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/chromedriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {
                    "browserName": "chrome",
                    "browserVersion": "91.0"
                }
            }
        }

        with patch.object(mock_chrome_service, "start"):
            driver = ChromeDriver(
                service=mock_chrome_service,
                options=chrome_options,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            client_config = call_kwargs["client_config"]
            assert isinstance(client_config, ClientConfig)
            assert client_config.remote_server_addr == mock_chrome_service.service_url

            driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_chrome_driver_goog_vendor_prefix_set(
        self, mock_remote_connection, mock_finder, mock_chrome_service, chrome_options
    ):
        """Test that Chrome sets correct vendor prefix."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/chromedriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {
                    "browserName": "chrome",
                    "browserVersion": "91.0"
                }
            }
        }

        with patch.object(mock_chrome_service, "start"):
            driver = ChromeDriver(
                service=mock_chrome_service,
                options=chrome_options,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            assert call_kwargs["vendor_prefix"] == "goog"

            driver.quit()
