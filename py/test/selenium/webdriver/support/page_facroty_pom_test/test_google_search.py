from time import sleep
from selenium import webdriver
from test.selenium.webdriver.support.page_facroty_pom_test.google_search_page import GoogleSearchPage
from test.selenium.webdriver.support.page_facroty_pom_test.google_results_page import GoogleResultsPage
import unittest


class TestGoogleSearchPage(unittest.TestCase):
    CHROME_EXE = "???"
    driver = None
    url = "https://www.google.com"

    def setUp(self):
        self.driver = webdriver.Chrome(self.CHROME_EXE)
        self.driver.get(self.url)
        self.driver.maximize_window()


    def test_search_word_and_enter_first_result(self):
        gp = GoogleSearchPage(self.driver)
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
