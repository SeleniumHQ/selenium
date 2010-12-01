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
from google_one_box import GoogleOneBox
from selenium.webdriver.firefox.webdriver import WebDriver

class ExampleTest2(unittest.TestCase):
    """This example shows how to use the page object pattern.
    
    For more information about this pattern, see:
    http://code.google.com/p/webdriver/wiki/PageObjects
    """
    
    def setUp(self):
        self._driver = WebDriver()

    def tearDown(self):
        self._driver.quit()

    def testSearch(self):
        google = GoogleOneBox(self._driver, "http://www.google.com")
        res = google.search_for("cheese")
        self.assertTrue(res.link_contains_match_for("Wikipedia"))

if __name__ == "__main__":
    unittest.main()
