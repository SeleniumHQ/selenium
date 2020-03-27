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

from selenium.common.exceptions import WebDriverException


@pytest.fixture
def cookie(webserver):
    cookie = {
        'name': 'foo',
        'value': 'bar',
        'domain': webserver.host,
        'path': '/',
        'secure': False}
    return cookie


@pytest.fixture
def same_site_cookie_strict(webserver):
    same_site_cookie_strict = {
        'name': 'foo',
        'value': 'bar',
        'path': '/',
        'domain': webserver.host,
        'sameSite': 'Strict',
        'secure': False}
    return same_site_cookie_strict


@pytest.fixture
def same_site_cookie_lax(webserver):
    same_site_cookie_lax = {
        'name': 'foo',
        'value': 'bar',
        'path': '/',
        'domain': webserver.host,
        'sameSite': 'Lax',
        'secure': False}
    return same_site_cookie_lax


@pytest.fixture(autouse=True)
def pages(request, driver, pages):
    pages.load('simpleTest.html')
    yield pages
    driver.delete_all_cookies()


def testAddCookie(cookie, driver):
    driver.add_cookie(cookie)
    returned = driver.execute_script('return document.cookie')
    assert cookie['name'] in returned


@pytest.mark.xfail_firefox(raises=WebDriverException,
                           reason='sameSite cookie attribute not implemented')
def testAddCookieSameSiteStrict(same_site_cookie_strict, driver):
    driver.add_cookie(same_site_cookie_strict)
    returned = driver.get_cookie('foo')
    assert returned['sameSite'] == 'Strict'


@pytest.mark.xfail_firefox(raises=WebDriverException,
                           reason='sameSite cookie attribute not implemented')
def testAddCookieSameSiteLax(same_site_cookie_lax, driver):
    driver.add_cookie(same_site_cookie_lax)
    returned = driver.get_cookie('foo')
    assert returned['sameSite'] == 'Lax'


@pytest.mark.xfail_ie
def testAddingACookieThatExpiredInThePast(cookie, driver):
    expired = cookie.copy()
    expired['expiry'] = calendar.timegm(time.gmtime()) - 1
    driver.add_cookie(expired)
    assert 0 == len(driver.get_cookies())


def testDeleteAllCookie(cookie, driver):
    driver.add_cookie(cookie)
    driver.delete_all_cookies()
    assert not driver.get_cookies()


def testDeleteCookie(cookie, driver):
    driver.add_cookie(cookie)
    driver.delete_cookie('foo')
    assert not driver.get_cookies()


def testShouldGetCookieByName(driver):
    key = 'key_{}'.format(int(random.random() * 10000000))
    driver.execute_script("document.cookie = arguments[0] + '=set';", key)
    cookie = driver.get_cookie(key)
    assert 'set' == cookie['value']


def testShouldReturnNoneWhenCookieDoesNotExist(driver):
    key = 'key_{}'.format(int(random.random() * 10000000))
    cookie = driver.get_cookie(key)
    assert cookie is None


def testGetAllCookies(cookie, driver, pages, webserver):
    cookies = driver.get_cookies()
    count = len(cookies)

    for i in range(2):
        cookie['name'] = 'key_{}'.format(int(random.random() * 10000000))
        driver.add_cookie(cookie)

    pages.load('simpleTest.html')
    assert count + 2 == len(driver.get_cookies())


def testShouldNotDeleteCookiesWithASimilarName(cookie, driver, webserver):
    cookie2 = cookie.copy()
    cookie2['name'] = '{}x'.format(cookie['name'])
    driver.add_cookie(cookie)
    driver.add_cookie(cookie2)
    driver.delete_cookie(cookie['name'])
    cookies = driver.get_cookies()
    assert cookie['name'] != cookies[0]['name']
    assert cookie2['name'] == cookies[0]['name']
