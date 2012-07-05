import unittest
from selenium.webdriver.common.by import By


class ClickTest(unittest.TestCase):

    def setUp(self):
        self._loadPage("clicks")

    def tearDown(self):
        self.driver.delete_all_cookies()

    def testAddingACookieThatExpiredInThePast(self):
        self.driver.find_element(By.ID, "overflowLink").click(); 
        self.assertEqual(self.driver.title, "XHTML Test Page")

    def testClickingALinkMadeUpOfNumbersIsHandledCorrectly(self):
        self.driver.find_element(By.LINK_TEXT, "333333").click(); 
        self.assertEqual(self.driver.title, "XHTML Test Page")

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))

    def _pageURL(self, name):
        return "http://localhost:%d/%s.html" % (self.webserver.port, name)
