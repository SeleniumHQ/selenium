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

"""Unit tests for FirefoxDriver ClientConfig support."""

from unittest.mock import Mock, patch

import pytest

from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.webdriver import WebDriver as FirefoxDriver
from selenium.webdriver.remote.client_config import ClientConfig


@pytest.fixture
def mock_firefox_service():
    """Mock FirefoxService for testing."""
    service = Mock(spec=Service)
    service.service_url = "http://localhost:4444"
    return service


@pytest.fixture
def firefox_options():
    """Create FirefoxOptions for testing."""
    options = Options()
    return options


class TestFirefoxDriverClientConfig:
    """Test cases for FirefoxDriver ClientConfig support."""

    @patch("selenium.webdriver.firefox.webdriver.DriverFinder")
    @patch("selenium.webdriver.firefox.webdriver.FirefoxRemoteConnection")
    def test_firefox_driver_accepts_client_config(
        self, mock_remote_connection, mock_finder, mock_firefox_service, firefox_options
    ):
        """Test that FirefoxDriver accepts ClientConfig parameter."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/geckodriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {"browserName": "firefox", "browserVersion": "91.0"},
            }
        }

        client_config = ClientConfig(
            remote_server_addr="http://localhost:4444",
            keep_alive=True,
            timeout=30,
        )

        with patch.object(mock_firefox_service, "start"):
            driver = FirefoxDriver(
                service=mock_firefox_service,
                options=firefox_options,
                client_config=client_config,
            )

            assert mock_remote_connection.called
            call_kwargs = mock_remote_connection.call_args[1]
            assert call_kwargs["client_config"].__dict__ == client_config.__dict__

            driver.quit()

    @patch("selenium.webdriver.firefox.webdriver.DriverFinder")
    @patch("selenium.webdriver.firefox.webdriver.FirefoxRemoteConnection")
    def test_firefox_driver_passes_client_config(
        self, mock_remote_connection, mock_finder, mock_firefox_service, firefox_options
    ):
        """Test that FirefoxDriver properly passes ClientConfig to connection."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/geckodriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {"browserName": "firefox", "browserVersion": "91.0"},
            }
        }

        client_config = ClientConfig(
            remote_server_addr="http://localhost:4444",
            keep_alive=False,
            timeout=60,
            websocket_timeout=20,
        )

        with patch.object(mock_firefox_service, "start"):
            driver = FirefoxDriver(
                service=mock_firefox_service,
                options=firefox_options,
                client_config=client_config,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            assert call_kwargs["client_config"].__dict__ == client_config.__dict__

            driver.quit()

    @patch("selenium.webdriver.firefox.webdriver.DriverFinder")
    @patch("selenium.webdriver.firefox.webdriver.FirefoxRemoteConnection")
    def test_firefox_driver_creates_default_client_config(
        self, mock_remote_connection, mock_finder, mock_firefox_service, firefox_options
    ):
        """Test that FirefoxDriver creates default ClientConfig when not provided."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/geckodriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {"browserName": "firefox", "browserVersion": "91.0"},
            }
        }

        with patch.object(mock_firefox_service, "start"):
            driver = FirefoxDriver(
                service=mock_firefox_service,
                options=firefox_options,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            client_config = call_kwargs["client_config"]
            assert isinstance(client_config, ClientConfig)
            assert client_config.remote_server_addr == mock_firefox_service.service_url

            driver.quit()

    @patch("selenium.webdriver.firefox.webdriver.DriverFinder")
    @patch("selenium.webdriver.firefox.webdriver.FirefoxRemoteConnection")
    def test_firefox_driver_normalizes_remote_server_addr_from_service(
        self, mock_remote_connection, mock_finder, mock_firefox_service, firefox_options
    ):
        """Test that FirefoxDriver normalizes remote_server_addr from service URL."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/geckodriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {"browserName": "firefox", "browserVersion": "91.0"},
            }
        }

        client_config = ClientConfig(
            keep_alive=True,
            timeout=30,
        )

        with patch.object(mock_firefox_service, "start"):
            driver = FirefoxDriver(
                service=mock_firefox_service,
                options=firefox_options,
                client_config=client_config,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            actual_config = call_kwargs["client_config"]
            assert actual_config.remote_server_addr == mock_firefox_service.service_url

            driver.quit()
