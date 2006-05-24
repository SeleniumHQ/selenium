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
        selenium.open("http://www.irian.at/myfaces-sandbox/inputSuggestAjax.jsf")
        self.failUnless(selenium.is_text_present("suggest"))
        
        element_id = "document.forms[0].elements[2]"
        selenium.type(element_id, "foo")
        selenium.set_cursor_position(element_id, -1)
        selenium.key_down(element_id, 120)
        selenium.key_up(element_id, 120)
        time.sleep(2)
        self.failUnless(selenium.is_text_present("regexp:foox?1"))

    def tearDown(self):
        self.selenium.stop()

if __name__ == "__main__":
    unittest.main()
