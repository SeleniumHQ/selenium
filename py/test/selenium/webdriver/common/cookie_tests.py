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
import random
import pytest

from test.selenium.webdriver.common import utils


COOKIE_A = {
    "name": "foo",
    "value": "bar",
    "path": "/",
    "secure": False}


@pytest.fixture(autouse=True)
def pages(request, driver, pages):
    pages.load("simpleTest.html")

    def fin():
        driver.delete_all_cookies()
    request.addfinalizer(fin)
    return pages


class TestCookie(object):

    def testAddCookie(self, driver):
        if driver.capabilities['browserName'] == 'phantomjs' and driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        driver.execute_script("return document.cookie")
        driver.add_cookie(COOKIE_A)
        cookie_returned = str(driver.execute_script("return document.cookie"))
        assert COOKIE_A["name"] in cookie_returned

    def testAddingACookieThatExpiredInThePast(self, driver):
        if driver.capabilities['browserName'] == 'phantomjs' and driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        if driver.name == 'internet explorer':
            pytest.skip("Issue needs investigating")
        cookie = COOKIE_A.copy()
        cookie["expiry"] = calendar.timegm(time.gmtime()) - 1
        driver.add_cookie(cookie)
        cookies = driver.get_cookies()
        assert 0 == len(cookies)

    def testDeleteAllCookie(self, driver):
        if driver.capabilities['browserName'] == 'phantomjs' and driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        driver.add_cookie(utils.convert_cookie_to_json(COOKIE_A))
        driver.delete_all_cookies()
        assert not driver.get_cookies()

    def testDeleteCookie(self, driver):
        if driver.capabilities['browserName'] == 'phantomjs' and driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        driver.add_cookie(utils.convert_cookie_to_json(COOKIE_A))
        driver.delete_cookie("foo")
        assert not driver.get_cookies()

    def testShouldGetCookieByName(self, driver):
        key = "key_%d" % int(random.random() * 10000000)
        driver.execute_script("document.cookie = arguments[0] + '=set';", key)

        cookie = driver.get_cookie(key)
        assert "set" == cookie["value"]

    def testGetAllCookies(self, driver, pages):
        if driver.capabilities['browserName'] == 'phantomjs' and driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        key1 = "key_%d" % int(random.random() * 10000000)
        key2 = "key_%d" % int(random.random() * 10000000)

        cookies = driver.get_cookies()
        count = len(cookies)

        one = {"name": key1,
               "value": "value"}
        two = {"name": key2,
               "value": "value"}

        driver.add_cookie(one)
        driver.add_cookie(two)

        pages.load("simpleTest.html")
        cookies = driver.get_cookies()
        assert count + 2 == len(cookies)

    def testShouldNotDeleteCookiesWithASimilarName(self, driver):
        if driver.capabilities['browserName'] == 'phantomjs' and driver.capabilities['version'].startswith('2.1'):
            pytest.xfail("phantomjs driver 2.1 broke adding cookies")
        cookieOneName = "fish"
        cookie1 = {"name": cookieOneName,
                   "value": "cod"}
        cookie2 = {"name": cookieOneName + "x",
                   "value": "earth"}
        driver.add_cookie(cookie1)
        driver.add_cookie(cookie2)

        driver.delete_cookie(cookieOneName)
        cookies = driver.get_cookies()

        assert cookie1["name"] != cookies[0]["name"], str(cookies)
        assert cookie2["name"] == cookies[0]["name"], str(cookies)
