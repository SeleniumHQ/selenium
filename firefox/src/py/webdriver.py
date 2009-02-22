import logging
import time
from webdriver_firefox.webelement import *
from webdriver_firefox.firefoxlauncher import FirefoxLauncher
from webdriver_common.exceptions import *

class WebDriver(object):
    """The main interface to use for testing,
    which represents an idealised web browser."""
    def __init__(self, profile_name="WebDriver"):
        FirefoxLauncher().LaunchBrowser(profile_name)
        self._conn = ExtensionConnection()
        self._conn.connect()

    def execute_script(self, script, *args):
        converted_args = []
        for arg in args:
            if type(arg) == WebElement:
                converted_args.append({"type": "ELEMENT", "value": arg.id})
            else:
                converted_args.append({"type": "STRING", "value": arg})
        resp = self._conn.driver_command("executeScript", script,
                                         converted_args)

        if "NULL" == resp["resultType"]:
            pass
        elif "ELEMENT" == resp["resultType"]:
            return WebElement(self, resp["response"])
        else:
            return resp["response"]

    def get(self, url):
        """Loads a web page in the current browser."""
        self._command("get", url)

    def get_current_url(self):
        """Gets the current url."""
        return self._command("getCurrentUrl")

    def get_title(self):
        """Gets the title of the current page."""
        return self._command("title")

    def find_element_by_xpath(self, xpath):
        """Finds an element by xpath."""
        try:
            elemId = self._command("selectElementUsingXPath", xpath)
            elem = WebElement(self, elemId)
        except ErrorInResponseException, e:
            self._handle_find_element_exception(e)
        return elem

    def find_element_by_link_text(self, link):
        """Finds an element by its link text.

        Returns None if the element is not a link.
        """
        try:
            elemId = self._command("selectElementUsingLink", link)
            elem = WebElement(self, elemId)
            return elem
        except ErrorInResponseException, e:
            self._handle_find_element_exception(e)


    def find_element_by_id(self, id):
        """Finds an element by its id."""
        try:
            return self.find_element_by_xpath("//*[@id=\"%s\"]" % id)
        except ErrorInResponseException, e:
            self._handle_find_element_exception(e)

    def find_element_by_name(self, name):
        """Finds and element by its name."""
        try:
            return self.find_element_by_xpath("//*[@name=\"%s\"]" % name)
        except ErrorInResponseException, e:
            self._handle_find_element_exception(e)

    def find_elements_by_xpath(self, xpath):
        """Finds all the elements for the given xpath query."""
        try:
            elemIds = self._command("selectElementsUsingXPath", xpath)
            elems = []
            if len(elemIds):
                for elemId in elemIds.split(","):
                    elem = WebElement(self, elemId)
                    elems.append(elem)
            return elems
        except ErrorInResponseException, e:
            self._handle_find_element_exception(e)

    def get_page_source(self):
        """Gets the page source."""
        return self._command("getPageSource")

    def close(self):
        """Closes the current window.
        Quit the browser if it's the last window open.
        """
        if self._conn.is_connectable():
            self._conn.driver_command("close")

    def quit(self):
        """Quits the driver and close every associated window."""
        if self._conn.is_connectable():
            self._conn.driver_command("quit")
            while self._conn.is_connectable():
                logging.debug("waiting to quit")
                time.sleep(1)

    def switch_to_window(self, windowName):
        """Switches focus to a window."""
        resp = self._command("switchToWindow", windowName)
        if not resp or "No window found" in resp:
            raise InvalidSwitchToTargetException(
                "Window %s not found" % windowName)
        self._conn.context = resp

    def switch_to_frame(self, indexOrName):
        """Switches focus to a frame by index or name."""
        self._command("switchToFrame", str(indexOrName))

    def back(self):
        """Goes back in browser history."""
        self._command("goBack")

    def forward(self):
        """Goes forward in browser history."""
        self._command("goForward")

    def _handle_find_element_exception(self, e):
        if "Unable to locate element" in e.response:
            raise NoSuchElementException(e.response)
        else:
            raise e

    def _command(self, cmd, *args):
        return self._conn.driver_command(cmd, *args)["response"]
