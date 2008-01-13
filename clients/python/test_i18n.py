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

class TestI18n(unittest.TestCase):
    def setUp(self):
        self.selenium = selenium("localhost", \
            4444, "*mock", "http://localhost:4444")
        self.selenium.start()
        self.selenium.open("http://localhost:4444/selenium-server/tests/html/test_i18n.html")
        
    def test_i18n(self):
        romance = u"\u00FC\u00F6\u00E4\u00DC\u00D6\u00C4 \u00E7\u00E8\u00E9 \u00BF\u00F1 \u00E8\u00E0\u00F9\u00F2"
        korean = u"\uC5F4\uC5D0"
        chinese = u"\u4E2D\u6587"
        japanese = u"\u307E\u3077"
        dangerous = "&%?\\+|,%*"
        self.verify_text("romance", romance)
        self.verify_text("korean", korean)
        self.verify_text("chinese", chinese)
        self.verify_text("japanese", japanese)
        self.verify_text("dangerous", dangerous)
    
    def verify_text(self, id, expected):
        sel = self.selenium
        self.failUnless(sel.is_text_present(expected))
        actual = sel.get_text(id)
        self.assertEqual(expected, actual)
    
    def tearDown(self):
        self.selenium.stop()

if __name__ == "__main__":
    unittest.main()
