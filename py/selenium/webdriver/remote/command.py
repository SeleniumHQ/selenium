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


class Command(object):
    """
    Defines constants for the standard WebDriver commands.

    While these constants have no meaning in and of themselves, they are
    used to marshal commands through a service that implements WebDriver's
    remote wire protocol:

        https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol

    """

    # Keep in sync with org.openqa.selenium.remote.DriverCommand

    NEW_SESSION = "newSession"
    DELETE_SESSION = "deleteSession"
    NEW_WINDOW = "newWindow"
    CLOSE = "close"
    QUIT = "quit"
    GET = "get"
    GO_BACK = "goBack"
    GO_FORWARD = "goForward"
    REFRESH = "refresh"
    ADD_COOKIE = "addCookie"
    GET_COOKIE = "getCookie"
    GET_ALL_COOKIES = "getCookies"
    DELETE_COOKIE = "deleteCookie"
    DELETE_ALL_COOKIES = "deleteAllCookies"
    FIND_ELEMENT = "findElement"
    FIND_ELEMENTS = "findElements"
    FIND_CHILD_ELEMENT = "findChildElement"
    FIND_CHILD_ELEMENTS = "findChildElements"
    CLEAR_ELEMENT = "clearElement"
    CLICK_ELEMENT = "clickElement"
    SEND_KEYS_TO_ELEMENT = "sendKeysToElement"
    UPLOAD_FILE = "uploadFile"
    W3C_GET_CURRENT_WINDOW_HANDLE = "w3cGetCurrentWindowHandle"
    W3C_GET_WINDOW_HANDLES = "w3cGetWindowHandles"
    SET_WINDOW_RECT = "setWindowRect"
    GET_WINDOW_RECT = "getWindowRect"
    SWITCH_TO_WINDOW = "switchToWindow"
    SWITCH_TO_FRAME = "switchToFrame"
    SWITCH_TO_PARENT_FRAME = "switchToParentFrame"
    W3C_GET_ACTIVE_ELEMENT = "w3cGetActiveElement"
    GET_CURRENT_URL = "getCurrentUrl"
    GET_PAGE_SOURCE = "getPageSource"
    GET_TITLE = "getTitle"
    W3C_EXECUTE_SCRIPT = "w3cExecuteScript"
    W3C_EXECUTE_SCRIPT_ASYNC = "w3cExecuteScriptAsync"
    GET_ELEMENT_TEXT = "getElementText"
    GET_ELEMENT_TAG_NAME = "getElementTagName"
    IS_ELEMENT_SELECTED = "isElementSelected"
    IS_ELEMENT_ENABLED = "isElementEnabled"
    GET_ELEMENT_RECT = "getElementRect"
    GET_ELEMENT_ATTRIBUTE = "getElementAttribute"
    GET_ELEMENT_PROPERTY = "getElementProperty"
    GET_ELEMENT_VALUE_OF_CSS_PROPERTY = "getElementValueOfCssProperty"
    GET_ELEMENT_ARIA_ROLE = "getElementAriaRole"
    GET_ELEMENT_ARIA_LABEL = "getElementAriaLabel"
    SCREENSHOT = "screenshot"
    ELEMENT_SCREENSHOT = "elementScreenshot"
    EXECUTE_ASYNC_SCRIPT = "executeAsyncScript"
    SET_TIMEOUTS = "setTimeouts"
    GET_TIMEOUTS = "getTimeouts"
    W3C_MAXIMIZE_WINDOW = "w3cMaximizeWindow"
    GET_LOG = "getLog"
    GET_AVAILABLE_LOG_TYPES = "getAvailableLogTypes"
    FULLSCREEN_WINDOW = "fullscreenWindow"
    MINIMIZE_WINDOW = "minimizeWindow"
    PRINT_PAGE = 'printPage'

    # Alerts
    W3C_DISMISS_ALERT = "w3cDismissAlert"
    W3C_ACCEPT_ALERT = "w3cAcceptAlert"
    W3C_SET_ALERT_VALUE = "w3cSetAlertValue"
    W3C_GET_ALERT_TEXT = "w3cGetAlertText"

    # Advanced user interactions
    W3C_ACTIONS = "actions"
    W3C_CLEAR_ACTIONS = "clearActionState"

    # Screen Orientation
    SET_SCREEN_ORIENTATION = "setScreenOrientation"
    GET_SCREEN_ORIENTATION = "getScreenOrientation"

    # Mobile
    GET_NETWORK_CONNECTION = "getNetworkConnection"
    SET_NETWORK_CONNECTION = "setNetworkConnection"
    CURRENT_CONTEXT_HANDLE = "getCurrentContextHandle"
    CONTEXT_HANDLES = "getContextHandles"
    SWITCH_TO_CONTEXT = "switchToContext"

    # Web Components
    GET_SHADOW_ROOT = "getShadowRoot"
    FIND_ELEMENT_FROM_SHADOW_ROOT = "findElementFromShadowRoot"
    FIND_ELEMENTS_FROM_SHADOW_ROOT = "findElementsFromShadowRoot"
