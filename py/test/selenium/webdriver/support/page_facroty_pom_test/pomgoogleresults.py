from selenium.webdriver.support.page_facroty import cacheable, callable_find_by as find_by
from selenium.webdriver.common.by import By

class GoogleResultsPage(object):

    _ = find_by(how=By.CSS_SELECTOR, using="cite.iUh30", multiple=True, cacheable=True)

    def __init__(self, driver):
        cacheable(lookup=self)
        self._driver = driver
        self.url = self._driver.current_url

    def enter_first_result(self):
        self._()[0].click()
