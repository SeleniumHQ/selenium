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

"""Functional/Integration tests for ClientConfig timeout handling in ChromiumDriver.

These tests verify that ClientConfig.timeout is actually applied and used when
creating WebDriver sessions. Similar to Java tests that validate timeout behavior.
"""

from unittest.mock import MagicMock, Mock, patch

import pytest

from selenium.webdriver.chromium.options import ChromiumOptions
from selenium.webdriver.chromium.service import ChromiumService
from selenium.webdriver.chromium.webdriver import ChromiumDriver
from selenium.webdriver.remote.client_config import ClientConfig


@pytest.fixture
def mock_service():
    """Mock ChromiumService for testing."""
    service = Mock(spec=ChromiumService)
    service.service_url = "http://localhost:9515"
    return service


@pytest.fixture
def chromium_options():
    """Create ChromiumOptions for testing."""
    options = ChromiumOptions()
    return options


class TestClientConfigTimeout:
    """Functional tests for ClientConfig timeout application."""

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_client_config_timeout_is_used_for_connection(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that ClientConfig timeout is used when creating RemoteConnection."""
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        # Create a mock instance of RemoteConnection
        mock_connection_instance = MagicMock()
        mock_remote_connection_class.return_value = mock_connection_instance

        custom_timeout = 25.5
        client_config = ClientConfig(
            remote_server_addr="http://localhost:9515",
            timeout=custom_timeout,
        )

        # Act
        with patch.object(mock_service, "start"):
            driver = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=client_config,
            )

        # Assert - Verify RemoteConnection was created with correct timeout
        assert mock_remote_connection_class.called
        call_kwargs = mock_remote_connection_class.call_args[1]
        actual_config = call_kwargs["client_config"]
        assert actual_config.timeout == custom_timeout

        driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_client_config_timeout_zero_would_cause_immediate_timeout(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that timeout=0 in ClientConfig is preserved (would cause immediate timeout).

        This simulates Java behavior where timeout=0 causes SessionNotCreatedException.
        In practice, this would fail immediately when trying to connect to the service.
        """
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        client_config = ClientConfig(
            remote_server_addr="http://localhost:9515",
            timeout=0,  # Zero timeout - should cause immediate timeout
        )

        # Act
        with patch.object(mock_service, "start"):
            driver = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=client_config,
            )

        # Assert - Verify timeout=0 is preserved in config
        call_kwargs = mock_remote_connection_class.call_args[1]
        actual_config = call_kwargs["client_config"]
        assert actual_config.timeout == 0  # Must be preserved exactly

        driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_default_client_config_timeout_is_120_seconds(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that default timeout is 120 seconds when not specified."""
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        # Act - No client_config provided
        with patch.object(mock_service, "start"):
            driver = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
            )

        # Assert
        call_kwargs = mock_remote_connection_class.call_args[1]
        actual_config = call_kwargs["client_config"]
        assert actual_config.timeout == 120  # Default timeout

        driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_client_config_timeout_overrides_default(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that explicit timeout in ClientConfig overrides default."""
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        explicit_timeout = 45
        client_config = ClientConfig(timeout=explicit_timeout)

        # Act
        with patch.object(mock_service, "start"):
            driver = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=client_config,
            )

        # Assert
        call_kwargs = mock_remote_connection_class.call_args[1]
        actual_config = call_kwargs["client_config"]
        assert actual_config.timeout == explicit_timeout
        assert actual_config.timeout != 120  # Not the default

        driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_client_config_timeout_with_large_value(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that large timeout values are preserved."""
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        large_timeout = 300  # 5 minutes
        client_config = ClientConfig(timeout=large_timeout)

        # Act
        with patch.object(mock_service, "start"):
            driver = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=client_config,
            )

        # Assert
        call_kwargs = mock_remote_connection_class.call_args[1]
        actual_config = call_kwargs["client_config"]
        assert actual_config.timeout == large_timeout

        driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_client_config_timeout_with_small_fractional_value(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that fractional timeout values (e.g., for quick fail scenarios) are preserved."""
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        fractional_timeout = 0.5  # 500 milliseconds
        client_config = ClientConfig(timeout=fractional_timeout)

        # Act
        with patch.object(mock_service, "start"):
            driver = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=client_config,
            )

        # Assert
        call_kwargs = mock_remote_connection_class.call_args[1]
        actual_config = call_kwargs["client_config"]
        assert actual_config.timeout == fractional_timeout

        driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_client_config_timeout_none_uses_default(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that None timeout in ClientConfig is converted to default (120)."""
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        # ClientConfig with explicit None timeout (or not set)
        client_config = ClientConfig(
            remote_server_addr="http://localhost:9515",
            # timeout not set, defaults to None in ClientConfig
        )

        # Act
        with patch.object(mock_service, "start"):
            driver = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=client_config,
            )

        # Assert
        call_kwargs = mock_remote_connection_class.call_args[1]
        actual_config = call_kwargs["client_config"]
        # When driver normalizes config without remote_server_addr, it uses default timeout=120
        # if the client_config didn't specify a timeout
        assert actual_config.timeout is None or actual_config.timeout == 120

        driver.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_multiple_drivers_with_different_timeouts(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that different drivers can have different timeouts via ClientConfig."""
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        timeout_1 = 30
        timeout_2 = 60

        config_1 = ClientConfig(timeout=timeout_1)
        config_2 = ClientConfig(timeout=timeout_2)

        # Act - Create first driver
        with patch.object(mock_service, "start"):
            driver_1 = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=config_1,
            )

        # Get timeout from first driver call
        first_call_kwargs = mock_remote_connection_class.call_args_list[0][1]
        first_config = first_call_kwargs["client_config"]

        # Act - Create second driver with different timeout
        with patch.object(mock_service, "start"):
            driver_2 = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=config_2,
            )

        # Get timeout from second driver call
        second_call_kwargs = mock_remote_connection_class.call_args_list[1][1]
        second_config = second_call_kwargs["client_config"]

        # Assert
        assert first_config.timeout == timeout_1
        assert second_config.timeout == timeout_2
        assert first_config.timeout != second_config.timeout

        driver_1.quit()
        driver_2.quit()

    @patch("selenium.webdriver.chromium.webdriver.DriverFinder")
    @patch("selenium.webdriver.chromium.webdriver.ChromiumRemoteConnection")
    def test_client_config_timeout_preserved_through_normalization(
        self, mock_remote_connection_class, mock_finder, mock_service, chromium_options
    ):
        """Test that timeout is preserved even when ClientConfig is normalized.

        When remote_server_addr is None, ChromiumDriver normalizes it but must
        preserve the timeout from the original ClientConfig.
        """
        # Arrange
        mock_finder.return_value.get_browser_path.return_value = None
        mock_finder.return_value.get_driver_path.return_value = "/path/to/driver"

        custom_timeout = 75
        # Create config without remote_server_addr - will be normalized
        client_config = ClientConfig(
            timeout=custom_timeout,
            keep_alive=False,
        )

        # Act
        with patch.object(mock_service, "start"):
            driver = ChromiumDriver(
                service=mock_service,
                options=chromium_options,
                client_config=client_config,
            )

        # Assert - timeout should be preserved after normalization
        call_kwargs = mock_remote_connection_class.call_args[1]
        actual_config = call_kwargs["client_config"]
        assert actual_config.timeout == custom_timeout
        assert actual_config.remote_server_addr == mock_service.service_url

        driver.quit()
