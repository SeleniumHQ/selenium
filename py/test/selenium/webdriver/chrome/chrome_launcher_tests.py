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

import unittest
import logging
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities


class ChromeLauncherTests (unittest.TestCase):

    def testLaunchAndCloseBrowser(self):
        self.webdriver = webdriver.Chrome()
        self.webdriver.quit()

    def test_we_can_launch_multiple_chrome_instances(self):
        self.webdriver1 = webdriver.Chrome()
        self.webdriver2 = webdriver.Chrome()
        self.webdriver3 = webdriver.Chrome()
        self.webdriver1.quit()
        self.webdriver2.quit()
        self.webdriver3.quit()

    def test_launch_chrome_do_not_affect_default_capabilities(self):
        expected = DesiredCapabilities.CHROME.copy()
        self.webdriver1 = webdriver.Chrome()
        actual = DesiredCapabilities.CHROME.copy()
        self.webdriver1.quit()
        assert actual == expected


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    unittest.main()
