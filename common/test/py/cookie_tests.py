import datetime
import simplejson
import time
import unittest
from webdriver_common.webserver import SimpleWebServer
from webdriver_common_tests import utils
from webdriver_common_tests.utils import require_online

webserver = SimpleWebServer()

class CookieTest(unittest.TestCase):
    def setUp(self):
        self.driver = driver
        self.driver.get("http://localhost:%d/simpleTest.html" % webserver.port)
        timestamp = time.mktime(datetime.datetime.now().timetuple()) + 100
        self.COOKIE_A = {"name": "foo",
                         "value": "bar",
                         "expires": str(int(timestamp)) + "000",
                         "domain": "localhost",
                         "path": "/"}

    def testAddCookie(self):
        self.driver.add_cookie(self._convert_cookie_to_json(self.COOKIE_A))
        cookie_returned = self.driver.get_cookies()[0]
        self.assertEquals(self.COOKIE_A, cookie_returned)

    def testDeleteAllCookie(self):
        self.driver.add_cookie(self._convert_cookie_to_json(self.COOKIE_A))
        self.driver.delete_all_cookies()
        self.assertFalse(self.driver.get_cookies())

    def testDeleteCookie(self):
        self.driver.add_cookie(self._convert_cookie_to_json(self.COOKIE_A))
        self.driver.delete_cookie("foo")
        self.assertFalse(self.driver.get_cookies())

    @require_online
    def testGetGoogleCookie(self):
        self.driver.get("http://www.google.com")
        cookie = self.driver.get_cookies()
        self.assertEquals("PREF", cookie[0]["name"])
        self.assertEquals(cookie[0]["domain"], ".google.com")

    def _convert_cookie_to_json(self, cookie):
        cookie_dict = {}
        for key, value in cookie.items():
            if key == "expires":
                cookie_dict["expiry"] = int(value) * 1000
            else:
                cookie_dict[key] = value
        return simplejson.dumps(cookie_dict)
                
def run_tests(driver_):
    global driver
    driver = driver_
    utils.run_tests("cookie_tests.CookieTest", driver, webserver)
