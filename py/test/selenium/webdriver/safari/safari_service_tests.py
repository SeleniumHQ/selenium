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
import sys
from unittest.mock import patch

import pytest

from selenium.webdriver.safari.service import Service


@pytest.fixture
def service():
    return Service()


@pytest.mark.usefixtures("service")
class TestSafariDriverService:
    service_path = "/path/to/safaridriver"

    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        os.environ["SE_SAFARIDRIVER"] = self.service_path
        yield
        os.environ.pop("SE_SAFARIDRIVER", None)

    def test_uses_path_from_env_variable(self, service):
        assert "safaridriver" in service.path

    def test_updates_path_after_setting_env_variable(self, service):
        service.executable_path = self.service_path  # Simulating the update
        with patch.dict("os.environ", {"SE_SAFARIDRIVER": "/foo/bar"}):
            assert "safaridriver" in service.executable_path


def test_enable_logging():
    enable_logging = True
    service = Service(enable_logging=enable_logging)
    assert "--diagnose" in service.service_args


def test_service_url():
    service = Service(port=1313)
    assert service.service_url == "http://localhost:1313"


def test_service_allows_reusing_stdout_for_logging(clean_driver, clean_options, driver_executable):
    browser1 = None
    browser2 = None
    try:
        service1 = Service(executable_path=driver_executable, log_output=sys.stdout)
        browser1 = clean_driver(service=service1, options=clean_options)
        assert browser1.session_id is not None
        browser1.quit()
        service2 = Service(executable_path=driver_executable, log_output=sys.stdout)
        browser2 = clean_driver(service=service2, options=clean_options)
        assert browser2.session_id is not None
        browser2.quit()
    finally:
        if browser1:
            browser1.quit()
        if browser2:
            browser2.quit()
