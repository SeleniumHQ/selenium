#  Licensed to the Software Freedom Conservancy (SFC) under one
#  or more contributor license agreements.  See the NOTICE file
#  distributed with this work for additional information
#  regarding copyright ownership.  The SFC licenses this file
#  to you under the Apache License, Version 2.0 (the
#  "License"); you may not use this file except in compliance
#  with the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.utils import try_convert_to_css_strategy


@pytest.mark.parametrize("by, value, expected",
                         [(By.ID, "id", (By.CSS_SELECTOR, '[id="id"]')),
                          (By.CLASS_NAME, "class", (By.CSS_SELECTOR, ".class")),
                          (By.NAME, "name", (By.CSS_SELECTOR, '[name="name"]')),
                          (By.XPATH, "//*", (By.XPATH, '//*')),
                          (By.LINK_TEXT, "link", (By.LINK_TEXT, "link")),
                          (By.PARTIAL_LINK_TEXT, "plink", (By.PARTIAL_LINK_TEXT, "plink")),
                          (By.TAG_NAME, "tag", (By.TAG_NAME, "tag"))
                          ])
def test_successful_by_to_css_converts(by, value, expected):
    assert try_convert_to_css_strategy(by, value) == expected
