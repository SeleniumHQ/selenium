from selenium.webdriver.support.page_facroty import cacheable, callable_find_by as find_by
from selenium.webdriver.common.by import By

class GoogleResultsPage(object):

    _urls = find_by(how=By.CSS_SELECTOR, using="cite.iUh30", multiple=True, cacheable=True)

    def __init__(self, driver):
        self._driver = driver
        self.url = self._driver.current_url
        cacheable(lookup=self)
        print("\nPage:", self, "\nLocation:", self.url)


    def enter_first_result(self):
        self._urls()[0].click()

    def enter_last_result(self):
        self._urls()[-1].click()

    def enter_result(self, idx):
        self._urls()[idx].click()
