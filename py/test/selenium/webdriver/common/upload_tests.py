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

from selenium.webdriver.common.by import By


import os


def test_can_upload_file(driver, pages):

    pages.load("upload.html")
    current_dir = os.path.dirname(os.path.realpath(__file__))
    driver.find_element(By.ID, 'upload').send_keys(os.path.join(current_dir, "test_file.txt"))
    driver.find_element(By.ID, 'go').click()
    driver.switch_to.frame(driver.find_element(By.ID, "upload_target"))
    body = driver.find_element(By.CSS_SELECTOR, "body").text

    assert "test_file.txt" in body


def test_can_upload_two_files(driver, pages):

    pages.load("upload.html")
    current_dir = os.path.dirname(os.path.realpath(__file__))
    driver.find_element(By.ID, 'upload')\
        .send_keys(
            os.path.join(current_dir, "test_file.txt") + "\n" + os.path.join(current_dir, "test_file2.txt")
    )
    driver.find_element(By.ID, 'go').click()
    driver.switch_to.frame(driver.find_element(By.ID, "upload_target"))
    body = driver.find_element(By.CSS_SELECTOR, "body").text

    assert "test_file.txt" in body
    assert "test_file2.txt" in body
