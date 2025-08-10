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

import base64

import filetype
import pytest
from urllib3.exceptions import ReadTimeoutError

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.client_config import ClientConfig


def test_browser_specific_method(driver, pages):
    """This only works on Firefox"""
    pages.load("simpleTest.html")
    screenshot = driver.execute("FULL_PAGE_SCREENSHOT")["value"]
    result = base64.b64decode(screenshot)
    kind = filetype.guess(result)
    assert kind is not None and kind.mime == "image/png"


def test_remote_webdriver_with_http_timeout(firefox_options, webserver):
    """This test starts a remote webdriver with an http client timeout
    set less than the implicit wait timeout, and verifies the http timeout
    is triggered first when waiting for an element.
    """
    http_timeout = 6
    wait_timeout = 8
    server_addr = f"http://{webserver.host}:{webserver.port}"
    client_config = ClientConfig(remote_server_addr=server_addr, timeout=http_timeout)
    assert client_config.timeout == http_timeout
    with webdriver.Remote(options=firefox_options, client_config=client_config) as driver:
        driver.get(f"{server_addr}/simpleTest.html")
        driver.implicitly_wait(wait_timeout)
        with pytest.raises(ReadTimeoutError):
            driver.find_element(By.ID, "no_element_to_be_found")
