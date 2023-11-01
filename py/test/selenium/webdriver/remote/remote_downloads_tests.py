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

from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait


def test_get_downloadable_files(driver, pages):
    _browser_downloads(driver, pages)

    file_names = driver.get_downloadable_files()

    assert "file_1.txt" in file_names
    assert "file_2.jpg" in file_names


def test_download_file(driver, pages):
    _browser_downloads(driver, pages)

    file_name = driver.get_downloadable_files()[0]
    with tempfile.TemporaryDirectory() as target_directory:
        driver.download_file(file_name, target_directory)

        target_file = os.path.join(target_directory, file_name)
        with open(target_file, "r") as file:
            assert "Hello, World!" in file.read()


def test_delete_downloadable_files(driver, pages):
    _browser_downloads(driver, pages)

    driver.delete_downloadable_files()
    assert not driver.get_downloadable_files()


def _browser_downloads(driver, pages):
    pages.load("downloads/download.html")
    driver.find_element(By.ID, "file-1").click()
    driver.find_element(By.ID, "file-2").click()
    WebDriverWait(driver, 3).until(lambda d: "file_2.jpg" in d.get_downloadable_files())
