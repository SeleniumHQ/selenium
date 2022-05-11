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

import json
from typing import Any, Union

import typing

from selenium.webdriver.common.by import By


def dump_json(json_struct: Any) -> str:
    return json.dumps(json_struct)


def load_json(s: Union[str, bytes]) -> Any:
    return json.loads(s)


def try_convert_to_css_strategy(by: By, value: str) -> typing.Tuple[By, str]:
    """If applicable, converts the by and value into a suitable CSS selector.
    If the by is not able to be transformed, both by and value are returned as-is.

    Args:
        by (By): The by strategy to potentially convert.
        value (str): The locator value to be potentially convert.

    Returns:
        A css selector strategy and converted value if applicable, else the original by and value.
    """
    transformable = {By.ID: '[id="{}"]', By.CLASS_NAME: '.{}', By.NAME: '[name="{}"]'}
    lookup = transformable.get(by)
    if lookup is None:
        return by, value
    return By.CSS_SELECTOR, lookup.format(value)
