"""
Copyright 2006 ThoughtWorks, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
import seletest
import unittest
import time
import sys

class ExampleTest(seletest.seletest_class):
	
	def test_real_deal(self):
		selenium = self.seleniumField
		selenium.open("/selenium-server/tests/html/test_click_page1.html")
		self.failUnless(selenium.get_text("link").find("Click here for next page") != -1, "link 'link' doesn't contain expected text")
		links = selenium.get_all_links()
		self.failUnless(len(links) > 3)
		self.assertEqual("linkToAnchorOnThisPage", links[3])
		selenium.click("link")
		selenium.wait_for_page_to_load(5000)
		selenium.assert_location("/selenium-server/tests/html/test_click_page2.html")
		selenium.click("previousPage")
		selenium.wait_for_page_to_load(5000)
		selenium.assert_location("/selenium-server/tests/html/test_click_page1.html")

if __name__ == "__main__":
	seletest.chooseSeleniumServer('localhost', 4444, "*firefox", "http://localhost:4444")
	unittest.main()
