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

from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options


@pytest.fixture
def driver():
    options = Options()
    options.add_argument("-remote-allow-system-access")
    driver = Firefox(options=options)
    yield driver
    driver.quit()


def test_sets_correct_context(driver):
    def get_context():
        return driver.execute("GET_CONTEXT").pop("value")

    assert get_context() == driver.CONTEXT_CONTENT
    with driver.context(driver.CONTEXT_CHROME):
        assert get_context() == driver.CONTEXT_CHROME
    assert get_context() == driver.CONTEXT_CONTENT


def test_switch_context_to_chrome(driver):
    driver.set_context("chrome")
    assert 1 == driver.execute_script("var c = Components.classes; return 1;")
