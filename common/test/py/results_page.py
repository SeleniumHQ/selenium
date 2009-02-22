class ResultsPage(object):
    """This class models a google search result page."""
    
    def __init__(self, driver):
        self._driver = driver
        
    def is_loaded(self):
        return "/search" in self._driver.get_current_url()

    def load(self):
        raise Exception("This page shouldn't be loaded directly")

    def link_contains_match_for(self, term):
        result_section = self._driver.find_element_by_id("res")
        elements = result_section.find_elements_by_xpath(".//*[@class='l']")
        for e in elements:
            if term in e.get_text():
                return True
        return False
