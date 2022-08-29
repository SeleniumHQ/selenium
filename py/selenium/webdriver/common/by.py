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

"""
The By implementation.
"""

from __future__ import annotations

from enum import Enum

from selenium.common.exceptions import WebDriverException


class By(Enum):
    """
    Set of supported locator strategies.
    """

    ID = "id"
    XPATH = "xpath"
    LINK_TEXT = "link text"
    PARTIAL_LINK_TEXT = "partial link text"
    NAME = "name"
    TAG_NAME = "tag name"
    CLASS_NAME = "class name"
    CSS_SELECTOR = "css selector"

    @classmethod
    def from_str(cls, by_str: str) -> By:
        """
        Take the string representation of a locator strategy ("id", "css
        selector", etc.), and return the appropriate By enum value for it.
        Throw a WebDriverException if no such By type exists.
        """

        for value in cls.__members__.values():
            if value.value == by_str:
                return value

        raise WebDriverException(
            f"{by_str!r} is not a valid locator strategy. Use a member of the By enum directly or one of: "
            f"{', '.join(repr(v.value) for v in cls.__members__.values())}"
        )
