from extensionconnection import ExtensionConnection
import webdriver

class WebElement(object):
    """Represents an HTML element. Generally, all interesting operations to do with
    interacting with a page will be performed through this interface."""

    def __init__(self, parent, id):
        self.parent = parent
        self.conn = ExtensionConnection()
        self.id = id

    def get_text(self):
        """Gets the inner text of the element."""
        return self._command("getElementText")

    def click(self):
        """Clicks the element."""
        self._command("click")

    def submit(self):
        """Submits a form."""
        self._command("submitElement")

    def get_value(self):
        """Gets the value of the element's value attribute."""
        return self._command("getElementValue")

    def clear(self):
        """Clears the text if it's a text entry element."""
        self._command("clear")

    def get_attribute(self, name):
        """Gets the attribute value."""
        return self._command("getElementAttribute", name)

    def toggle(self):
        """Toggles the element state."""
        self._command("toggleElement")

    def is_selected(self):
        """Whether the element is selected."""
        return self._command("getElementSelected")

    def set_selected(self):
        """Selects an elmeent."""
        self._command("setElementSelected")

    def is_enabled(self):
        """Whether the element is enabled."""
        if self.get_attribute("disabled"):
            return False
        else:
            # The "disabled" attribute may not exist
            return True

    def find_elements_by_xpath(self, xpath):
        """Finds elements within the elements by xpath."""
        resp = self._command("findElementsByXPath", xpath)
        elems = []
        for elemId in resp.split(","):
            elem = WebElement(self.parent, elemId)
            elems.append(elem)
        return elems

    def send_keys(self, keys_characters):
        """Simulates typing into the element."""
        self._command("sendKeys", keys_characters)

    def _command(self, _cmd, *args):
        return self.conn.element_command(_cmd, self.id, *args)
