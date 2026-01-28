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

from conftest import Driver

from selenium.webdriver.firefox.firefox_profile import FirefoxProfile


def test_profile_is_used(request, server):
    ff_profile = FirefoxProfile()
    ff_profile.set_preference("browser.startup.page", "1")
    try:
        driver = Driver("firefox", request)
        driver._server = server
        driver.options.profile = ff_profile
        browser = driver.driver
        assert "browser/content/blanktab.html" in browser.current_url
    finally:
        driver.stop_driver()
