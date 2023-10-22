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
import io
import zipfile
from time import sleep

import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By


def test_get_downloadable_files(driver, pages):
    pages.load("downloads/download.html")
    driver.find_element(By.ID, "file-1").click()
    driver.find_element(By.ID, "file-2").click()
    sleep(3)

    file_names = driver.get_downloadable_files()["names"]
    assert "file_1.txt" in file_names
    assert "file_2.jpg" in file_names


def test_download_file(driver, pages):
    pages.load("downloads/download.html")
    driver.find_element(By.ID, "file-1").click()
    sleep(3)

    file_contents = driver.download_file("file_1.txt")["contents"]
    file_byte_data = base64.b64decode(file_contents)
    zip_memory = io.BytesIO(file_byte_data)

    with zipfile.ZipFile(zip_memory, 'r') as zip_ref:
        for name in zip_ref.namelist():
            with zip_ref.open(name) as file:
                file_content = file.read()
                assert "Hello, World!" in file_content.decode("utf-8")


def test_delete_downloadable_files(driver, pages):
    pages.load("downloads/download.html")
    driver.find_element(By.ID, "file-1").click()
    sleep(3)

    driver.delete_downloadable_files()
    assert not driver.get_downloadable_files()["names"]
