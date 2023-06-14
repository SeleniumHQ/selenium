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


import sys
from typing import TYPE_CHECKING
from typing import List
from typing import Optional

# necessary to support types for Python 3.7
if TYPE_CHECKING:
    if sys.version_info >= (3, 8):
        from typing import Literal
        from typing import TypedDict
    else:
        from typing_extensions import Literal
        from typing_extensions import TypedDict

    Orientation = Literal["portrait", "landscape"]

    class _MarginOpts(TypedDict, total=False):
        left: float
        right: float
        top: float
        bottom: float

    class _PageOpts(TypedDict, total=False):
        width: float
        height: float

    class _PrintOpts(TypedDict, total=False):
        margin: _MarginOpts
        page: _PageOpts
        background: bool
        orientation: Orientation
        scale: float
        shrinkToFit: bool
        pageRanges: List[str]

else:
    from typing import Any
    from typing import Dict

    Orientation = str
    _MarginOpts = _PageOpts = _PrintOpts = Dict[str, Any]


class PageSettings:
    """PageSettings descriptor which validates 'height' and 'width' of page."""

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls) -> Optional[float]:
        return obj._page.get(self.name, None)

    def __set__(self, obj, value) -> None:
        getattr(obj, "_validate_num_property")(self.name, value)
        obj._page[self.name] = value
        obj._print_options["page"] = obj._page


class MarginSettings:
    """MarginSettings descriptor which validates below attributes.

    - top
    - bottom
    - left
    - right
    """

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls) -> Optional[float]:
        return obj._margin.get(self.name, None)

    def __set__(self, obj, value) -> None:
        getattr(obj, "_validate_num_property")(f"Margin {self.name}", value)
        obj._margin[self.name] = value
        obj._print_options["margin"] = obj._margin


class Scale:
    """Scale descriptor which validates scale."""

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls) -> Optional[float]:
        return obj._print_options.get(self.name)

    def __set__(self, obj, value) -> None:
        getattr(obj, "_validate_num_property")(self.name, value)
        if value < 0.1 or value > 2:
            raise ValueError("Value of scale should be between 0.1 and 2")
        obj._print_options[self.name] = value


class PageOrientation:
    """PageOrientation descriptor which validates orientation of page."""

    ORIENTATION_VALUES = ["portrait", "landscape"]

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls) -> Optional[Orientation]:
        return obj._print_options.get(self.name, None)

    def __set__(self, obj, value) -> None:
        if value not in self.ORIENTATION_VALUES:
            raise ValueError(f"Orientation value must be one of {self.ORIENTATION_VALUES}")
        obj._print_options[self.name] = value


class ValidateType:
    """descriptor which validates type of below attributes.

    - background
    - shrink_to_fit
    - page_ranges
    """

    def __init__(self, name, expected_type):
        self.name = name
        self.expected_type = expected_type

    def __get__(self, obj, cls):
        return obj._print_options.get(self.name, None)

    def __set__(self, obj, value) -> None:
        if not isinstance(value, self.expected_type):
            raise ValueError(f"{self.name} should be of type {self.expected_type}")
        obj._print_options[self.name] = value


class PrintOptions:
    page_height = PageSettings("height")
    page_width = PageSettings("width")

    margin_top = MarginSettings("top")
    margin_bottom = MarginSettings("bottom")
    margin_left = MarginSettings("left")
    margin_right = MarginSettings("right")

    scale = Scale("scale")
    orientation = PageOrientation("orientation")

    background = ValidateType("background", bool)
    shrink_to_fit = ValidateType("shrinkToFit", bool)
    page_ranges = ValidateType("pageRanges", list)

    def __init__(self) -> None:
        self._print_options: _PrintOpts = {}
        self._page: _PageOpts = {}
        self._margin: _MarginOpts = {}

    def to_dict(self) -> _PrintOpts:
        """
        :Returns: A hash of print options configured
        """
        return self._print_options

    def _validate_num_property(self, property_name: str, value: float) -> None:
        """Helper function to validate some of the properties."""
        if not isinstance(value, (int, float)):
            raise ValueError(f"{property_name} should be an integer or a float")

        if value < 0:
            raise ValueError(f"{property_name} cannot be less then 0")
