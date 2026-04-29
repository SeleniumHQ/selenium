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
import subprocess
import sys
from unittest.mock import patch

import pytest

from selenium.common.exceptions import SessionNotCreatedException
from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service


def test_log_output_as_filename(recwarn) -> None:
    log_file = "geckodriver.log"
    service = Service(log_output=log_file)
    try:
        driver = Firefox(service=service)
        assert len(recwarn) == 0
        with open(log_file) as fp:
            assert "geckodriver\tINFO\tListening" in fp.readline()
    finally:
        driver.quit()
        os.remove(log_file)


def test_log_output_as_file() -> None:
    log_name = "geckodriver.log"
    log_file = open(log_name, "w", encoding="utf-8")
    service = Service(log_output=log_file)
    try:
        driver = Firefox(service=service)
        with open(log_name) as fp:
            assert "geckodriver\tINFO\tListening" in fp.readline()
    finally:
        driver.quit()
        log_file.close()
        os.remove(log_name)


def test_log_output_as_stdout(capfd) -> None:
    service = Service(log_output=subprocess.STDOUT)
    driver = Firefox(service=service)

    out, err = capfd.readouterr()
    assert "geckodriver\tINFO\tListening" in out
    driver.quit()


def test_driver_is_stopped_if_browser_cant_start(clean_driver) -> None:
    options = Options()
    options.add_argument("-profile=/no/such/location")
    service = Service()
    with pytest.raises(SessionNotCreatedException):
        clean_driver(options=options, service=service)
    assert not service.is_connectable()
    assert service.process.poll() is not None


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


@pytest.fixture
def service():
    return Service()


@pytest.mark.usefixtures("service")
class TestGeckoDriverService:
    service_path = "/path/to/geckodriver"

    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        os.environ["SE_GECKODRIVER"] = self.service_path
        yield
        os.environ.pop("SE_GECKODRIVER", None)

    def test_uses_path_from_env_variable(self, service):
        assert "geckodriver" in service.path

    def test_updates_path_after_setting_env_variable(self, service):
        service.executable_path = self.service_path  # Simulating the update
        with patch.dict("os.environ", {"SE_GECKODRIVER": "/foo/bar"}):
            assert "geckodriver" in service.executable_path
