from time import sleep
from selenium import webdriver
from test.selenium.webdriver.support.page_facroty_pom_test.pomgoogle import GooglePage
from test.selenium.webdriver.support.page_facroty_pom_test.pomgoogleresults import GoogleResultsPage
import unittest


class TestGooglePage(unittest.TestCase):
    CHROME_EXE = "???"
    driver = None
    url = "https://www.google.com"

    def setUp(self):
        self.driver = webdriver.Chrome(self.CHROME_EXE)
        self.driver.get(self.url)
        self.driver.maximize_window()


    def test_search_google_word(self):
        gp = GooglePage(self.driver)
        gp.search_word_submit("Python 3.7 Issues")
        sleep(2)
        rp = GoogleResultsPage(self.driver)
        rp.enter_first_result()
        sleep(2)


    def tearDown(self):
        if self.driver:
            self.driver.quit()


if __name__ == '__main__':
    unittest.main()
