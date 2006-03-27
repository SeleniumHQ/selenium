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

seletest.chooseSeleniumServer('localhost', 4444, "*firefox", "http://localhost:4444")
suite = unittest.makeSuite(ExampleTest)
unittest.TextTestRunner(verbosity=2).run(suite)
