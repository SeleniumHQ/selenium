from selenium.webdriver.remote.command import Command

class ApplicationCache(object):

    UNCACHED = 0
    IDLE = 1
    CHECKING = 2
    DOWNLOADING = 3
    UPDATE_READY = 4
    OBSOLETE = 5
    
    def __init__(self, driver):
        self.driver = driver

    @property
    def status(self):
        return self.driver.execute(Command.GET_APP_CACHE_STATUS)['value']
