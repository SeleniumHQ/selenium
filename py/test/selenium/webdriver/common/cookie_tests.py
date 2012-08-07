import calendar
import time
import unittest
import random
import pytest
from selenium.test.selenium.webdriver.common import utils


class CookieTest(unittest.TestCase):

    def setUp(self):
        self._loadPage("simpleTest")
        # Set the cookie to expire in 30 minutes
        timestamp = calendar.timegm(time.gmtime()) + (30 * 60)
        self.COOKIE_A = {"name": "foo",
                         "value": "bar",
                         "path": "/",
                         "secure": False}

    def tearDown(self):
        self.driver.delete_all_cookies()

    def testAddCookie(self):
        self.driver.execute_script("return document.cookie")
        self.driver.add_cookie(self.COOKIE_A)
        cookie_returned = str(self.driver.execute_script("return document.cookie"))
        self.assertTrue(self.COOKIE_A["name"] in cookie_returned)

    def testAddingACookieThatExpiredInThePast(self):
        if self.driver.name == 'internet explorer':
            pytest.skip("Issue needs investigating")
        cookie = self.COOKIE_A.copy()
        cookie["expiry"] = calendar.timegm(time.gmtime()) - 1
        self.driver.add_cookie(cookie)
        cookies = self.driver.get_cookies()
        self.assertEquals(0, len(cookies))
       

    def testDeleteAllCookie(self):
        self.driver.add_cookie(utils.convert_cookie_to_json(self.COOKIE_A))
        self.driver.delete_all_cookies()
        self.assertFalse(self.driver.get_cookies())

    def testDeleteCookie(self):
        self.driver.add_cookie(utils.convert_cookie_to_json(self.COOKIE_A))
        self.driver.delete_cookie("foo")
        self.assertFalse(self.driver.get_cookies())

    def testShouldGetCookieByName(self): 
        key = "key_%d" % int(random.random()*10000000)
        self.driver.execute_script("document.cookie = arguments[0] + '=set';", key)

        cookie = self.driver.get_cookie(key)
        self.assertEquals("set", cookie["value"])

    def testGetAllCookies(self):
        key1 = "key_%d" % int(random.random()*10000000)
        key2 = "key_%d" % int(random.random()*10000000)
    
        cookies = self.driver.get_cookies()
        count = len(cookies)
    
        one = {"name" :key1,
               "value": "value"}
        two = {"name":key2,
               "value": "value"}
    
        self.driver.add_cookie(one)
        self.driver.add_cookie(two)
    
        self._loadPage("simpleTest")
        cookies = self.driver.get_cookies()
        self.assertEquals(count + 2, len(cookies))
    
    def testShouldNotDeleteCookiesWithASimilarName(self):
        cookieOneName = "fish"
        cookie1 = {"name" :cookieOneName,
                    "value":"cod"}
        cookie2 = {"name" :cookieOneName + "x",
                    "value": "earth"}
        self.driver.add_cookie(cookie1)
        self.driver.add_cookie(cookie2)

        self.driver.delete_cookie(cookieOneName)
        cookies = self.driver.get_cookies()

        self.assertFalse(cookie1["name"] == cookies[0]["name"], msg=str(cookies))
        self.assertEquals(cookie2["name"] , cookies[0]["name"], msg=str(cookies))
    

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)
