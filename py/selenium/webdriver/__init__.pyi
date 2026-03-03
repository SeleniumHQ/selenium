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

"""Type stub with lazy import mapping from __init__.py."""

# ruff: noqa: F401, F821, I001, UP037, RUF100

from typing import TYPE_CHECKING, Any

# Expose runtime version
__version__: str

if TYPE_CHECKING:
    # Browser WebDrivers
    from selenium.webdriver.chrome.webdriver import WebDriver as ChromeWebDriver
    from selenium.webdriver.edge.webdriver import WebDriver as EdgeWebDriver
    from selenium.webdriver.firefox.webdriver import WebDriver as FirefoxWebDriver
    from selenium.webdriver.ie.webdriver import WebDriver as IeWebDriver
    from selenium.webdriver.safari.webdriver import WebDriver as SafariWebDriver
    from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
    from selenium.webdriver.webkitgtk.webdriver import WebDriver as WebKitGTKWebDriver
    from selenium.webdriver.wpewebkit.webdriver import WebDriver as WPEWebKitWebDriver

    # Browser Options
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.edge.options import Options as EdgeOptions
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from selenium.webdriver.ie.options import Options as IeOptions
    from selenium.webdriver.safari.options import Options as SafariOptions
    from selenium.webdriver.webkitgtk.options import Options as WebKitGTKOptions
    from selenium.webdriver.wpewebkit.options import Options as WPEWebKitOptions

    # Browser Services
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.edge.service import Service as EdgeService
    from selenium.webdriver.firefox.service import Service as FirefoxService
    from selenium.webdriver.ie.service import Service as IeService
    from selenium.webdriver.safari.service import Service as SafariService
    from selenium.webdriver.webkitgtk.service import Service as WebKitGTKService
    from selenium.webdriver.wpewebkit.service import Service as WPEWebKitService

    # Firefox profile
    from selenium.webdriver.firefox.firefox_profile import FirefoxProfile as FirefoxProfileType

    # Common utilities
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.common.proxy import Proxy

# Forward references for lazy-loaded WebDrivers
Chrome: "ChromeWebDriver"
Edge: "EdgeWebDriver"
ChromiumEdge: "EdgeWebDriver"
Firefox: "FirefoxWebDriver"
Ie: "IeWebDriver"
Safari: "SafariWebDriver"
Remote: "RemoteWebDriver"
WebKitGTK: "WebKitGTKWebDriver"
WPEWebKit: "WPEWebKitWebDriver"
FirefoxProfile: "FirefoxProfileType"
DesiredCapabilities: Any
