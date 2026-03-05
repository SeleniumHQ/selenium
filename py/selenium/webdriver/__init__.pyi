# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""Type stub with lazy import mapping from __init__.py.

This stub file is necessary for type checkers and IDEs to automatically have
visibility into lazy modules since they are not imported immediately at runtime.
"""

# ruff: noqa: I001

# Expose runtime version
__version__: str

# Chrome
from selenium.webdriver.chrome.webdriver import WebDriver as Chrome
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService

# Edge
from selenium.webdriver.edge.webdriver import WebDriver as Edge
from selenium.webdriver.edge.webdriver import WebDriver as ChromiumEdge
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService

# Firefox
from selenium.webdriver.firefox.webdriver import WebDriver as Firefox
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile

# IE
from selenium.webdriver.ie.webdriver import WebDriver as Ie
from selenium.webdriver.ie.options import Options as IeOptions
from selenium.webdriver.ie.service import Service as IeService

# Safari
from selenium.webdriver.safari.webdriver import WebDriver as Safari
from selenium.webdriver.safari.options import Options as SafariOptions
from selenium.webdriver.safari.service import Service as SafariService

# Remote
from selenium.webdriver.remote.webdriver import WebDriver as Remote

# WebKitGTK
from selenium.webdriver.webkitgtk.webdriver import WebDriver as WebKitGTK
from selenium.webdriver.webkitgtk.options import Options as WebKitGTKOptions
from selenium.webdriver.webkitgtk.service import Service as WebKitGTKService

# WPEWebKit
from selenium.webdriver.wpewebkit.webdriver import WebDriver as WPEWebKit
from selenium.webdriver.wpewebkit.options import Options as WPEWebKitOptions
from selenium.webdriver.wpewebkit.service import Service as WPEWebKitService

# Common utilities
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.proxy import Proxy

# Submodules
from . import chrome
from . import chromium
from . import common
from . import edge
from . import firefox
from . import ie
from . import remote
from . import safari
from . import support
from . import webkitgtk
from . import wpewebkit

# Exposed names
__all__ = [
    # Classes
    "ActionChains",
    "Chrome",
    "ChromeOptions",
    "ChromeService",
    "ChromiumEdge",
    "DesiredCapabilities",
    "Edge",
    "EdgeOptions",
    "EdgeService",
    "Firefox",
    "FirefoxOptions",
    "FirefoxProfile",
    "FirefoxService",
    "Ie",
    "IeOptions",
    "IeService",
    "Keys",
    "Proxy",
    "Remote",
    "Safari",
    "SafariOptions",
    "SafariService",
    "WPEWebKit",
    "WPEWebKitOptions",
    "WPEWebKitService",
    "WebKitGTK",
    "WebKitGTKOptions",
    "WebKitGTKService",
    # Submodules
    "chrome",
    "chromium",
    "common",
    "edge",
    "firefox",
    "ie",
    "remote",
    "safari",
    "support",
    "webkitgtk",
    "wpewebkit",
]
