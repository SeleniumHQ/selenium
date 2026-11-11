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

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.support.relative_locator import locate_with, with_tag_name


def test_locate_with():
    locator = locate_with(By.TAG_NAME, "div")
    assert locator.to_dict() == {"relative": {"root": {"tag name": "div"}, "filters": []}}


def test_with_tag_name_warning():
    with pytest.deprecated_call() as warning_info:
        locator = with_tag_name("div")
    assert len(warning_info) == 1
    assert "locate_with" in str(warning_info[0].message)
    assert locator.to_dict() == {"relative": {"root": {"css selector": "div"}, "filters": []}}
