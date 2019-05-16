from selenium.webdriver.support.page_facroty import cacheable, callable_find_by as find_by
from selenium.webdriver.common.by import By
from test.selenium.webdriver.support.page_facroty_pom_test.search_page import GoogleSearchPage

class GoogleResultsPage(GoogleSearchPage):

    _search_box = find_by(how=By.CSS_SELECTOR, using="div.a4bIc > input[name='q']", cacheable=True)
    _urls = find_by(how=By.CSS_SELECTOR, using="cite.iUh30", multiple=True, cacheable=True)

    def __init__(self, driver):
        super(GoogleResultsPage, self).__init__(driver=driver)
        self.url = self._driver.current_url
        cacheable(lookup=self)
        print("\nPage:", self, "\nLocation:", self.url)


    def enter_first_result(self):
        self._urls()[0].click()

    def enter_last_result(self):
        self._urls()[-1].click()

    def enter_result(self, idx):
        self._urls()[idx].click()

    def search_word_submit(self, word):
        super(GoogleResultsPage, self).search_word_submit(word=word)
