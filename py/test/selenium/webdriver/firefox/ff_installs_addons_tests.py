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
import zipfile

from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait

extensions = os.path.abspath("../../../../../../test/extensions/")


def test_install_uninstall_signed_addon_xpi(driver, pages):
    extension = os.path.join(extensions, "webextensions-selenium-example.xpi")

    id = driver.install_addon(extension)
    assert id == "webextensions-selenium-example@example.com"

    pages.load("blank.html")
    injected = WebDriverWait(driver, timeout=2).until(
        lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
    )
    assert injected.text == "Content injected by webextensions-selenium-example"

    driver.uninstall_addon(id)
    driver.refresh()
    assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0


def test_install_uninstall_signed_addon_zip(driver, pages):
    extension = os.path.join(extensions, "webextensions-selenium-example.zip")

    id = driver.install_addon(extension)
    assert id == "webextensions-selenium-example@example.com"

    pages.load("blank.html")
    injected = WebDriverWait(driver, timeout=2).until(
        lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
    )
    assert injected.text == "Content injected by webextensions-selenium-example"

    driver.uninstall_addon(id)
    driver.refresh()
    assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0


def test_install_uninstall_unsigned_addon_zip(driver, pages):
    extension = os.path.join(extensions, "webextensions-selenium-example-unsigned.zip")

    id = driver.install_addon(extension, temporary=True)
    assert id == "webextensions-selenium-example@example.com"

    pages.load("blank.html")
    injected = WebDriverWait(driver, timeout=2).until(
        lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
    )
    assert injected.text == "Content injected by webextensions-selenium-example"

    driver.uninstall_addon(id)
    driver.refresh()
    assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0


def test_install_uninstall_signed_addon_dir(driver, pages):
    zip = os.path.join(extensions, "webextensions-selenium-example.zip")

    target = os.path.join(extensions, "webextensions-selenium-example")
    with zipfile.ZipFile(zip, "r") as zip_ref:
        zip_ref.extractall(target)

    id = driver.install_addon(target)
    assert id == "webextensions-selenium-example@example.com"

    pages.load("blank.html")
    injected = WebDriverWait(driver, timeout=2).until(
        lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
    )
    assert injected.text == "Content injected by webextensions-selenium-example"

    driver.uninstall_addon(id)
    driver.refresh()
    assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0


def test_install_uninstall_unsigned_addon_dir(driver, pages):
    zip = os.path.join(extensions, "webextensions-selenium-example-unsigned.zip")
    target = os.path.join(extensions, "webextensions-selenium-example-unsigned")
    with zipfile.ZipFile(zip, "r") as zip_ref:
        zip_ref.extractall(target)

    id = driver.install_addon(target, temporary=True)
    assert id == "webextensions-selenium-example@example.com"

    pages.load("blank.html")
    injected = WebDriverWait(driver, timeout=2).until(
        lambda dr: dr.find_element(By.ID, "webextensions-selenium-example")
    )
    assert injected.text == "Content injected by webextensions-selenium-example"

    driver.uninstall_addon(id)
    driver.refresh()
    assert len(driver.find_elements(By.ID, "webextensions-selenium-example")) == 0
