from webdriver_remote import utils
from webdriver_remote.remote_connection import RemoteConnection
from webdriver_common.exceptions import ErrorInResponseException

class WebElement(object):
    """Represents an HTML element.
    
    Generally, all interesting operations to do with interacting with a page
    will be performed through this interface."""
    def __init__(self, parent, id):
        self.parent = parent
        self.id = id

    def get_text(self):
        return self._get("text")

    def click(self):
        """Clicks the element."""
        self._post("click", {"id": self.id})

    def submit(self):
        """Submits a form."""
        self._post("submit", {"id": self.id})

    def get_value(self):
        """Gets the value of the element's value attribute."""
        return self._get("value")

    def clear(self):
        """Clears the text if it's a text entry element."""
        self._post("clear", {"id": self.id})

    def get_attribute(self, name):
        """Gets the attribute value."""
        return self._get("attribute/%s" % name)

    def toggle(self):
        """Toggles the element state."""
        self._post("toggle", {"id": self.id})

    def is_selected(self):
        """Whether the element is selected."""
        return self._get("selected")

    def set_selected(self):
        """Selects an elmeent."""
        self._post("selected", {"id": self.id})

    def is_enabled(self):
        """Whether the element is enabled."""
        return self._get("enabled")

    def find_element_by_id(self, id):
        """Finds element by id."""
        return self._get_elem(self._post("element/id",
                                         {"using": "id", "value": id})[0])

    def find_element_by_name(self, name):
        """Find element by name."""
        return self._get_elem(self._post("element/name",
                                         {"using": "name", "value": name})[0])

    def find_element_by_link_text(self, link_text):
        """Finds element by link text."""
        return self._get_elem(self._post(
                "element/link%20text",
                {"using": "link text", "value": link_text})[0])

    def find_element_by_xpath(self, xpath):
        """Finds element by xpath."""
        try:
            return self._get_elem(self._post(
                    "element/xpath",
                    {"using": "xpath", "value": xpath})[0])
        except ErrorInResponseException, e:
            utils.handle_find_element_exception(e)

    def find_elements_by_xpath(self, xpath):
        """Finds elements within the elements by xpath."""
        resp = self._post("elements/xpath",
                          {"using": "xpath", "value": xpath})
        elems = []
        for v in resp:
            elems.append(self._get_elem(v))
        return elems

    def send_keys(self, value):
        """Simulates typing into the element."""
        self._post("value", {"id": self.id, "value":[value]})

    def _get(self, path, *params):
        return utils.return_value_if_exists(
            self._get_root_parent()._conn.get(
                ("element/%s/" % self.id) + path, *params))

    def _post(self, path, *params):
        return utils.return_value_if_exists(
            self._get_root_parent()._conn.post(
                ("element/%s/" % self.id) + path, *params))

    def _get_elem(self, resp_value):
        return WebElement(self, resp_value.split("/")[1])

    def _get_root_parent(self):
        parent = self.parent
        while "parent" in parent.__dict__:
            parent = parent.parent
        return parent

