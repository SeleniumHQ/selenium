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

from selenium import selenium
import unittest


class TestDefaultServer(unittest.TestCase):

    seleniumHost = 'localhost'
    seleniumPort = str(4444)
    # browserStartCommand = "c:\\program files\\internet explorer\\iexplore.exe"
    browserStartCommand = "*firefox"
    browserURL = "http://localhost:4444"

    def setUp(self):
        print("Using selenium server at " + self.seleniumHost + ":" + self.seleniumPort)
        self.selenium = selenium(self.seleniumHost, self.seleniumPort, self.browserStartCommand, self.browserURL)
        self.selenium.start()

    def testLinks(self):
        selenium = self.selenium
        selenium.open("/selenium-server/tests/html/test_click_page1.html")
        self.failUnless(selenium.get_text("link").find("Click here for next page") != -1, "link 'link' doesn't contain expected text")
        links = selenium.get_all_links()
        self.failUnless(len(links) > 3)
        self.assertEqual("linkToAnchorOnThisPage", links[3])
        selenium.click("link")
        selenium.wait_for_page_to_load(5000)
        self.failUnless(selenium.get_location().endswith("/selenium-server/tests/html/test_click_page2.html"))
        selenium.click("previousPage")
        selenium.wait_for_page_to_load(5000)
        self.failUnless(selenium.get_location().endswith("/selenium-server/tests/html/test_click_page1.html"))

    def tearDown(self):
        self.selenium.stop()

if __name__ == "__main__":
    unittest.main()
