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

from typing import Literal, Optional, TypedDict, Union
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement


def with_tag_name(tag_name: str) -> "RelativeBy":
    """
        Start searching for relative objects using a tag name.

        Note: This method may be removed in future versions, please use
        `locate_with` instead.
        :Args:
            - tag_name: the DOM tag of element to start searching.
        :Returns:
            - RelativeBy - use this object to create filters within a
                `find_elements` call.
    """
    if not tag_name:
        raise WebDriverException("tag_name can not be null")
    return RelativeBy({By.CSS_SELECTOR: tag_name})


def locate_with(by: By | str, using: str) -> "RelativeBy":
    """
        Start searching for relative objects your search criteria with By.

        :Args:
            - by: The value from `By` passed in.
            - using: search term to find the element with.
        :Returns:
            - RelativeBy - use this object to create filters within a
                `find_elements` call.
    """
    assert by is not None, "Please pass in a by argument"
    assert using is not None, "Please pass in a using argument"

    if isinstance(by, str):
        by = By.from_str(by)

    return RelativeBy({by: using})


class Filter(TypedDict):
    kind: Literal["above", "below", "left", "right", "near"]
    args: list[WebElement | dict | int]


class RelativeByDictRelative(TypedDict):
    root: Optional[dict[str, str]]
    filters: list[Filter]


class RelativeByDict(TypedDict):
    relative: RelativeByDictRelative


class RelativeBy:
    """
        Gives the opportunity to find elements based on their relative location
        on the page from a root elelemt. It is recommended that you use the helper
        function to create it.

        Example:
            lowest = driver.find_element(By.ID, "below")

            elements = driver.find_elements(locate_with(By.CSS_SELECTOR, "p").above(lowest))

            ids = [el.get_attribute('id') for el in elements]
            assert "above" in ids
            assert "mid" in ids
    """

    def __init__(self, root: dict[By, str] = None, filters: list[Filter] = None) -> None:
        """
            Creates a new RelativeBy object. It is preferred if you use the
            `locate_with` method as this signature could change.
            :Args:
                root - A dict with `By` enum as the key and the search query as the value
                filters - A list of the filters that will be searched. If none are passed
                    in please use the fluent API on the object to create the filters
        """
        self.root = root
        self.filters = filters or []

    def __str__(self) -> str:
        return str(self.to_dict()["relative"]["root"])

    def above(self, element_or_locator: Union[WebElement, dict] = None) -> "RelativeBy":
        """
            Add a filter to look for elements above.
            :Args:
                - element_or_locator: Element to look above
        """
        if not element_or_locator:
            raise WebDriverException("Element or locator must be given when calling above method")

        self.filters.append({"kind": "above", "args": [element_or_locator]})
        return self

    def below(self, element_or_locator: Union[WebElement, dict] = None) -> "RelativeBy":
        """
            Add a filter to look for elements below.
            :Args:
                - element_or_locator: Element to look below
        """
        if not element_or_locator:
            raise WebDriverException("Element or locator must be given when calling above method")

        self.filters.append({"kind": "below", "args": [element_or_locator]})
        return self

    def to_left_of(self, element_or_locator: Union[WebElement, dict] = None) -> "RelativeBy":
        """
            Add a filter to look for elements to the left of.
            :Args:
                - element_or_locator: Element to look to the left of
        """
        if not element_or_locator:
            raise WebDriverException("Element or locator must be given when calling above method")

        self.filters.append({"kind": "left", "args": [element_or_locator]})
        return self

    def to_right_of(self, element_or_locator: Union[WebElement, dict] = None) -> "RelativeBy":
        """
            Add a filter to look for elements right of.
            :Args:
                - element_or_locator: Element to look right of
        """
        if not element_or_locator:
            raise WebDriverException("Element or locator must be given when calling above method")

        self.filters.append({"kind": "right", "args": [element_or_locator]})
        return self

    def near(self, element_or_locator_distance: Union[WebElement, dict, int] = None) -> "RelativeBy":
        """
            Add a filter to look for elements near.
            :Args:
                - element_or_locator_distance: Element to look near by the element or within a distance
        """
        if not element_or_locator_distance:
            raise WebDriverException("Element or locator or distance must be given when calling above method")

        self.filters.append({"kind": "near", "args": [element_or_locator_distance]})
        return self

    def to_dict(self) -> RelativeByDict:
        """
            Create a dict that will be passed to the driver to start searching for the element
        """
        return {
            'relative': {
                'root': {k.value: v for k, v in self.root.items()} if self.root is not None else None,
                'filters': self.filters,
            }
        }
