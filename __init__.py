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

FIREFOX = "firefox"
IE = "ie"
CHROME = "chrome"
REMOTE = "remote"

# Backward compatiblity (until I find someone who's better at me with setup.py
# this stays)
from selenium.selenium import selenium

def get_driver(name, *args, **kw):
    try:
        # __import__ returns the top level module
        top = __import__("selenium.%s.webdriver" % name)
        wd = getattr(getattr(top, name), "webdriver")
    except (ImportError, AttributeError):
        raise ValueError("There's no driver for `%s` browser" % name)

    return wd.WebDriver(*args, **kw)
