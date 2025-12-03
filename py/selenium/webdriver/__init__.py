# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

from selenium.webdriver.chrome.options import Options as ChromeOptions  # noqa
from selenium.webdriver.chrome.service import Service as ChromeService  # noqa
from selenium.webdriver.chrome.webdriver import WebDriver as Chrome  # noqa
from selenium.webdriver.common.action_chains import ActionChains  # noqa
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities  # noqa
from selenium.webdriver.common.keys import Keys  # noqa
from selenium.webdriver.common.proxy import Proxy  # noqa
from selenium.webdriver.edge.options import Options as EdgeOptions  # noqa
from selenium.webdriver.edge.service import Service as EdgeService  # noqa
from selenium.webdriver.edge.webdriver import WebDriver as ChromiumEdge  # noqa
from selenium.webdriver.edge.webdriver import WebDriver as Edge  # noqa
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile  # noqa
from selenium.webdriver.firefox.options import Options as FirefoxOptions  # noqa
from selenium.webdriver.firefox.service import Service as FirefoxService  # noqa
from selenium.webdriver.firefox.webdriver import WebDriver as Firefox  # noqa
from selenium.webdriver.ie.options import Options as IeOptions  # noqa
from selenium.webdriver.ie.service import Service as IeService  # noqa
from selenium.webdriver.ie.webdriver import WebDriver as Ie  # noqa
from selenium.webdriver.remote.webdriver import WebDriver as Remote  # noqa
from selenium.webdriver.safari.options import Options as SafariOptions
from selenium.webdriver.safari.service import Service as SafariService  # noqa
from selenium.webdriver.safari.webdriver import WebDriver as Safari  # noqa
from selenium.webdriver.webkitgtk.options import Options as WebKitGTKOptions  # noqa
from selenium.webdriver.webkitgtk.service import Service as WebKitGTKService  # noqa
from selenium.webdriver.webkitgtk.webdriver import WebDriver as WebKitGTK  # noqa
from selenium.webdriver.wpewebkit.options import Options as WPEWebKitOptions  # noqa
from selenium.webdriver.wpewebkit.service import Service as WPEWebKitService  # noqa
from selenium.webdriver.wpewebkit.webdriver import WebDriver as WPEWebKit  # noqa

__version__ = "4.39.0"

# We need an explicit __all__ because the above won't otherwise be exported.
__all__ = [
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
]
