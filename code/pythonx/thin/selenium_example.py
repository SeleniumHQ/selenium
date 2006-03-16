import seletest
import unittest
import time
import sys

class ExampleTest(seletest.seletest_class):
	def test_something(self):
		print "selenium_example.py"
		selenium = self.seleniumField
		selenium.open("http://www.irian.at/myfaces-sandbox/inputSuggestAjax.jsf")
		selenium.verify_text_present("suggest")
		selenium.type("_idJsp0:_idJsp3", "foo")
		selenium.key_down("_idJsp0:_idJsp3", 120)
		selenium.key_press("_idJsp0:_idJsp3", 120)
		time.sleep(2)
		selenium.verify_text_present("foo1")

seletest.chooseSeleniumServer('localhost', 4444, "*firefox", "http://www.irian.at")
suite = unittest.makeSuite(ExampleTest)
unittest.TextTestRunner(verbosity=2).run(suite)
