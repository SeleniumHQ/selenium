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


from typing import Dict, List, Union
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement


def with_tag_name(tag_name: str) -> "RelativeBy":
    if not tag_name:
        raise WebDriverException("tag_name can not be null")
    return RelativeBy({"css selector": tag_name})


def locate_with(by: By, using: str) -> "RelativeBy":
    assert by is not None, "Please pass in a by argument"
    assert using is not None, "Please pass in a using argument"
    return RelativeBy({by: using})


class RelativeBy(object):

    def __init__(self, root: Dict = None, filters: List = None):
        self.root = root
        self.filters = filters or []

    def above(self, element_or_locator: Union[WebElement, Dict] = None):
        if not element_or_locator:
            raise WebDriverException("Element or locator must be given when calling above method")

        self.filters.append({"kind": "above", "args": [element_or_locator]})
        return self

    def below(self, element_or_locator: Union[WebElement, Dict] = None):
        if not element_or_locator:
            raise WebDriverException("Element or locator must be given when calling above method")

        self.filters.append({"kind": "below", "args": [element_or_locator]})
        return self

    def to_left_of(self, element_or_locator: Union[WebElement, Dict] = None):
        if not element_or_locator:
            raise WebDriverException("Element or locator must be given when calling above method")

        self.filters.append({"kind": "left", "args": [element_or_locator]})
        return self

    def to_right_of(self, element_or_locator: Union[WebElement, Dict] = None):
        if not element_or_locator:
            raise WebDriverException("Element or locator must be given when calling above method")

        self.filters.append({"kind": "right", "args": [element_or_locator]})
        return self

    def near(self, element_or_locator_distance: Union[WebElement, Dict, int] = None):
        if not element_or_locator_distance:
            raise WebDriverException("Element or locator or distance must be given when calling above method")

        self.filters.append({"kind": "near", "args": [element_or_locator_distance]})
        return self

    def to_dict(self):
        return {
            'relative': {
                'root': self.root,
                'filters': self.filters,
            }
        }
