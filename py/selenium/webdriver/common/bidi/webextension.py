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


@dataclass
class InstallParameters:
    """InstallParameters."""

    extension_data: Any | None = None


@dataclass
class ExtensionPath:
    """ExtensionPath."""

    type: str = field(default="path", init=False)
    path: str | None = None


@dataclass
class ExtensionArchivePath:
    """ExtensionArchivePath."""

    type: str = field(default="archivePath", init=False)
    path: str | None = None


@dataclass
class ExtensionBase64Encoded:
    """ExtensionBase64Encoded."""

    type: str = field(default="base64", init=False)
    value: str | None = None


@dataclass
class InstallResult:
    """InstallResult."""

    extension: Any | None = None


@dataclass
class UninstallParameters:
    """UninstallParameters."""

    extension: Any | None = None


class WebExtension:
    """WebDriver BiDi webExtension module."""

    def __init__(self, conn) -> None:
        self._conn = conn

    def install(
        self,
        path: str | None = None,
        archive_path: str | None = None,
        base64_value: str | None = None,
    ):
        """Install a web extension.

        Exactly one of the three keyword arguments must be provided.

        Args:
            path: Directory path to an unpacked extension (also accepted for
                signed ``.xpi`` / ``.crx`` archive files on Firefox).
            archive_path: File-system path to a packed extension archive.
            base64_value: Base64-encoded extension archive string.

        Returns:
            The raw result dict from the BiDi ``webExtension.install`` command
            (contains at least an ``"extension"`` key with the extension ID).

        Raises:
            ValueError: If more than one, or none, of the arguments is provided.
        """
        provided = [
            k
            for k, v in {
                "path": path,
                "archive_path": archive_path,
                "base64_value": base64_value,
            }.items()
            if v is not None
        ]
        if len(provided) != 1:
            raise ValueError(f"Exactly one of path, archive_path, or base64_value must be provided; got: {provided}")
        if path is not None:
            extension_data = {"type": "path", "path": path}
        elif archive_path is not None:
            extension_data = {"type": "archivePath", "path": archive_path}
        else:
            assert base64_value is not None
            extension_data = {"type": "base64", "value": base64_value}
        params = {"extensionData": extension_data}
        cmd = command_builder("webExtension.install", params)
        try:
            return self._conn.execute(cmd)
        except Exception as e:
            if "Method not available" in str(e):
                raise RuntimeError(
                    "webExtension.install failed with 'Method not available'. "
                    "This likely means that web extension support is disabled. "
                    "Enable unsafe extension debugging and/or set options.enable_webextensions "
                    "in your WebDriver configuration."
                ) from e
            raise

    def uninstall(self, extension: str | dict):
        """Uninstall a web extension.

        Args:
            extension: Either the extension ID string returned by ``install``,
                or the full result dict returned by ``install`` (the
                ``"extension"`` value is extracted automatically).

        Raises:
            ValueError: If extension is not provided or is None.
        """
        if isinstance(extension, dict):
            extension_id: Any = extension.get("extension")
        else:
            extension_id = extension

        if extension_id is None:
            raise ValueError("extension parameter is required")

        params = {"extension": extension_id}
        cmd = command_builder("webExtension.uninstall", params)
        return self._conn.execute(cmd)
