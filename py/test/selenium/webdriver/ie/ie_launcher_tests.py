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

from selenium.webdriver import Ie
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.ie.options import Options


def test_launch_and_close_browser():
    driver = Ie()
    driver.quit()


def test_we_can_launch_multiple_ie_instances():
    driver1 = Ie()
    driver2 = Ie()
    driver3 = Ie()
    driver1.quit()
    driver2.quit()
    driver3.quit()


def test_launch_ie_do_not_affect_default_capabilities():
    expected = DesiredCapabilities.INTERNETEXPLORER.copy()
    driver = Ie()
    actual = DesiredCapabilities.INTERNETEXPLORER.copy()
    driver.quit()
    assert actual == expected


def test_launch_ie_with_options(pages):
    opts = Options()
    expected = "clicks.html"
    opts.initial_browser_url = pages.url(expected)
    driver = Ie(options=opts)
    actual = driver.current_url
    driver.quit()
    assert expected in actual
