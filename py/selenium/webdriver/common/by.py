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
"""The By implementation."""

from typing import Dict
from typing import Literal
from typing import Optional


class By:
    """Set of supported locator strategies."""

    ID = "id"
    XPATH = "xpath"
    LINK_TEXT = "link text"
    PARTIAL_LINK_TEXT = "partial link text"
    NAME = "name"
    TAG_NAME = "tag name"
    CLASS_NAME = "class name"
    CSS_SELECTOR = "css selector"

    _custom_finders: Dict[str, str] = {}

    @classmethod
    def register_custom_finder(cls, name: str, strategy: str) -> None:
        cls._custom_finders[name] = strategy

    @classmethod
    def get_finder(cls, name: str) -> Optional[str]:
        return cls._custom_finders.get(name) or getattr(cls, name.upper(), None)

    @classmethod
    def clear_custom_finders(cls) -> None:
        cls._custom_finders.clear()


ByType = Literal["id", "xpath", "link text", "partial link text", "name", "tag name", "class name", "css selector"]
