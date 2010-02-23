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

#!/usr/bin/python
import datetime
import logging
import os
import tempfile
import time
import unittest
from selenium.firefox.webdriver import WebDriver
from selenium.common.webserver import SimpleWebServer
from selenium.common_tests import utils
from selenium.firefox.firefox_profile import FirefoxProfile

WEB_SERVER_PORT = 8000
class ProfileTests(unittest.TestCase):
    DUMMY_FILE_NAME = "dummy.js"
    DUMMY_FILE_CONTENT = "# test"

    def testAnonymousProfileExample(self):
        driver = WebDriver()
        driver.get("http://localhost:%d/simpleTest.html" % WEB_SERVER_PORT)
        self.assertEquals("Hello WebDriver", driver.get_title())
        driver.quit()

    def testNamedProfile(self):
        profile = FirefoxProfile("example")
        driver = WebDriver(profile)
        driver.get("http://localhost:%d/simpleTest.html" % WEB_SERVER_PORT)
        self.assertEquals("Hello WebDriver", driver.get_title())
        driver.quit()

    def testAnonymousProfileIsFresh(self):
        driver = WebDriver()
        driver.get("http://localhost:%d/simpleTest.html" % WEB_SERVER_PORT)
        timestamp = time.mktime(datetime.datetime.now().timetuple()) + 100
        cookie = {"name": "foo",
                 "value": "bar",
                  "expires": str(int(timestamp)) + "000",
                 "domain": "localhost",
                 "path": "/"}
        driver.add_cookie(utils.convert_cookie_to_json(cookie))
        self.assertEquals(cookie, driver.get_cookies()[0])
        driver.quit()
        driver = WebDriver()
        self.assertEquals([], driver.get_cookies())
        driver.quit()

    def testCopyFromSource(self):
        dir_name = tempfile.mkdtemp()
        self._create_dummy_file(dir_name)
        profile = FirefoxProfile()
        profile.copy_profile_source(dir_name)
        profile_dir = profile.path
        dst_pref_file = open(os.path.join(profile_dir, self.DUMMY_FILE_NAME))
        content = dst_pref_file.read()
        self.assertEquals(self.DUMMY_FILE_CONTENT, content)

    def _create_dummy_file(self, dir_name):
        pref_file = open(os.path.join(dir_name, self.DUMMY_FILE_NAME), "w")
        pref_file.write(self.DUMMY_FILE_CONTENT)
        pref_file.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    webserver = SimpleWebServer(WEB_SERVER_PORT)
    webserver.start()
    try:
        unittest.main()
    finally:
        webserver.stop()


