# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License")
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http:#www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import time
import unittest
import pytest


class WindowTests(unittest.TestCase):

    @pytest.mark.ignore_chrome
    @pytest.mark.ignore_opera
    @pytest.mark.ignore_ie
    def testShouldMaximizeTheWindow(self):
        self.driver.set_window_size(200, 200)
        # TODO convert to WebDriverWait
        time.sleep(0.5);
            
        size = self.driver.get_window_size()
                
        self.driver.maximize_window()
        # TODO convert to WebDriverWait
        time.sleep(0.5)
                                
        new_size = self.driver.get_window_size()
        assert new_size["width"] > size["width"]
        assert new_size["height"] > size["height"]
        
    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)

    def _loadSimplePage(self):
        self._loadPage("simpleTest")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

