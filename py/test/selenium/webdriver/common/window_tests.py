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

import pytest

from selenium.webdriver.support.wait import WebDriverWait


class TestWindow(object):
    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_ie
    def testShouldMaximizeTheWindow(self, driver):
        resize_timeout = 5
        wait = WebDriverWait(driver, resize_timeout)
        old_size = driver.get_window_size()
        driver.set_window_size(200, 200)
        wait.until(
            lambda dr: dr.get_window_size() != old_size if old_size["width"] != 200 and old_size["height"] != 200 else True)
        size = driver.get_window_size()
        driver.maximize_window()
        wait.until(lambda dr: dr.get_window_size() != size)
        new_size = driver.get_window_size()
        assert new_size["width"] > size["width"]
        assert new_size["height"] > size["height"]
