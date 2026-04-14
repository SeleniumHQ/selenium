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

"""WebDriver BiDi Permissions module."""

from __future__ import annotations

from enum import Enum
from typing import Any

from selenium.webdriver.common.bidi.common import command_builder

_VALID_PERMISSION_STATES = {"granted", "denied", "prompt"}


class PermissionState(str, Enum):
    """Permission state enumeration."""

    GRANTED = "granted"
    DENIED = "denied"
    PROMPT = "prompt"


class PermissionDescriptor:
    """Descriptor for a permission."""

    def __init__(self, name: str) -> None:
        """Initialize a PermissionDescriptor.

        Args:
            name: The name of the permission (e.g., 'geolocation', 'microphone', 'camera')
        """
        self.name = name

    def __repr__(self) -> str:
        return f"PermissionDescriptor('{self.name}')"


class Permissions:
    """WebDriver BiDi Permissions module."""

    def __init__(self, websocket_connection: Any) -> None:
        """Initialize the Permissions module.

        Args:
            websocket_connection: The WebSocket connection for sending BiDi commands
        """
        self._conn = websocket_connection

    def set_permission(
        self,
        descriptor: PermissionDescriptor | str,
        state: PermissionState | str,
        origin: str | None = None,
        user_context: str | None = None,
    ) -> None:
        """Set a permission for a given origin.

        Args:
            descriptor: The permission descriptor or permission name as a string
            state: The desired permission state
            origin: The origin for which to set the permission
            user_context: Optional user context ID to scope the permission

        Raises:
            ValueError: If the state is not a valid permission state
        """
        state_value = state.value if isinstance(state, PermissionState) else state
        if state_value not in _VALID_PERMISSION_STATES:
            raise ValueError(
                f"Invalid permission state: {state_value!r}. Must be one of {sorted(_VALID_PERMISSION_STATES)}"
            )

        if isinstance(descriptor, str):
            descriptor_dict = {"name": descriptor}
        else:
            descriptor_dict = {"name": descriptor.name}

        params: dict[str, Any] = {
            "descriptor": descriptor_dict,
            "state": state_value,
        }
        if origin is not None:
            params["origin"] = origin
        if user_context is not None:
            params["userContext"] = user_context

        cmd = command_builder("permissions.setPermission", params)
        self._conn.execute(cmd)
