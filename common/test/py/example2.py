import unittest
from google_one_box import GoogleOneBox
from webdriver_firefox.webdriver import WebDriver

class ExampleTest2(unittest.TestCase):
    """This example shows how to use the page object pattern.
    
    For more information about this pattern, see:
    http://code.google.com/p/webdriver/wiki/PageObjects
    """
    
    def setUp(self):
        self._driver = WebDriver()

    def tearDown(self):
        self._driver.quit()

    def testSearch(self):
        google = GoogleOneBox(self._driver, "http://www.google.com")
        res = google.search_for("cheese")
        self.assertTrue(res.link_contains_match_for("Wikipedia"))

if __name__ == "__main__":
    unittest.main()
