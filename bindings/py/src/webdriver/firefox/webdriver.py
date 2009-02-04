import re
import sys

from webelement import *

class WebDriver(object):
    """The main interface to use for testing, which represents an idealised web browser."""
    def __init__(self):
        self._conn = ExtensionConnection()

    def get(self, url):
        """Loads a web page in the current browser."""
        self._conn.driver_command("get", url)

    def get_current_url(self):
        """Gets the current url."""
        return self._conn.driver_command("getCurrentUrl")

    def get_title(self):
        """Gets the title of the current page."""
        return self._conn.driver_command("title")

    def find_element_by_xpath(self, xpath):
        """Finds an element by xpath."""
        elemId = self._conn.driver_command("selectElementUsingXPath", xpath)
        elem = WebElement(self, elemId)
        return elem

    def find_element_by_link_text(self, link):
        """Finds an element by its link text.

        Returns None if the element is not a link.
        """
        elemId = self._conn.driver_command("selectElementUsingLink", link)
        elem = WebElement(self, elemId)
        return elem

    def find_element_by_id(self, id):
        """Finds an element by its id."""
        return self.find_element_by_xpath("//*[@id=\"%s\"]" % id)

    def find_element_by_name(self, name):
        """Finds and element by its name."""
        return self.find_element_by_xpath("//*[@name=\"%s\"]" % name)

    def find_elements_by_xpath(self, xpath):
        """Finds all the elements for the given xpath query."""
        elemIds = self._conn.driver_command("selectElementsUsingXPath", xpath)
        elems = []
        if len(elemIds):
            for elemId in elemIds.split(","):
                elem = WebElement(self, elemId)
                elems.append(elem)
        return elems

    def get_page_source(self):
        """Gets the page source."""
        return self._conn.driver_command("getPageSource")

    def close(self):
        """Closes the current window, quit the browser if it's the last window open."""
        self._conn.driver_command("close")

    def quit(self):
        """Quits the driver and close every associated window."""
        self._conn.driver_command("quit")

    def switch_to_window(self, windowName):
        """Switches focus to a window."""
        resp = self._conn.driver_command("switchToWindow", windowName)
        if not resp or "No window found" in resp:
            raise exceptions.InvalidSwitchToTargetException("Window %s not found" % windowName)
        self._conn.context = resp

    def switch_to_frame(self, indexOrName):
        """Switches focus to a frame by index or name."""
        resp = self._conn.driver_command("switchToFrame", str(indexOrName))

    def back(self):
        """Goes back in browser history."""
        self._conn.driver_command("goBack")

    def forward(self):
        """Goes forward in browser history."""
        self._conn.driver_command("goForward")
