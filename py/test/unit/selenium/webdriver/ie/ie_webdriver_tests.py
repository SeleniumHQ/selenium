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

"""Unit tests for IE WebDriver ClientConfig support."""

from unittest.mock import Mock, patch

import pytest

from selenium.webdriver.ie.options import Options
from selenium.webdriver.ie.service import Service
from selenium.webdriver.ie.webdriver import WebDriver as IEDriver
from selenium.webdriver.remote.client_config import ClientConfig


@pytest.fixture
def mock_ie_service():
    """Mock IEServerDriver service for testing."""
    service = Mock(spec=Service)
    service.service_url = "http://localhost:5555"
    return service


@pytest.fixture
def ie_options():
    """Create IEOptions for testing."""
    options = Options()
    return options


class TestIEDriverClientConfig:
    """Test cases for IE Driver ClientConfig support."""

    @patch("selenium.webdriver.ie.webdriver.DriverFinder")
    @patch("selenium.webdriver.ie.webdriver.RemoteConnection")
    def test_ie_driver_accepts_client_config(
        self, mock_remote_connection, mock_finder, mock_ie_service, ie_options
    ):
        """Test that IE Driver accepts ClientConfig parameter."""
        mock_finder.return_value.get_driver_path.return_value = "/path/to/IEDriverServer"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {
                    "browserName": "internet explorer",
                    "browserVersion": "11.0"
                }
            }
        }

        client_config = ClientConfig(
            remote_server_addr="http://localhost:5555",
            keep_alive=True,
            timeout=30,
        )

        with patch.object(mock_ie_service, "start"):
            driver = IEDriver(
                service=mock_ie_service,
                options=ie_options,
                client_config=client_config,
            )

            assert mock_remote_connection.called
            call_kwargs = mock_remote_connection.call_args[1]
            assert call_kwargs["client_config"].__dict__ == client_config.__dict__

            driver.quit()

    @patch("selenium.webdriver.ie.webdriver.DriverFinder")
    @patch("selenium.webdriver.ie.webdriver.RemoteConnection")
    def test_ie_driver_passes_client_config(
        self, mock_remote_connection, mock_finder, mock_ie_service, ie_options
    ):
        """Test that IE Driver properly passes ClientConfig to RemoteConnection."""
        mock_finder.return_value.get_driver_path.return_value = "/path/to/IEDriverServer"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {
                    "browserName": "internet explorer",
                    "browserVersion": "11.0"
                }
            }
        }

        client_config = ClientConfig(
            remote_server_addr="http://localhost:5555",
            keep_alive=False,
            timeout=60,
            ignore_certificates=True,
        )

        with patch.object(mock_ie_service, "start"):
            driver = IEDriver(
                service=mock_ie_service,
                options=ie_options,
                client_config=client_config,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            actual_config = call_kwargs["client_config"]
            assert actual_config.remote_server_addr == "http://localhost:5555"
            assert actual_config.keep_alive is False
            assert actual_config.timeout == 60
            assert actual_config.ignore_certificates is True

            driver.quit()

    @patch("selenium.webdriver.ie.webdriver.DriverFinder")
    @patch("selenium.webdriver.ie.webdriver.RemoteConnection")
    def test_ie_driver_creates_default_client_config(
        self, mock_remote_connection, mock_finder, mock_ie_service, ie_options
    ):
        """Test that IE Driver creates default ClientConfig when not provided."""
        mock_finder.return_value.get_driver_path.return_value = "/path/to/IEDriverServer"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {
                    "browserName": "internet explorer",
                    "browserVersion": "11.0"
                }
            }
        }

        with patch.object(mock_ie_service, "start"):
            driver = IEDriver(
                service=mock_ie_service,
                options=ie_options,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            client_config = call_kwargs["client_config"]
            assert isinstance(client_config, ClientConfig)
            assert client_config.remote_server_addr == mock_ie_service.service_url

            driver.quit()

    @patch("selenium.webdriver.ie.webdriver.DriverFinder")
    @patch("selenium.webdriver.ie.webdriver.RemoteConnection")
    def test_ie_driver_normalizes_remote_server_addr_from_service(
        self, mock_remote_connection, mock_finder, mock_ie_service, ie_options
    ):
        """Test that IE Driver normalizes remote_server_addr from service URL."""
        mock_finder.return_value.get_driver_path.return_value = "/path/to/IEDriverServer"

        mock_remote_connection.return_value.execute.return_value = {
            "value": {
                "sessionId": "test-session-id",
                "capabilities": {
                    "browserName": "internet explorer",
                    "browserVersion": "11.0"
                }
            }
        }

        client_config = ClientConfig(
            keep_alive=True,
            timeout=30,
            remote_server_addr=None,
        )

        with patch.object(mock_ie_service, "start"):
            driver = IEDriver(
                service=mock_ie_service,
                options=ie_options,
                client_config=client_config,
            )

            call_kwargs = mock_remote_connection.call_args[1]
            actual_config = call_kwargs["client_config"]
            assert actual_config.remote_server_addr == mock_ie_service.service_url

            driver.quit()
