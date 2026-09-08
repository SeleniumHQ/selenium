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

"""Mirror of ``../bidi/network_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.network import Header, InterceptPhase, Network, StringValue


def test_add_intercept(driver, pages):
    network = Network(driver)
    result = network.add_intercept(phases=[InterceptPhase.BEFORE_REQUEST_SENT])
    assert result.intercept

    network.remove_intercept(intercept=result.intercept)


def test_remove_intercept(driver):
    network = Network(driver)
    intercept = network.add_intercept(phases=[InterceptPhase.BEFORE_REQUEST_SENT]).intercept

    network.remove_intercept(intercept=intercept)

    # No facade `intercepts` list to inspect; a second remove of the same id must raise.
    with pytest.raises(WebDriverException):
        network.remove_intercept(intercept=intercept)


def test_extra_header_is_sent_with_requests(driver, pages):
    header = Header(name="x-selenium-extra", value=StringValue(value="extra-header-value"))
    Network(driver).set_extra_headers(headers=[header])
    try:
        driver.get(pages.url("echo_headers"))
        assert "x-selenium-extra" in driver.page_source
        assert "extra-header-value" in driver.page_source
    finally:
        Network(driver).set_extra_headers(headers=[])


def test_removed_extra_header_is_not_sent(driver, pages):
    network = Network(driver)
    network.set_extra_headers(headers=[Header(name="x-selenium-extra", value=StringValue(value="extra-header-value"))])
    network.set_extra_headers(headers=[])

    driver.get(pages.url("echo_headers"))
    assert "x-selenium-extra" not in driver.page_source
