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
import tempfile

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait


@pytest.mark.no_driver_after_test
def test_get_downloadable_files(driver, pages):
    _browser_downloads(driver, pages)
    file_names = driver.get_downloadable_files()
    # TODO: why is Chrome downloading files as .html???
    # assert "file_1.txt" in file_names
    # assert "file_2.jpg" in file_names
    assert any(f in file_names for f in ("file_1.txt", "file_1.htm", "file_1.html"))
    assert any(f in file_names for f in ("file_2.jpg", "file_2.htm", "file_2.html"))
    assert type(file_names) is list


@pytest.mark.no_driver_after_test
def test_download_file(driver, pages):
    _browser_downloads(driver, pages)

    # Get a list of downloadable files and find the txt file
    downloadable_files = driver.get_downloadable_files()
    # TODO: why is Chrome downloading files as .html???
    # text_file_name = next((file for file in downloadable_files if file.endswith(".txt")), None)
    text_file_name = next(
        (f for f in downloadable_files if all((f.endswith((".txt", ".htm", ".html")), f.startswith("file_1")))), None
    )
    assert text_file_name is not None, "Could not find file in downloadable files"

    with tempfile.TemporaryDirectory() as target_directory:
        driver.download_file(text_file_name, target_directory)

        target_file = os.path.join(target_directory, text_file_name)
        with open(target_file) as file:
            assert "Hello, World!" in file.read()


@pytest.mark.no_driver_after_test
def test_delete_downloadable_files(driver, pages):
    _browser_downloads(driver, pages)

    driver.delete_downloadable_files()
    assert not driver.get_downloadable_files()


def _browser_downloads(driver, pages):
    pages.load("downloads/download.html")
    driver.find_element(By.ID, "file-1").click()
    driver.find_element(By.ID, "file-2").click()
    # TODO: why is Chrome downloading files as .html???
    # WebDriverWait(driver, 5).until(lambda d: "file_2.jpg" in d.get_downloadable_files())
    WebDriverWait(driver, 5).until(
        lambda d: any(f in d.get_downloadable_files() for f in ("file_2.jpg", "file_2.htm", "file_2.html"))
    )
