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

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from selenium.webdriver.common.bidi._event_manager import EventConfig, _EventManager
from selenium.webdriver.common.bidi.common import command_builder


class PointerType:
    """PointerType."""

    MOUSE = "mouse"
    PEN = "pen"
    TOUCH = "touch"


class Origin:
    """Origin."""

    VIEWPORT = "viewport"
    POINTER = "pointer"


@dataclass
class ElementOrigin:
    """ElementOrigin."""

    type: str = field(default="element", init=False)
    element: Any | None = None


@dataclass
class PerformActionsParameters:
    """PerformActionsParameters."""

    context: Any | None = None
    actions: list[Any] = field(default_factory=list)


@dataclass
class NoneSourceActions:
    """NoneSourceActions."""

    type: str = field(default="none", init=False)
    id: str | None = None
    actions: list[Any] = field(default_factory=list)


@dataclass
class KeySourceActions:
    """KeySourceActions."""

    type: str = field(default="key", init=False)
    id: str | None = None
    actions: list[Any] = field(default_factory=list)


@dataclass
class PointerSourceActions:
    """PointerSourceActions."""

    type: str = field(default="pointer", init=False)
    id: str | None = None
    parameters: Any | None = None
    actions: list[Any] = field(default_factory=list)


@dataclass
class PointerParameters:
    """PointerParameters."""

    pointer_type: Any | None = None


@dataclass
class WheelSourceActions:
    """WheelSourceActions."""

    type: str = field(default="wheel", init=False)
    id: str | None = None
    actions: list[Any] = field(default_factory=list)


@dataclass
class PauseAction:
    """PauseAction."""

    type: str = field(default="pause", init=False)
    duration: Any | None = None


@dataclass
class KeyDownAction:
    """KeyDownAction."""

    type: str = field(default="keyDown", init=False)
    value: str | None = None


@dataclass
class KeyUpAction:
    """KeyUpAction."""

    type: str = field(default="keyUp", init=False)
    value: str | None = None


@dataclass
class PointerUpAction:
    """PointerUpAction."""

    type: str = field(default="pointerUp", init=False)
    button: Any | None = None


@dataclass
class WheelScrollAction:
    """WheelScrollAction."""

    type: str = field(default="scroll", init=False)
    x: Any | None = None
    y: Any | None = None
    delta_x: Any | None = None
    delta_y: Any | None = None
    duration: Any | None = None
    origin: Any | None = None


@dataclass
class PointerCommonProperties:
    """PointerCommonProperties."""

    width: Any | None = None
    height: Any | None = None
    pressure: Any | None = None
    tangential_pressure: Any | None = None
    twist: Any | None = None
    altitude_angle: Any | None = None
    azimuth_angle: Any | None = None


@dataclass
class ReleaseActionsParameters:
    """ReleaseActionsParameters."""

    context: Any | None = None


@dataclass
class SetFilesParameters:
    """SetFilesParameters."""

    context: Any | None = None
    element: Any | None = None
    files: list[Any] = field(default_factory=list)


@dataclass
class FileDialogInfo:
    """FileDialogInfo - parameters for the input.fileDialogOpened event."""

    context: Any | None = None
    element: Any | None = None
    multiple: bool | None = None

    @classmethod
    def from_json(cls, params: dict) -> FileDialogInfo:
        """Deserialize event params into FileDialogInfo."""
        return cls(
            context=params.get("context"),
            element=params.get("element"),
            multiple=params.get("multiple"),
        )


@dataclass
class PointerMoveAction:
    """PointerMoveAction."""

    type: str = field(default="pointerMove", init=False)
    x: Any | None = None
    y: Any | None = None
    duration: Any | None = None
    origin: Any | None = None
    properties: Any | None = None


@dataclass
class PointerDownAction:
    """PointerDownAction."""

    type: str = field(default="pointerDown", init=False)
    button: Any | None = None
    properties: Any | None = None


# BiDi Event Name to Parameter Type Mapping
EVENT_NAME_MAPPING = {
    "file_dialog_opened": "input.fileDialogOpened",
}


class Input:
    """WebDriver BiDi input module."""

    EVENT_CONFIGS: dict[str, EventConfig] = {}

    def __init__(self, conn) -> None:
        self._conn = conn
        self._event_manager = _EventManager(conn, self.EVENT_CONFIGS)

    def perform_actions(self, context: Any | None = None, actions: list[Any] | None = None):
        """Execute input.performActions."""
        if context is None:
            raise TypeError("perform_actions() missing required argument: 'context'")
        if actions is None:
            raise TypeError("perform_actions() missing required argument: 'actions'")

        params = {
            "context": context,
            "actions": actions,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("input.performActions", params)
        result = self._conn.execute(cmd)
        return result

    def release_actions(self, context: Any | None = None):
        """Execute input.releaseActions."""
        if context is None:
            raise TypeError("release_actions() missing required argument: 'context'")

        params = {
            "context": context,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("input.releaseActions", params)
        result = self._conn.execute(cmd)
        return result

    def set_files(self, context: Any | None = None, element: Any | None = None, files: list[Any] | None = None):
        """Execute input.setFiles."""
        if context is None:
            raise TypeError("set_files() missing required argument: 'context'")
        if element is None:
            raise TypeError("set_files() missing required argument: 'element'")
        if files is None:
            raise TypeError("set_files() missing required argument: 'files'")

        params = {
            "context": context,
            "element": element,
            "files": files,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("input.setFiles", params)
        result = self._conn.execute(cmd)
        return result

    def add_file_dialog_handler(self, callback) -> int:
        """Subscribe to the input.fileDialogOpened event.

        Args:
            callback: Callable invoked with a FileDialogInfo when a file dialog opens.

        Returns:
            A handler ID that can be passed to remove_file_dialog_handler.
        """
        return self._event_manager.add_event_handler("file_dialog_opened", callback)

    def remove_file_dialog_handler(self, handler_id: int) -> None:
        """Unsubscribe a previously registered file dialog event handler.

        Args:
            handler_id: The handler ID returned by add_file_dialog_handler.
        """
        return self._event_manager.remove_event_handler("file_dialog_opened", handler_id)

    def add_event_handler(self, event: str, callback: Callable, contexts: list[str] | None = None) -> int:
        """Add an event handler.

        Args:
            event: The event to subscribe to.
            callback: The callback function to execute on event.
            contexts: The context IDs to subscribe to (optional).

        Returns:
            The callback ID.
        """
        return self._event_manager.add_event_handler(event, callback, contexts)

    def remove_event_handler(self, event: str, callback_id: int) -> None:
        """Remove an event handler.

        Args:
            event: The event to unsubscribe from.
            callback_id: The callback ID.
        """
        return self._event_manager.remove_event_handler(event, callback_id)

    def clear_event_handlers(self) -> None:
        """Clear all event handlers."""
        return self._event_manager.clear_event_handlers()


# Event Info Type Aliases
# Event: input.fileDialogOpened
FileDialogOpened = globals().get("FileDialogInfo", dict)  # Fallback to dict if type not defined


# Populate EVENT_CONFIGS with event configuration mappings
_globals = globals()
Input.EVENT_CONFIGS = {
    "file_dialog_opened": EventConfig(
        "file_dialog_opened",
        "input.fileDialogOpened",
        _globals.get("FileDialogOpened", dict) if _globals.get("FileDialogOpened") else dict,
    ),
}
