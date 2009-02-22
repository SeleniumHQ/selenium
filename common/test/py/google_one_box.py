from webdriver_common.exceptions import *
from results_page import ResultsPage
from page_loader import require_loaded
class GoogleOneBox(object):
    """This class models a page that has a google search bar."""
    
    def __init__(self, driver, url):
        self._driver = driver
        self._url = url
        
    def is_loaded(self):
        try :
            self._driver.find_element_by_name("q")
            return True
        except NoSuchElementException:
            return False

    def load(self):
        self._driver.get(self._url)

    @require_loaded
    def search_for(self, search_term):
        element = self._driver.find_element_by_name("q")
        element.send_keys(search_term)
        element.submit()
        return ResultsPage(self._driver)
