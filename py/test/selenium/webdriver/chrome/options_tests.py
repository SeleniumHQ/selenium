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

from selenium import webdriver


def test_w3c_true():
    options = webdriver.ChromeOptions()
    options.add_experimental_option("w3c", True)

    chrome_kwargs = {"options": options}

    with pytest.warns(DeprecationWarning, match="Setting 'w3c: True' is redundant"):
        driver = webdriver.Chrome(**chrome_kwargs)

    driver.quit()


def test_w3c_false():
    options = webdriver.ChromeOptions()
    options.add_experimental_option("w3c", False)

    chrome_kwargs = {"options": options}

    with pytest.raises(AttributeError):
        webdriver.Chrome(**chrome_kwargs)
