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

import ctypes
import re
from os import environ, pathsep
from os.path import dirname, abspath

try:
    from selenium.common.exceptions import NoSuchElementException
except (ImportError, ValueError):
    class NoSuchElementException(Exception):
        pass

try:
    from selenium.common.exceptions import ErrorInResponseException
except (ImportError, ValueError):
    class ErrorInResponseException(Exception):
        pass

# Taken from errorcodes.h
_ERRORS = (
    "SUCCESS",
    "EINDEXOUTOFBOUNDS",
    "ENOCOLLECTION",
    "ENOSTRING",
    "ENOSTRINGLENGTH",
    "ENOSTRINGWRAPPER",
    "ENOSUCHDRIVER",
    "ENOSUCHELEMENT",
    "ENOSUCHFRAME",
    "ENOTIMPLEMENTED",
    "EOBSOLETEELEMENT",
    "EELEMENTNOTDISPLAYED",
    "EELEMENTNOTENABLED",
    "EUNHANDLEDERROR",
    "EEXPECTEDERROR",
    "EELEMENTNOTSELECTED",
    "ENOSUCHDOCUMENT",
    "EUNEXPECTEDJSERROR",
    "ENOSCRIPTRESULT",
    "EUNKNOWNSCRIPTRESULT",
    "ENOSUCHCOLLECTION",
    "ETIMEOUT",
    "ENULLPOINTER",
    "ENOSUCHWINDOW",
)

def _load_library():
    # We assume the DLL is next to the driver, the build (setup.py) should take
    # care of it (it currently doesn't)
    old_path = environ["PATH"]
    environ["PATH"] = pathsep.join([environ["PATH"], abspath(dirname(__file__))])
    try:
        return ctypes.cdll.LoadLibrary("InternetExplorerDriver.dll")
    finally:
        environ["PATH"] = old_path

_DLL = _load_library()

class _StringWrapper(ctypes.Structure):
    _fields_ = [
        ("text", ctypes.c_wchar_p),
    ]

class WebDriverError(ErrorInResponseException):
    def __init__(self, funcname, args, error):
        self.funcname = funcname
        self.args = args

        if error >= len(_ERRORS):
            self.error = "UNKNOWN"
        else:
            self.error = _ERRORS[error]

    def __repr__(self):
        return "<WebDriverError> `%s(%s)` -> %s" % \
                (self.funcname, self.args, self.error)
    __str__ = __repr__


def _call(funcname, *args):
    func = getattr(_DLL, funcname)
    v = func(*args)

    if v == 0:
        return

    raise WebDriverError(funcname, args, v)

class DllWrapper(object):
    _free_func = None

    def __init__(self, ptr):
        self._ptr = ptr

    def _call(self, funcname, *args):
        _call(funcname, *((self._ptr, ) + args))

    def _extract_string(self, voidp):
        result = ctypes.cast(voidp, ctypes.POINTER(_StringWrapper))
        return result.contents.text

    def _get_string(self, funcname, *args):
        # FIXME: Are we leaking here?
        voidp = ctypes.c_void_p()
        args += (ctypes.byref(voidp),)
        self._call(funcname, *args)

        return self._extract_string(voidp)

    def _free(self):
        try:
            self._call(self._free_func)
        except:
            pass

#     FIXME: Make this work
#     def __del__(self):
#         _free()


class WebElement(DllWrapper):
    _free_func = "wdeFreeElement"

    def __init__(self, ptr, driver):
        super(WebElement, self).__init__(ptr)
        self._driver = driver

    def click(self):
        self._call("wdeClick")

    def get_attribute(self, attr):
        attr = ctypes.create_unicode_buffer(attr)
        return self._get_string("wdeGetAttribute", attr)

    def get_value_of_css_property(self, name):
        name = ctypes.create_unicode_buffer(name)
        return self._get_string("wdeGetValueOfCssProperty", name)

    def get_text(self):
        return self._get_string("wdeGetText")

    def get_value(self):
        if self.get_tag_name() in ("textarea", "option"):
            return self.get_text()
        return self.get_attribute("value")

    def get_tag_name(self):
        return self._get_string("wdeGetTagName")

    def is_selected(self):
        result = ctypes.c_int()
        self._call("wdeIsSelected", ctypes.byref(result))

        return result.value

    def set_selected(self):
        self._call("wdeSetSelected")

    def toggle(self):
        result = ctypes.c_int()
        self._call("wdeToggle", ctypes.byref(result))

        return result.value

    def is_enabled(self):
        result = ctypes.c_int()
        self._call("wdeIsEnabled", ctypes.byref(result))

        return result.value

    def is_displayed(self):
        result = ctypes.c_int()
        self._call("wdeIsDisplayed", ctypes.byref(result))

        return result.value

    def send_keys(self, text):
        text = ctypes.create_unicode_buffer(text)
        self._call("wdeSendKeys", text)

    def clear(self):
        self._call("wdeClear")

    def submit(self):
        self._call("wdeSubmit")

class WebDriver(DllWrapper):
    _free_func = "wdFreeDriver"
    name = "IE"

    def __init__(self):
        ptr = ctypes.c_void_p()
        _call("wdNewDriverInstance", ctypes.byref(ptr))

        super(WebDriver, self).__init__(ptr)

    def get(self, url):
        url = ctypes.create_unicode_buffer(url)
        self._call("wdGet", url)

    def back(self):
        self._call("wdGoBack")

    def forward(self):
        self._call("wdGoForward")

    def close(self):
        self._call("wdClose")

    def get_visible(self):
        visible = ctypes.c_int()
        self._call("wdGetVisible", ctypes.byref(visible))
        return visible.value

    def set_visible(self, visible):
        visible = ctypes.c_int(visible)
        self._call("wdSetVisible", visible)

    def get_current_url(self):
        return self._get_string("wdGetCurrentUrl")

    def get_title(self):
        return self._get_string("wdGetTitle")

    def get_page_source(self):
        return self._get_string("wdGetPageSource")

    def get_cookies(self):
        return self._get_string("wdGetCookies")

    def add_cookie(self, cookie):
        buf = ctypes.create_unicode_buffer(cookie)
        self._call("wdAddCookie", buf)

    def switch_to_active_element(self):
        voidp = ctypes.c_void_p()
        self._call("wdSwitchToActiveElement", ctypes.byref(voidp))
        return WebElement(voidp, self)

    def switch_to_window(self, name):
        buf = ctypes.create_unicode_buffer(unicode(name))
        self._call("wdSwitchToWindow", buf)

    def switch_to_frame(self, name):
        buf = ctypes.create_unicode_buffer(unicode(name))
        self._call("wdSwitchToFrame", buf)

    def wait_for_load_complete(self):
        self._call("wdWaitForLoadToComplete")

    def get_window_handles(self):
        dll = _DLL
        handles = ctypes.c_void_p()
        self._call("wdGetAllWindowHandles", ctypes.byref(handles))

        size = ctypes.c_int()
        _call("wdcGetStringCollectionLength", handles, ctypes.byref(size))

        result = []
        for i in xrange(size.value):
            sw = ctypes.c_void_p()
            _call("wdcGetElementAtIndex", handles, ctypes.c_int(i), ctypes.byref(sw))
            result.append(self._extract_string(sw))

        _call("wdFreeStringCollection", handles);

        return result

    def get_current_window_handle(self):
        return self._get_string("wdGetCurrentWindowHandle")

    def _find_one(self, funcname, expr, element=None):
        result = ctypes.c_void_p()
        expr = ctypes.create_unicode_buffer(expr)
        if element:
            element = element._ptr

        try:
            self._call(funcname, element, expr, ctypes.byref(result))
        except WebDriverError, e:
            if e.error == "ENOSUCHELEMENT":
                raise NoSuchElementException(expr)
            else:
                raise

        return WebElement(result, self)

    def _find_all(self, funcname, expr, element=None):
        expr = ctypes.create_unicode_buffer(expr)
        ec = ctypes.c_void_p()
        if element:
            element = element._ptr

        try:
            self._call(funcname, element, expr, ctypes.byref(ec))
        except WebDriverError, e:
            if e.error == "ENOSUCHELEMENT":
                raise NoSuchElementException(expr)
            else:
                raise

        size = ctypes.c_int()
        _call("wdcGetElementCollectionLength", ec, ctypes.byref(size))

        elements = []
        for i in xrange(size.value):
            ptr = ctypes.c_void_p()
            # FIXME: Check return value
            _call("wdcGetElementAtIndex",
                  ec,
                  ctypes.c_int(i),
                  ctypes.byref(ptr))
            elements.append(WebElement(ptr, self))

        return elements

    def _parse_script_args(self, args):
        dll = _DLL
        ptr = ctypes.c_void_p()
        max_length = ctypes.c_int(len(args)) # FIXME: Is this the right length?
        _call("wdNewScriptArgs", ctypes.byref(ptr), max_length)
        converion = {
                str : (ctypes.create_unicode_buffer, "wdAddStringScriptArg"),
                unicode : (ctypes.create_unicode_buffer, "wdAddStringScriptArg"),
                bool : (ctypes.c_int, "wdAddBooleanScriptArg"),
                float : (ctypes.c_double, "wdAddDoubleScriptArg"),
                int : (ctypes.c_long, "wdAddNumberScriptArg"),
                long : (ctypes.c_long, "wdAddNumberScriptArg"),
        }

        for i, arg in enumerate(args):
            convert, func = converion.get(type(arg), (None, None))
            if not convert:
                if isinstance(arg, WebElement):
                    convert, func = lambda x: x._ptr, "wdAddElementScriptArg"
                else:
                    message = "Unknown type for argument number %d - %s" % \
                              (i + 1, type(arg))
                    raise ValueError(message)
            _arg = convert(arg)
            _call(func, ptr, _arg)

        return ptr

    def _parse_script_result(self, ptr):
        dll = _DLL

        restype = ctypes.c_int()
        _call("wdGetScriptResultType", ptr, ctypes.byref(restype))
        restype = restype.value

        # See webdriver.cpp
        # FIXME: I'm *guessing* 6 is a string, see wdExecuteScript in
        # webdriver.cpp
        if restype in (1, 6): # String
            voidp = ctypes.c_void_p()
            _call("wdGetStringScriptResult", ptr, ctypes.byref(voidp))
            return self._extract_string(voidp)
        elif restype == 2: # Integer
            n = ctypes.c_int()
            _call("wdGetNumberScriptResult", ptr, ctypes.byref(n))
            return n.value
        elif restype == 3: # Boolean
            n = ctypes.c_int()
            _call("wdGetBooleanScriptResult", ptr, ctypes.byref(n))
            return bool(n)
        elif restype == 4: # WebElement
            element = ctypes.c_void_p()
            _call("wdGetElementScriptResult" ,ptr, ctypes.byref(element))
            return WebElement(ptr, self)
        elif restype == 5: # FIXME: None?
            return None
        elif restype == 7: # Double
            n = ctypes.c_double()
            _call("wdGetDoubleScriptResult", ptr, ctypes.byref(n))
            return n.value
        else:
            raise ValueError("Unknown result type - %d" % restype)

    def execute_script(self, script, *args):
        dll = _DLL

        result = ctypes.c_void_p()

        script = "(function() { return function(){" + script + "};})();";
        script = ctypes.create_unicode_buffer(script)

        args = self._parse_script_args(args)
        try:
            self._call("wdExecuteScript", script, args, ctypes.byref(result))
        finally:
            _call("wdFreeScriptArgs", args)

        try:
            value = self._parse_script_result(result)
            return value
        finally:
            _call("wdFreeScriptResult", result)

    def save_screenshot(self, png_file):
        raise NotImplementedError

    def quit(self):
        self._free()

def _setup_finders():
    def sub(m):
        low, upper = m.group()
        return low + "_" + upper.lower()

    def py_name(name):
        # wdFindElementById -> find_element_by_id
        name = re.sub("([a-z][A-Z])", sub,  name)
        return name[3:].lower()

    names = (
        "wdFindElementById",
        "wdFindElementsById",
        "wdFindElementByClassName",
        "wdFindElementsByClassName",
        "wdFindElementByLinkText",
        "wdFindElementsByLinkText",
        "wdFindElementByPartialLinkText",
        "wdFindElementsByPartialLinkText",
        "wdFindElementByName",
        "wdFindElementsByName",
        "wdFindElementByTagName",
        "wdFindElementsByTagName",
        "wdFindElementByXPath",
        "wdFindElementsByXPath",
    )

    def make_driver_method(name):
        if "Elements" in name:
            def method(self, expr):
                return self._find_all(name, expr)
        else:
            def method(self, expr):
                return self._find_one(name, expr)

        return method

    def make_element_method(name):
        if "Elements" in name:
            def method(self, expr):
                return self._driver._find_all(name, expr, self)
        else:
            def method(self, expr):
                return self._driver._find_one(name, expr, self)

        return method

    for name in names:
        py = py_name(name)
        setattr(WebDriver, py, make_driver_method(name))
        setattr(WebElement, py, make_element_method(name))

_setup_finders()

def _test():
    wd = WebDriver()
    wd.get("http://www.google.com")
    wd.wait_for_load_complete()
    print wd.get_current_url()
    q = wd.find_element_by_name("q")
    q.send_keys("Sauce Labs\n")
    wd.wait_for_load_complete()


if __name__ == "__main__":
    _test()
