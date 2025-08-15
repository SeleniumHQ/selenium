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

import warnings
from typing import Optional

from selenium.webdriver.common.bidi.common import command_builder
from selenium.webdriver.common.proxy import Proxy


class ClientWindowState:
    """Represents a window state."""

    FULLSCREEN = "fullscreen"
    MAXIMIZED = "maximized"
    MINIMIZED = "minimized"
    NORMAL = "normal"

    VALID_STATES = {FULLSCREEN, MAXIMIZED, MINIMIZED, NORMAL}


class ClientWindowInfo:
    """Represents a client window information."""

    def __init__(
        self,
        client_window: str,
        state: str,
        width: int,
        height: int,
        x: int,
        y: int,
        active: bool,
    ):
        self.client_window = client_window
        self.state = state
        self.width = width
        self.height = height
        self.x = x
        self.y = y
        self.active = active

    def get_state(self) -> str:
        """Gets the state of the client window.

        Returns:
        -------
            str: The state of the client window (one of the ClientWindowState constants).
        """
        warnings.warn("get_state method is deprecated, use `state` property instead", DeprecationWarning, stacklevel=2)
        return self.state

    @property
    def state(self) -> str:
        """Gets the state of the client window.

        Returns:
        -------
            str: The state of the client window (one of the ClientWindowState constants).
        """
        return self._state

    @state.setter
    def state(self, value) -> None:
        """Sets the state of the client window.

        Returns: None
        """
        if not isinstance(value, str):
            raise ValueError("state must be a string")
        if value not in ClientWindowState.VALID_STATES:
            raise ValueError(f"Invalid state: {value}. Must be one of {ClientWindowState.VALID_STATES}")
        self._state = value

    def get_client_window(self) -> str:
        """Gets the client window identifier.

        Returns:
        -------
            str: The client window identifier.
        """
        warnings.warn(
            "get_client_window method is deprecated, use `client_window` property instead",
            DeprecationWarning,
            stacklevel=2,
        )
        return self.client_window

    @property
    def client_window(self) -> str:
        """Gets the client window identifier.

        Returns:
        -------
            str: The client window identifier.
        """
        return self._client_window

    @client_window.setter
    def client_window(self, value) -> None:
        """Sets the client window identifier.

        Returns: None
        """
        if not isinstance(value, str):
            raise ValueError("clientWindow must be a string")
        self._client_window = value

    def get_width(self) -> int:
        """Gets the width of the client window.

        Returns:
        -------
            int: The width of the client window.
        """
        warnings.warn("get_width method is deprecated, use `width` property instead", DeprecationWarning, stacklevel=2)
        return self.width

    @property
    def width(self) -> int:
        """Gets the width of the client window.

        Returns:
        -------
            int: The width of the client window.
        """
        return self._width

    @width.setter
    def width(self, value) -> None:
        """Sets the width of the client window.

        Returns: None
        """
        if not isinstance(value, int) or value < 0:
            raise ValueError(f"width must be a non-negative integer, got {value}")
        self._width = value

    def get_height(self) -> int:
        """Gets the height of the client window.

        Returns:
        -------
            int: The height of the client window.
        """
        warnings.warn(
            "get_height method is deprecated, use `height` property instead", DeprecationWarning, stacklevel=2
        )
        return self.height

    @property
    def height(self) -> int:
        """Gets the height of the client window.

        Returns:
        -------
            int: The height of the client window.
        """
        return self._height

    @height.setter
    def height(self, value) -> None:
        """Sets the height of the client window.

        Returns: None
        """
        if not isinstance(value, int) or value < 0:
            raise ValueError(f"height must be a non-negative integer, got {value}")
        self._height = value

    def get_x(self) -> int:
        """Gets the x coordinate of the client window.

        Returns:
        -------
            int: The x coordinate of the client window.
        """
        warnings.warn("get_x method is deprecated, use `x` property instead", DeprecationWarning, stacklevel=2)
        return self.x

    @property
    def x(self) -> int:
        """Gets the x coordinate of the client window.

        Returns:
        -------
            int: The x coordinate of the client window.
        """
        return self._x

    @x.setter
    def x(self, value) -> None:
        """Sets the x coordinate of the client window.

        Returns: None
        """
        if not isinstance(value, int):
            raise ValueError(f"x must be an integer, got {type(value).__name__}")
        self._x = value

    def get_y(self) -> int:
        """Gets the y coordinate of the client window.

        Returns:
        -------
            int: The y coordinate of the client window.
        """
        warnings.warn("get_y method is deprecated, use `y` property instead", DeprecationWarning, stacklevel=2)
        return self.y

    @property
    def y(self) -> int:
        """Gets the y coordinate of the client window.

        Returns:
        -------
            int: The y coordinate of the client window.
        """
        return self._y

    @y.setter
    def y(self, value) -> None:
        """Sets the y coordinate of the client window.

        Returns: None
        """
        if not isinstance(value, int):
            raise ValueError(f"y must be an integer, got {type(value).__name__}")
        self._y = value

    @property
    def active(self):
        """Gets the Window Status.

        Returns:
        -------
            bool: The boolen value of Window Status
        """
        return self._active

    @active.setter
    def active(self, value) -> None:
        """Sets the Window Status.

        Returns: None
        """
        if not isinstance(value, bool):
            raise ValueError("active must be a boolean")
        self._active = value

    def is_active(self) -> bool:
        """Checks if the client window is active.

        Returns:
        -------
            bool: True if the client window is active, False otherwise.
        """
        return self.active

    @classmethod
    def from_dict(cls, data: dict) -> "ClientWindowInfo":
        """Creates a ClientWindowInfo instance from a dictionary.

        Parameters:
        -----------
            data: A dictionary containing the client window information.

        Returns:
        -------
            ClientWindowInfo: A new instance of ClientWindowInfo.
        """
        return cls(
            client_window=data.get("clientWindow"),
            state=data.get("state"),
            width=data.get("width"),
            height=data.get("height"),
            x=data.get("x"),
            y=data.get("y"),
            active=data.get("active"),
        )


class Browser:
    """BiDi implementation of the browser module."""

    def __init__(self, conn):
        self.conn = conn

    def create_user_context(self, accept_insecure_certs: Optional[bool] = None, proxy: Optional[Proxy] = None) -> str:
        """Creates a new user context.

        Parameters:
        -----------
            accept_insecure_certs: Optional flag to accept insecure TLS certificates
            proxy: Optional proxy configuration for the user context

        Returns:
        -------
            str: The ID of the created user context.
        """
        params = {}

        if accept_insecure_certs is not None:
            params["acceptInsecureCerts"] = accept_insecure_certs

        if proxy is not None:
            params["proxy"] = proxy.to_bidi_dict()

        result = self.conn.execute(command_builder("browser.createUserContext", params))
        return result["userContext"]

    def get_user_contexts(self) -> list[str]:
        """Gets all user contexts.

        Returns:
        -------
            List[str]: A list of user context IDs.
        """
        result = self.conn.execute(command_builder("browser.getUserContexts", {}))
        return [context_info["userContext"] for context_info in result["userContexts"]]

    def remove_user_context(self, user_context_id: str) -> None:
        """Removes a user context.

        Parameters:
        -----------
            user_context_id: The ID of the user context to remove.

        Raises:
        ------
            Exception: If the user context ID is "default" or does not exist.
        """
        if user_context_id == "default":
            raise Exception("Cannot remove the default user context")

        params = {"userContext": user_context_id}
        self.conn.execute(command_builder("browser.removeUserContext", params))

    def get_client_windows(self) -> list[ClientWindowInfo]:
        """Gets all client windows.

        Returns:
        -------
            List[ClientWindowInfo]: A list of client window information.
        """
        result = self.conn.execute(command_builder("browser.getClientWindows", {}))
        return [ClientWindowInfo.from_dict(window) for window in result["clientWindows"]]
