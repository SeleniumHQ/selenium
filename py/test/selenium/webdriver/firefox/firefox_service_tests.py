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

import pytest

from selenium.webdriver import Firefox
from selenium.webdriver.firefox.service import Service


def test_log_path_deprecated() -> None:
    log_path = "geckodriver.log"
    msg = "log_path has been deprecated, please use log_output"

    with pytest.warns(match=msg, expected_warning=DeprecationWarning):
        Service(log_path=log_path)


def test_log_output_as_filename() -> None:
    log_file = "geckodriver.log"
    service = Service(log_output=log_file)
    try:
        driver = Firefox(service=service)
        with open(log_file, "r") as fp:
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
        with open(log_name, "r") as fp:
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


def test_log_output_default_deprecated() -> None:
    log_name = "geckodriver.log"
    msg = "Firefox will soon stop logging to geckodriver.log by default; Specify desired logs with log_output"

    try:
        with pytest.warns(match=msg, expected_warning=DeprecationWarning):
            driver = Firefox()
        with open(log_name, "r") as fp:
            assert "geckodriver\tINFO\tListening" in fp.readline()
    finally:
        driver.quit()
        os.remove(log_name)
