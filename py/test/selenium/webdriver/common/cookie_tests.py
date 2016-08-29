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

import calendar
import time
import unittest
import random
import pytest
from selenium.test.selenium.webdriver.common import utils


class CookieTest(unittest.TestCase):

    def setUp(self):
        self._loadPage("simpleTest")
        self.COOKIE_A = {"name": "foo",
                         "value": "bar",
                         "path": "/",
                         "secure": False}

    def tearDown(self):
        self.driver.delete_all_cookies()

    def testAddCookie(self):
        if self.driver.capabilities['browserName'] == 'phantomjs' and self.driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        self.driver.execute_script("return document.cookie")
        self.driver.add_cookie(self.COOKIE_A)
        cookie_returned = str(self.driver.execute_script("return document.cookie"))
        self.assertTrue(self.COOKIE_A["name"] in cookie_returned)

    def testAddingACookieThatExpiredInThePast(self):
        if self.driver.capabilities['browserName'] == 'phantomjs' and self.driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        if self.driver.name == 'internet explorer':
            pytest.skip("Issue needs investigating")
        cookie = self.COOKIE_A.copy()
        cookie["expiry"] = calendar.timegm(time.gmtime()) - 1
        self.driver.add_cookie(cookie)
        cookies = self.driver.get_cookies()
        self.assertEquals(0, len(cookies))

    def testDeleteAllCookie(self):
        if self.driver.capabilities['browserName'] == 'phantomjs' and self.driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        self.driver.add_cookie(utils.convert_cookie_to_json(self.COOKIE_A))
        self.driver.delete_all_cookies()
        self.assertFalse(self.driver.get_cookies())

    def testDeleteCookie(self):
        if self.driver.capabilities['browserName'] == 'phantomjs' and self.driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        self.driver.add_cookie(utils.convert_cookie_to_json(self.COOKIE_A))
        self.driver.delete_cookie("foo")
        self.assertFalse(self.driver.get_cookies())

    def testShouldGetCookieByName(self):
        key = "key_%d" % int(random.random() * 10000000)
        self.driver.execute_script("document.cookie = arguments[0] + '=set';", key)

        cookie = self.driver.get_cookie(key)
        self.assertEquals("set", cookie["value"])

    def testGetAllCookies(self):
        if self.driver.capabilities['browserName'] == 'phantomjs' and self.driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        key1 = "key_%d" % int(random.random() * 10000000)
        key2 = "key_%d" % int(random.random() * 10000000)

        cookies = self.driver.get_cookies()
        count = len(cookies)

        one = {"name": key1,
               "value": "value"}
        two = {"name": key2,
               "value": "value"}

        self.driver.add_cookie(one)
        self.driver.add_cookie(two)

        self._loadPage("simpleTest")
        cookies = self.driver.get_cookies()
        self.assertEquals(count + 2, len(cookies))

    def testShouldNotDeleteCookiesWithASimilarName(self):
        if self.driver.capabilities['browserName'] == 'phantomjs' and self.driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        cookieOneName = "fish"
        cookie1 = {"name": cookieOneName,
                   "value": "cod"}
        cookie2 = {"name": cookieOneName + "x",
                   "value": "earth"}
        self.driver.add_cookie(cookie1)
        self.driver.add_cookie(cookie2)

        self.driver.delete_cookie(cookieOneName)
        cookies = self.driver.get_cookies()

        self.assertFalse(cookie1["name"] == cookies[0]["name"], msg=str(cookies))
        self.assertEquals(cookie2["name"], cookies[0]["name"], msg=str(cookies))

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')
