#!/usr/bin/env python
# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import unittest
import logging
from selenium import webdriver


class FirefoxLauncherTests (unittest.TestCase):

    def testLaunchAndCloseBrowser(self):
        self.webdriver = webdriver.Firefox()
        self.webdriver.quit()

    def testDoubleClose(self):
        self.webdriver = webdriver.Firefox()
        self.webdriver.close()
        self.webdriver.close()
        self.webdriver.quit()

    def test_we_can_launch_multiple_firefox_instances(self):
        self.webdriver1 = webdriver.Firefox()
        self.webdriver2 = webdriver.Firefox()
        self.webdriver3 = webdriver.Firefox()
        self.webdriver1.quit()
        self.webdriver2.quit()
        self.webdriver3.quit()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    unittest.main()

