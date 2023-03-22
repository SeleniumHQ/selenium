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

import os

import urllib3

from selenium import webdriver


def test_bad_proxy_doesnt_interfere():
    # these values should be ignored if ignore_local_proxy_environment_variables() is called.
    os.environ["https_proxy"] = "bad"
    os.environ["http_proxy"] = "bad"
    options = webdriver.ChromeOptions()

    options.ignore_local_proxy_environment_variables()

    chrome_kwargs = {"options": options}
    driver = webdriver.Chrome(**chrome_kwargs)

    assert hasattr(driver, "command_executor")
    assert hasattr(driver.command_executor, "_proxy_url")
    assert isinstance(driver.command_executor._conn, urllib3.PoolManager)
    os.environ.pop("https_proxy")
    os.environ.pop("http_proxy")
    driver.quit()
