"""
The ApplicationCache implementaion.
"""

from selenium.webdriver.remote.command import Command

class ApplicationCache(object):
    """
    """

    UNCACHED = 0
    IDLE = 1
    CHECKING = 2
    DOWNLOADING = 3
    UPDATE_READY = 4
    OBSOLETE = 5
    
    def __init__(self, driver):
        """
        Creates a new Aplication Cache.

        :Args:
         - driver: The WebDriver instance which performs user actions.
        """
        self.driver = driver

    @property
    def status(self):
        """
        Returns a current status of application cache.
        """
        return self.driver.execute(Command.GET_APP_CACHE_STATUS)['value']
