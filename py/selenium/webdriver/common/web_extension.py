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


class WebExtension:
    """A browser extension installed with `WebDriver.install_web_extension`.

    Wraps the identifier the browser assigned to the extension. Pass it to
    `WebDriver.uninstall_web_extension` to remove the extension again.
    """

    def __init__(self, id: str) -> None:
        """Wrap the identifier the browser assigned to an extension.

        Args:
            id: The identifier assigned to the extension by the browser.
        """
        self._id = id

    @property
    def id(self) -> str:
        """The identifier assigned to the extension by the browser."""
        return self._id

    def __eq__(self, other: object) -> bool:
        return isinstance(other, WebExtension) and other.id == self._id

    def __hash__(self) -> int:
        return hash(self._id)

    def __repr__(self) -> str:
        return f'<{type(self).__module__}.{type(self).__name__} (id="{self._id}")>'
