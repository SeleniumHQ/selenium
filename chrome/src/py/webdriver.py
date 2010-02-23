# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

__all__ = [ "WebDriver", "WebDriverError", "NoSuchElementException" ]

from __future__ import with_statement

try:
    from ..common.exceptions import NoSuchElementException
except (ImportError, ValueError):
    class NoSuchElementException(Exception):
        pass

try:
    from ..common.exceptions import ErrorInResponseException
except (ImportError, ValueError):
    class ErrorInResponseException(Exception):
        pass

from driver import ChromeDriver

import re
from collections import namedtuple

def element_id(eid):
    eid = eid[0] if isinstance(eid, list) else eid
    return eid.split("/")[-1]

Point = namedtuple("Point", ["x", "y"])
Dimension = namedtuple("Dimension", ["width", "height"])

class WebElement:
    def __init__(self, id, driver):
        self._id = id
        self._driver = driver

    def _execute(self, name, **kw):
        args = { "elementId" : self._id }
        args.update(kw)
        return self._driver._execute(name, **args)

    def click(self):
        return self._execute("clickElement")

    def get_attribute(self, attr):
        return self._execute("getElementAttribute", attribute=attr)

    def get_value_of_css_property(self, name):
        return self._execute("getElementValueOfCssProperty", css=name)

    def get_text(self):
        return self._execute("getElementText")

    def get_value(self):
        return self._execute("getElementValue")

    def get_tag_name(self):
        return self._execute("getElementTagName")

    def is_displayed(self):
        return self._execute("isElementDisplayed")

    def is_selected(self):
        return self._execute("isElementSelected")

    def set_selected(self):
        return self._execute("setElementSelected")

    def toggle(self):
        return self._execute("toggleElement")

    def is_enabled(self):
        return self._execute("isElementEnabled")

    def is_displayed(self):
        return self._execute("isElementDisplayed")

    def send_keys(self, text):
        return self._execute("sendKeysToElement", keys=list(text))

    def clear(self):
        return self._execute("clearElement")

    def submit(self):
        return self._execute("submitElement")


class WebDriver:
    name = "Chrome"

    def __init__(self):
        self._driver = ChromeDriver()
        self._driver.start()

    def _execute(self, request, **kw):
        command = kw.copy()
        command["request"] = request

        response = self._driver.execute(command)
        code = response["statusCode"]
        if code != 0:
            raise ErrorInResponseException(response)

        return response.get("value", None)

    def get(self, url):
        return self._execute("get", url=url)

    def back(self):
        return self._execute("goBack")

    def forward(self):
        return self._execute("goForward")

    def close(self):
        return self._execute("close")

    def get_current_url(self):
        return self._execute("getCurrentUrl")

    def get_title(self):
        return self._execute("getTitle")

    def get_page_source(self):
        return self._execute("getPageSource")

    def get_cookies(self):
        return self._execute("getCookies")

    def add_cookie(self, cookie):
        return self._execute("addCookie", cookie=cookie)

    def delete_cookie(self, name):
        return self._execute("deleteCookie", name=name)

    def delete_cookies(self):
        return self._execute("deleteAllCookies")

    def switch_to_active_element(self):
        eid = self._execute("getActiveElement")
        return WebElement(eid, self)

    def switch_to_window(self, name):
        self._execute("switchToWindow", windowName=name)

    def switch_to_frame(self, name):
        self._execute("switchToFrameByName", name=name)

    def wait_for_load_complete(self):
        # Interface compatibility
        return

    def get_window_handles(self):
        return self._execute("getWindowHandles")

    def get_current_window_handle(self):
        return self._execute("getCurrentWindowHandle")

    def save_screenshot(self, jpeg_file):
        image = self._execute("screenshot")
        with open(jpeg_file, "w") as fo:
            fo.write(image.decode("base64"))

    def quit(self):
        self._driver.stop()

    def execute_script(self, script, *args):
        #script = "(function() { return function(){" + script + "};})();";
        args = [self._wrap_argument(a) for a in args]
        response = self._execute("executeScript", script=script, args=args)
        if not response:
            return

        return self._unwrap_argument(response)

    def _wrap_argument(self, arg):
        if isinstance(arg, (int, long, float)):
            return { "NUMBER" : arg }
        elif isinstance(arg, (bool, NoneType)):
            return { "BOOLEAN" : bool(arg) }
        elif isinstance(arg, WebElement):
            return { "ELEMENT" : arg._id }
        elif isinstance(arg, basestring):
            return { "STRING" : arg }
        elif isinstance(arg, (list, tuple, set)):
            return [self._wrap_argument(a) for a in arg]

        raise ValueError("Unknown type - %s" % arg.__class__)

    def _unwrap_argument(self, arg):
        if isinstance(arg, list):
            return [self._unwrap_argument(a) for a in arg]

        argtype = arg["type"]
        if argtype == "NULL":
            return None
        elif argtype == "ELEMENT":
            return WebElement(self, element_id(arg["value"]))
        elif argtype == "POINT":
            return Point(arg["x"], arg["y"])
        elif argtype == "DIMENSION":
            return Dimension(arg["width"], arg["height"])
        elif argtype == "COOKIE":
            return { "name" : arg["name"], "value" : arg["value"] }
        else:
            return arg["value"]


    def _find(self, name, using, what, plural, parent=None):
        args = {
            "using" : using,
            "value" : what
        }
        if parent:
            args["id"] = parent

        result = self._execute(name, **args)

        if not result:
            raise NoSuchElementException

        elements = [WebElement(element_id(eid), self) for eid in result]
        return elements if plural else elements[0]

def _setup_finders():
    def py_name(name, plural):
        prefix = "find_elements_by" if plural else "find_element_by"
        # ClassName -> class_name
        name = re.sub("([a-z])([A-Z])", r"\1_\2", name).lower()
        
        return "%s_%s" % (prefix, name)

    def using_name(name):
        # ClassName -> class name
        return re.sub("([a-z])([A-Z])", r"\1 \2", name).lower()

    def make_driver_method(using, plural):
        name = "findElements" if plural else "findElement"
        def method(self, what):
            return self._find(name, using, what, plural)
        return method

    def make_element_method(using, plural):
        name = "findChildElements" if plural else "findChildElement"
        def method(self, what):
            return self._driver._find(name, using, what, plural, parent=self._id)
        return method

    finders = (
        "ClassName",
        "Id",
        "LinkText",
        "Name",
        "PartialLinkText"
        "TagName",
        "Xpath",
    )

    for name in finders:
        for plural in (0, 1):
            py = py_name(name, plural)
            using = using_name(name)
            setattr(WebDriver, py, make_driver_method(using, plural))
            setattr(WebElement, py, make_element_method(using, plural))

_setup_finders()

def _test():
    wd = WebDriver()
    wd.get("http://www.google.com")
    print "Current URL: %s" % wd.get_current_url()
    print "2 + 2 = %s" % wd.execute_script("return 2 + 2;")
    q = wd.find_element_by_name("q")
    q.send_keys("Sauce Labs")
    b = wd.find_element_by_name("btnG")
    b.click()
    wd.save_screenshot("google.jpg")
    print "Screenshot saved to google.jpg"
    wd.quit()

if __name__ == "__main__":
    _test()
