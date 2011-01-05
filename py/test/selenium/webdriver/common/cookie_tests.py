import calendar
import time
import unittest
from selenium.test.selenium.webdriver.common import utils
from selenium.test.selenium.webdriver.common.utils import require_online


class CookieTest(unittest.TestCase):

    def setUp(self):
        self._loadPage("simpleTest")
        # Set the cookie to expire in 30 minutes
        timestamp = calendar.timegm(time.gmtime()) + (30 * 60)
        self.COOKIE_A = {"name": "foo",
                         "value": "bar",
                         "expiry": timestamp,
                         "domain": "localhost",
                         "path": "/",
                         "secure": False}

    def testAddCookie(self):
        self.driver.add_cookie(self.COOKIE_A)
        cookie_returned = self.driver.get_cookies()[0]
        self.assertEquals(self.COOKIE_A, cookie_returned)

    def testAddingACookieThatExpiredInThePast(self):
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

    @require_online
    def testGetGoogleCookie(self):
        self.driver.get("http://www.google.com")
        cookies = self.driver.get_cookies()
        cookie = [c for c in cookies if c['name'] == 'PREF']
        self.assertTrue(len(cookie) > 0)
        self.assertEquals("PREF", cookie[0]["name"])
        self.assertTrue("google" in cookie[0]["domain"])

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

    def _pageURL(self, name):
        return "http://localhost:2310/common/%s.html" % name

