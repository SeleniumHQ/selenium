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


from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from selenium.webdriver.common.bidi.common import command_builder


def transform_download_params(
    allowed: bool | None,
    destination_folder: str | None,
) -> dict[str, Any] | None:
    """Transform download parameters into download_behavior object.

    Args:
        allowed: Whether downloads are allowed
        destination_folder: Destination folder for downloads (accepts str or
            pathlib.Path; will be coerced to str)

    Returns:
        Dictionary representing the download_behavior object, or None if allowed is None
    """
    if allowed is True:
        return {
            "type": "allowed",
            # Coerce pathlib.Path (or any path-like) to str so the BiDi
            # protocol always receives a plain JSON string.
            "destinationFolder": str(destination_folder) if destination_folder is not None else None,
        }
    elif allowed is False:
        return {"type": "denied"}
    else:  # None — reset to browser default (sent as JSON null)
        return None


def validate_download_behavior(
    allowed: bool | None,
    destination_folder: str | None,
    user_contexts: Any | None = None,
) -> None:
    """Validate download behavior parameters.

    Args:
        allowed: Whether downloads are allowed
        destination_folder: Destination folder for downloads
        user_contexts: Optional list of user contexts

    Raises:
        ValueError: If parameters are invalid
    """
    if allowed is True and not destination_folder:
        raise ValueError("destination_folder is required when allowed=True")
    if allowed is False and destination_folder:
        raise ValueError("destination_folder should not be provided when allowed=False")


@dataclass
class ClientWindowInfo:
    """ClientWindowInfo."""

    active: bool | None = None
    client_window: Any | None = None
    height: Any | None = None
    state: Any | None = None
    width: Any | None = None
    x: Any | None = None
    y: Any | None = None

    def get_client_window(self):
        """Get the client window ID."""
        return self.client_window

    def get_state(self):
        """Get the client window state."""
        return self.state

    def get_width(self):
        """Get the client window width."""
        return self.width

    def get_height(self):
        """Get the client window height."""
        return self.height

    def is_active(self):
        """Check if the client window is active."""
        return self.active

    def get_x(self):
        """Get the client window X position."""
        return self.x

    def get_y(self):
        """Get the client window Y position."""
        return self.y


@dataclass
class UserContextInfo:
    """UserContextInfo."""

    user_context: Any | None = None


@dataclass
class CreateUserContextParameters:
    """CreateUserContextParameters."""

    accept_insecure_certs: bool | None = None
    proxy: Any | None = None
    unhandled_prompt_behavior: Any | None = None


@dataclass
class GetClientWindowsResult:
    """GetClientWindowsResult."""

    client_windows: list[Any] = field(default_factory=list)


@dataclass
class GetUserContextsResult:
    """GetUserContextsResult."""

    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class RemoveUserContextParameters:
    """RemoveUserContextParameters."""

    user_context: Any | None = None


@dataclass
class ClientWindowRectState:
    """ClientWindowRectState."""

    state: str = field(default="normal", init=False)
    width: Any | None = None
    height: Any | None = None
    x: Any | None = None
    y: Any | None = None


@dataclass
class SetDownloadBehaviorParameters:
    """SetDownloadBehaviorParameters."""

    download_behavior: Any | None = None
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class DownloadBehaviorAllowed:
    """DownloadBehaviorAllowed."""

    type: str = field(default="allowed", init=False)
    destination_folder: str | None = None


@dataclass
class DownloadBehaviorDenied:
    """DownloadBehaviorDenied."""

    type: str = field(default="denied", init=False)


class ClientWindowNamedState:
    """Named states for a browser client window."""

    FULLSCREEN = "fullscreen"
    MAXIMIZED = "maximized"
    MINIMIZED = "minimized"
    NORMAL = "normal"


@dataclass
class SetClientWindowStateParameters:
    """SetClientWindowStateParameters.

    The ``state`` field is required and must be either a named-state string
    (e.g. ``ClientWindowNamedState.MAXIMIZED``) or a
    :class:`ClientWindowRectState` instance.  ``client_window`` is the ID of
    the window to affect.
    """

    client_window: Any | None = None
    state: Any | None = None


class Browser:
    """WebDriver BiDi browser module."""

    def __init__(self, conn) -> None:
        self._conn = conn

    def close(self):
        """Execute browser.close."""
        params = {}
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browser.close", params)
        result = self._conn.execute(cmd)
        return result

    def create_user_context(
        self,
        accept_insecure_certs: bool | None = None,
        proxy: Any | None = None,
        unhandled_prompt_behavior: Any | None = None,
    ):
        """Execute browser.createUserContext."""
        if proxy and hasattr(proxy, "to_bidi_dict"):
            proxy = proxy.to_bidi_dict()

        if unhandled_prompt_behavior and hasattr(unhandled_prompt_behavior, "to_bidi_dict"):
            unhandled_prompt_behavior = unhandled_prompt_behavior.to_bidi_dict()

        params = {
            "acceptInsecureCerts": accept_insecure_certs,
            "proxy": proxy,
            "unhandledPromptBehavior": unhandled_prompt_behavior,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browser.createUserContext", params)
        result = self._conn.execute(cmd)
        if result and "userContext" in result:
            extracted = result.get("userContext")
            return extracted
        return result

    def get_client_windows(self):
        """Execute browser.getClientWindows."""
        params = {}
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browser.getClientWindows", params)
        result = self._conn.execute(cmd)
        if result and "clientWindows" in result:
            items = result.get("clientWindows", [])
            return [
                ClientWindowInfo(
                    active=item.get("active"),
                    client_window=item.get("clientWindow"),
                    height=item.get("height"),
                    state=item.get("state"),
                    width=item.get("width"),
                    x=item.get("x"),
                    y=item.get("y"),
                )
                for item in items
                if isinstance(item, dict)
            ]
        return []

    def get_user_contexts(self):
        """Execute browser.getUserContexts."""
        params = {}
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browser.getUserContexts", params)
        result = self._conn.execute(cmd)
        if result and "userContexts" in result:
            items = result.get("userContexts", [])
            return [item.get("userContext") for item in items if isinstance(item, dict)]
        return []

    def remove_user_context(self, user_context: Any | None = None):
        """Execute browser.removeUserContext."""
        if user_context is None:
            raise TypeError("remove_user_context() missing required argument: 'user_context'")

        params = {
            "userContext": user_context,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browser.removeUserContext", params)
        result = self._conn.execute(cmd)
        return result

    def set_download_behavior(
        self,
        allowed: bool | None = None,
        destination_folder: str | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Set the download behavior for the browser.

        Args:
            allowed: ``True`` to allow downloads, ``False`` to deny, or ``None``
                to reset to browser default (sends ``null`` to the protocol).
            destination_folder: Destination folder for downloads.  Required when
                ``allowed=True``.  Accepts a string or :class:`pathlib.Path`.
            user_contexts: Optional list of user context IDs.

        Raises:
            ValueError: If *allowed* is ``True`` and *destination_folder* is
                omitted, or ``False`` and *destination_folder* is provided.
        """
        validate_download_behavior(
            allowed=allowed,
            destination_folder=destination_folder,
            user_contexts=user_contexts,
        )
        download_behavior = transform_download_params(allowed, destination_folder)
        # downloadBehavior is a REQUIRED field in the BiDi spec (can be null but
        # must be present).  Do NOT use a generic None-filter on it.
        params: dict = {"downloadBehavior": download_behavior}
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        cmd = command_builder("browser.setDownloadBehavior", params)
        return self._conn.execute(cmd)

    def set_client_window_state(
        self,
        client_window: Any | None = None,
        state: Any | None = None,
    ):
        """Set the client window state.

        Args:
            client_window: The client window ID to apply the state to.
            state: The window state to set. Can be one of:
                - A string: "fullscreen", "maximized", "minimized", "normal"
                - A ClientWindowRectState object with width, height, x, y
                - A dict representing the state

        Raises:
            ValueError: If client_window is not provided or state is invalid.
        """
        if client_window is None:
            raise ValueError("client_window is required")
        if state is None:
            raise ValueError("state is required")

        # Serialize ClientWindowRectState if needed
        state_param = state
        if hasattr(state, "__dataclass_fields__"):
            # It's a dataclass, convert to dict
            state_param = {k: v for k, v in state.__dict__.items() if v is not None}

        params = {
            "clientWindow": client_window,
            "state": state_param,
        }
        cmd = command_builder("browser.setClientWindowState", params)
        return self._conn.execute(cmd)
