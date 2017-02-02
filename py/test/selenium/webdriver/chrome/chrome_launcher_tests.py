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

from selenium.webdriver import Chrome
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities


def test_launch_and_close_browser():
    driver = Chrome()
    driver.quit()

def test_multiple_driver_instance_launch():
    for i in range(0,2):
        i = Chrome()
    for i in range(0,2):
        i.quit()


def test_launch_chrome_do_not_affect_default_capabilities():
    expected = DesiredCapabilities.CHROME.copy()
    driver = Chrome()
    actual = DesiredCapabilities.CHROME.copy()
    driver.quit()
    assert actual == expected
