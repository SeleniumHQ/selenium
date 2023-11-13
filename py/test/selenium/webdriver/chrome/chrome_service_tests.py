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
import time

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.chrome.service import Service


@pytest.mark.xfail_chrome(raises=WebDriverException)
@pytest.mark.no_driver_after_test
def test_uses_chromedriver_logging(clean_driver, driver_executable) -> None:
    log_file = "chromedriver.log"
    service_args = ["--append-log"]

    service = Service(
        log_output=log_file,
        service_args=service_args,
        executable_path=driver_executable,
    )
    driver2 = None
    try:
        driver1 = clean_driver(service=service)
        with open(log_file) as fp:
            lines = len(fp.readlines())
        driver2 = clean_driver(service=service)
        with open(log_file) as fp:
            assert len(fp.readlines()) >= 2 * lines
    finally:
        driver1.quit()
        if driver2:
            driver2.quit()
        os.remove(log_file)


@pytest.mark.no_driver_after_test
def test_log_output_as_filename(clean_driver, driver_executable) -> None:
    log_file = "chromedriver.log"
    service = Service(log_output=log_file, executable_path=driver_executable)
    try:
        assert "--log-path=chromedriver.log" in service.service_args
        driver = clean_driver(service=service)
        with open(log_file) as fp:
            assert "Starting ChromeDriver" in fp.readline()
    finally:
        driver.quit()
        os.remove(log_file)


@pytest.mark.no_driver_after_test
def test_log_output_as_file(clean_driver, driver_executable) -> None:
    log_name = "chromedriver.log"
    log_file = open(log_name, "w", encoding="utf-8")
    service = Service(log_output=log_file, executable_path=driver_executable)
    try:
        driver = clean_driver(service=service)
        time.sleep(1)
        with open(log_name) as fp:
            assert "Starting ChromeDriver" in fp.readline()
    finally:
        driver.quit()
        log_file.close()
        os.remove(log_name)


@pytest.mark.no_driver_after_test
def test_log_output_as_stdout(clean_driver, capfd, driver_executable) -> None:
    service = Service(log_output=subprocess.STDOUT, executable_path=driver_executable)
    driver = clean_driver(service=service)

    out, err = capfd.readouterr()
    assert "Starting ChromeDriver" in out
    driver.quit()


@pytest.mark.no_driver_after_test
def test_log_output_null_default(driver, capfd) -> None:
    out, err = capfd.readouterr()
    assert "Starting ChromeDriver" not in out
    driver.quit()
