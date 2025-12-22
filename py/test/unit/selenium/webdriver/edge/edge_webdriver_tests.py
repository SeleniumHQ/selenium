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

"""Unit tests for EdgeDriver ClientConfig support."""

from unittest.mock import Mock, patch

import pytest

from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.webdriver import WebDriver as EdgeDriver
from selenium.webdriver.remote.client_config import ClientConfig


@pytest.fixture
def mock_edge_service():
    """Mock EdgeService for testing."""
    service = Mock(spec=Service)
    service.service_url = "http://localhost:9515"
    return service


@pytest.fixture
def edge_options():
    """Create EdgeOptions for testing."""
    options = Options()
    return options


class TestEdgeDriverClientConfig:
    """Test cases for EdgeDriver ClientConfig support."""

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_edge_driver_accepts_client_config(
        self, mock_remote_connection, mock_finder, mock_edge_service, edge_options
    ):
        """Test that EdgeDriver accepts ClientConfig parameter."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/msedgedriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {"browserName": "msedge", "browserVersion": "91.0"},
            }
        }

        client_config = ClientConfig(
            remote_server_addr="http://localhost:9515",
            keep_alive=True,
            timeout=30,
        )

        with patch.object(mock_edge_service, "start"):
            driver = EdgeDriver(
                service=mock_edge_service,
                options=edge_options,
                client_config=client_config,
            )

            assert mock_remote_connection.called
            call_kwargs = mock_remote_connection.call_args[1]
            assert call_kwargs["client_config"].__dict__ == client_config.__dict__

            driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_edge_driver_passes_client_config_to_parent(
        self, mock_remote_connection, mock_finder, mock_edge_service, edge_options
    ):
        """Test that EdgeDriver properly passes ClientConfig to ChromiumDriver."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/msedgedriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {"browserName": "msedge", "browserVersion": "91.0"},
            }
        }

        client_config = ClientConfig(
            remote_server_addr="http://localhost:9515",
            keep_alive=True,
            timeout=45,
            user_agent="Edge/90.0",
        )

        with patch.object(mock_edge_service, "start"):
            driver = EdgeDriver(
                service=mock_edge_service,
                options=edge_options,
                client_config=client_config,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            actual_config = call_kwargs["client_config"]
            assert actual_config.remote_server_addr == "http://localhost:9515"
            assert actual_config.keep_alive is True
            assert actual_config.timeout == 45
            assert actual_config.user_agent == "Edge/90.0"

            driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_edge_driver_creates_default_client_config(
        self, mock_remote_connection, mock_finder, mock_edge_service, edge_options
    ):
        """Test that EdgeDriver creates default ClientConfig when not provided."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/msedgedriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {"browserName": "msedge", "browserVersion": "91.0"},
            }
        }

        with patch.object(mock_edge_service, "start"):
            driver = EdgeDriver(
                service=mock_edge_service,
                options=edge_options,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            client_config = call_kwargs["client_config"]
            assert isinstance(client_config, ClientConfig)
            assert client_config.remote_server_addr == mock_edge_service.service_url

            driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_edge_driver_ms_vendor_prefix_set(
        self, mock_remote_connection, mock_finder, mock_edge_service, edge_options
    ):
        """Test that Edge sets correct vendor prefix."""
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/msedgedriver"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {"browserName": "msedge", "browserVersion": "91.0"},
            }
        }

        with patch.object(mock_edge_service, "start"):
            driver = EdgeDriver(
                service=mock_edge_service,
                options=edge_options,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            assert call_kwargs["vendor_prefix"] == "ms"

            driver.quit()
