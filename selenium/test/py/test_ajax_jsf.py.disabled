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

from selenium import selenium
import unittest
import sys, time

class TestAjaxJSF(unittest.TestCase):

    seleniumHost = 'localhost'
    seleniumPort = str(4444)
    #browserStartCommand = "c:\\program files\\internet explorer\\iexplore.exe"
    browserStartCommand = "*firefox"
    browserURL = "http://www.irian.at"

    def setUp(self):
        print "Using selenium server at " + self.seleniumHost + ":" + self.seleniumPort
        self.selenium = selenium(self.seleniumHost, self.seleniumPort, self.browserStartCommand, self.browserURL)
        self.selenium.start()

    def testKeyPress(self):
        selenium = self.selenium
	input_id = 'ac4'
	update_id = 'ac4update'

	selenium.open("http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html")
        selenium.key_press(input_id, 74)
	time.sleep(0.5)
        selenium.key_press(input_id, 97)
        selenium.key_press(input_id, 110)
	time.sleep(0.5)
        self.failUnless('Jane Agnews' == selenium.get_text(update_id))
        selenium.key_press(input_id, '\9')
	time.sleep(0.5)
        self.failUnless('Jane Agnews' == selenium.get_value(input_id))

    def tearDown(self):
        self.selenium.stop()

if __name__ == "__main__":
    unittest.main()