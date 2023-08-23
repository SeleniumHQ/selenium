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

from selenium.webdriver import Chrome
from selenium.webdriver.chrome.service import Service


def test_log_path_deprecated() -> None:
    log_path = "chromedriver.log"
    msg = "log_path has been deprecated, please use log_output"

    with pytest.warns(match=msg, expected_warning=DeprecationWarning):
        Service(log_path=log_path)


def test_uses_chromedriver_logging() -> None:
    log_file = "chromedriver.log"
    service_args = ["--append-log"]

    service = Service(log_output=log_file, service_args=service_args)
    try:
        driver1 = Chrome(service=service)
        with open(log_file, "r") as fp:
            lines = len(fp.readlines())
        driver2 = Chrome(service=service)
        with open(log_file, "r") as fp:
            assert len(fp.readlines()) >= 2 * lines
    finally:
        driver1.quit()
        driver2.quit()
        os.remove(log_file)


def test_log_output_as_filename() -> None:
    log_file = "chromedriver.log"
    service = Service(log_output=log_file)
    try:
        driver = Chrome(service=service)
        with open(log_file, "r") as fp:
            assert "Starting ChromeDriver" in fp.readline()
    finally:
        driver.quit()
        os.remove(log_file)


def test_log_output_as_file() -> None:
    log_name = "chromedriver.log"
    log_file = open(log_name, "w", encoding="utf-8")
    service = Service(log_output=log_file)
    try:
        driver = Chrome(service=service)
        time.sleep(1)
        with open(log_name, "r") as fp:
            assert "Starting ChromeDriver" in fp.readline()
    finally:
        driver.quit()
        log_file.close()
        os.remove(log_name)


def test_log_output_as_stdout(capfd) -> None:
    service = Service(log_output=subprocess.STDOUT)
    driver = Chrome(service=service)

    out, err = capfd.readouterr()
    assert "Starting ChromeDriver" in out
    driver.quit()


def test_log_output_null_default(capfd) -> None:
    driver = Chrome()

    out, err = capfd.readouterr()
    assert "Starting ChromeDriver" not in out
    driver.quit()
