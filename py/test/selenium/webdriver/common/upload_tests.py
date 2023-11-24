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

import pytest

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement


@pytest.fixture
def get_local_path():
    current_dir = os.path.dirname(os.path.realpath(__file__))

    def wrapped(filename):
        return os.path.join(current_dir, filename)

    return wrapped


def test_can_upload_file(driver, pages, get_local_path):
    pages.load("upload.html")

    driver.find_element(By.ID, "upload").send_keys(get_local_path("test_file.txt"))
    driver.find_element(By.ID, "go").click()
    driver.switch_to.frame(driver.find_element(By.ID, "upload_target"))
    body = driver.find_element(By.CSS_SELECTOR, "body").text

    assert "test_file.txt" in body


def test_can_upload_two_files(driver, pages, get_local_path):
    pages.load("upload.html")
    two_file_paths = get_local_path("test_file.txt") + "\n" + get_local_path("test_file2.txt")
    driver.find_element(By.ID, "upload").send_keys(two_file_paths)
    driver.find_element(By.ID, "go").click()
    driver.switch_to.frame(driver.find_element(By.ID, "upload_target"))
    body = driver.find_element(By.CSS_SELECTOR, "body").text

    assert "test_file.txt" in body
    assert "test_file2.txt" in body


@pytest.mark.xfail_firefox
@pytest.mark.xfail_chrome
@pytest.mark.xfail_safari
def test_file_is_uploaded_to_remote_machine_on_select(driver, pages, get_local_path):
    uploaded_files = []
    original_upload_func = WebElement._upload

    def mocked_upload_func(self, filename):
        uploaded_files.append(filename)
        return original_upload_func(self, filename)

    WebElement._upload = mocked_upload_func
    try:
        pages.load("upload.html")
        two_file_paths = get_local_path("test_file.txt") + "\n" + get_local_path("test_file2.txt")
        driver.find_element(By.ID, "upload").send_keys(two_file_paths)
        assert len(uploaded_files) == 2
        assert uploaded_files[0] == get_local_path("test_file.txt")
        assert uploaded_files[1] == get_local_path("test_file2.txt")
    finally:
        WebElement._upload = original_upload_func
