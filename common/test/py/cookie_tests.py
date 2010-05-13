import datetime
import time
import unittest
from selenium.common_tests import utils
from selenium.common_tests.utils import require_online


class CookieTest(unittest.TestCase):

    def setUp(self):
        self.driver.get("http://localhost:%d/simpleTest.html" %
            self.webserver.port)
        timestamp = time.mktime(datetime.datetime.now().timetuple()) + 100
        self.COOKIE_A = {"name": "foo",
                         "value": "bar",
                         "expires": str(int(timestamp)) + "000",
                         "domain": "localhost",
                         "path": "/",
                         "secure": False}

    def testAddCookie(self):
        self.driver.add_cookie(utils.convert_cookie_to_json(self.COOKIE_A))
        cookie_returned = self.driver.get_cookies()[0]

        # The FF driver does not return the "expires" (or "expiry") key
        expected_cookie = self.COOKIE_A.copy()
        expected_cookie.pop("expires", None)
        self.assertEquals(expected_cookie, cookie_returned)

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
