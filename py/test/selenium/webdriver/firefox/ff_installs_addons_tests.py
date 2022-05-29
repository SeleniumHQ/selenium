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

from selenium.common.exceptions import WebDriverException


def test_install_addon_temporary(driver):
    extension = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             'webextensions-selenium-example.xpi')

    id = driver.install_addon(extension, True)
    assert id == 'webextensions-selenium-example@example.com'


def test_install_addon(driver):
    extension = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             'webextensions-selenium-example.xpi')

    id = driver.install_addon(extension, False)
    assert id == 'webextensions-selenium-example@example.com'


def test_uninstall_addon(driver):
    extension = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             'webextensions-selenium-example.xpi')

    id = driver.install_addon(extension)
    try:
        driver.uninstall_addon(id)
    except WebDriverException as exc:
        assert False, exc
