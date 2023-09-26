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

from selenium.webdriver import Firefox
from selenium.webdriver.firefox.service import Service


def test_log_output_as_filename() -> None:
    log_file = "geckodriver.log"
    service = Service(log_output=log_file)
    try:
        driver = Firefox(service=service)
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
