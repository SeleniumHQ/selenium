# This is an auto-generated stub for selenium.webdriver. DO NOT EDIT.
# ruff: noqa: F401, F821, I001, UP037, RUF100

from typing import TYPE_CHECKING

# Expose runtime version
__version__: str

if TYPE_CHECKING:
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
    from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.common.options import Options
    from selenium.webdriver.common.proxy import Proxy
    from selenium.webdriver.common.service import Service
    from selenium.webdriver.remote.webdriver import WebDriver

# Lazy imports (forward references)
ActionChains: "ActionChains"
Chrome: "WebDriver"
ChromeOptions: "Options"
ChromeService: "Service"
ChromiumEdge: "WebDriver"
DesiredCapabilities: "DesiredCapabilities"
Edge: "WebDriver"
EdgeOptions: "Options"
EdgeService: "Service"
Firefox: "WebDriver"
FirefoxOptions: "Options"
FirefoxProfile: "FirefoxProfile"
FirefoxService: "Service"
Ie: "WebDriver"
IeOptions: "Options"
IeService: "Service"
Keys: "Keys"
Proxy: "Proxy"
Remote: "WebDriver"
Safari: "WebDriver"
SafariOptions: "Options"
SafariService: "Service"
WPEWebKit: "WebDriver"
WPEWebKitOptions: "Options"
WPEWebKitService: "Service"
WebKitGTK: "WebDriver"
WebKitGTKOptions: "Options"
WebKitGTKService: "Service"
