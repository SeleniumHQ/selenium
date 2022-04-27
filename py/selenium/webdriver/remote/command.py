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

    GET_SESSION_LOGS = "getSessionLogs"
    GET_ALL_SESSIONS = "getAllSessions"
    GET_CAPABILITIES = "getCapabilities"
    STATUS = "status"
    GET_ELEMENT_SHADOW_ROOT = "getElementShadowRoot"
    FIND_ELEMENT_FROM_SHADOW_ROOT = "findElementFromShadowRoot"
    FIND_ELEMENTS_FROM_SHADOW_ROOT = "findElementsFromShadowRoot"
    SEND_KEYS_TO_ACTIVE_ELEMENT = "sendKeysToActiveElement"
    GET_CURRENT_WINDOW_HANDLE = "getCurrentWindowHandle"
    GET_WINDOW_HANDLES = "getWindowHandles"

    GET_CURRENT_CONTEXT_HANDLE = "getCurrentContextHandle"
    GET_CONTEXT_HANDLES = "getContextHandles"

    SWITCH_TO_NEW_WINDOW = "newWindow"
    SWITCH_TO_CONTEXT = "switchToContext"
    GET_ACTIVE_ELEMENT = "getActiveElement"

    EXECUTE_SCRIPT = "executeScript"
    IS_ELEMENT_DISPLAYED = "isElementDisplayed"
    GET_ELEMENT_LOCATION = "getElementLocation"
    GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW = "getElementLocationOnceScrolledIntoView"
    GET_ELEMENT_SIZE = "getElementSize"
    GET_ELEMENT_DOM_PROPERTY = "getElementDomProperty"
    GET_ELEMENT_DOM_ATTRIBUTE = "getElementDomAttribute"
    GET_ELEMENT_ACCESSIBLE_NAME = "getElementAccessibleName"
    ELEMENT_EQUALS = "elementEquals"

    ACCEPT_ALERT = "acceptAlert"
    DISMISS_ALERT = "dismissAlert"
    GET_ALERT_TEXT = "getAlertText"
    SET_ALERT_VALUE = "setAlertValue"
    SET_ALERT_CREDENTIALS = "setAlertCredentials"

    IMPLICITLY_WAIT = "implicitlyWait"
    SET_SCRIPT_TIMEOUT = "setScriptTimeout"

    GET_LOCATION = "getLocation"
    SET_LOCATION = "setLocation"
    GET_APP_CACHE = "getAppCache"
    GET_APP_CACHE_STATUS = "getStatus"
    CLEAR_APP_CACHE = "clearAppCache"
    IS_BROWSER_ONLINE = "isBrowserOnline"
    SET_BROWSER_ONLINE = "setBrowserOnline"

    GET_LOCAL_STORAGE_ITEM = "getLocalStorageItem"
    GET_LOCAL_STORAGE_KEYS = "getLocalStorageKeys"
    SET_LOCAL_STORAGE_ITEM = "setLocalStorageItem"
    REMOVE_LOCAL_STORAGE_ITEM = "removeLocalStorageItem"
    CLEAR_LOCAL_STORAGE = "clearLocalStorage"
    GET_LOCAL_STORAGE_SIZE = "getLocalStorageSize"

    GET_SESSION_STORAGE_ITEM = "getSessionStorageItem"
    GET_SESSION_STORAGE_KEYS = "getSessionStorageKey"
    SET_SESSION_STORAGE_ITEM = "setSessionStorageItem"
    REMOVE_SESSION_STORAGE_ITEM = "removeSessionStorageItem"
    CLEAR_SESSION_STORAGE = "clearSessionStorage"
    GET_SESSION_STORAGE_SIZE = "getSessionStorageSize"

    SET_SCREEN_ORIENTATION = "setScreenOrientation"
    GET_SCREEN_ORIENTATION = "getScreenOrientation"
    SET_SCREEN_ROTATION = "setScreenRotation"
    GET_SCREEN_ROTATION = "getScreenRotation"

    # W3C Actions APIs
    ACTIONS = "actions"
    CLEAR_ACTIONS_STATE = "clearActionsState"

    # These belong to the Advanced user interactions - an element is optional for these commands
    CLICK = "mouseClick"
    DOUBLE_CLICK = "mouseDoubleClick"
    MOUSE_DOWN = "mouseButtonDown"
    MOUSE_UP = "mouseButtonUp"
    MOVE_TO = "mouseMoveTo"

    # Those allow interactions with the Input Methods installed on the system.
    IME_GET_AVAILABLE_ENGINES = "imeGetAvailableEngines"
    IME_GET_ACTIVE_ENGINE = "imeGetActiveEngine"
    IME_IS_ACTIVATED = "imeIsActivated"
    IME_DEACTIVATE = "imeDeactivate"
    IME_ACTIVATE_ENGINE = "imeActivateEngine"

    # Advanced touch API
    TOUCH_SINGLE_TAP = "touchSingleTap"
    TOUCH_DOWN = "touchDown"
    TOUCH_UP = "touchUp"
    TOUCH_MOVE = "touchMove"
    TOUCH_SCROLL = "touchScroll"
    TOUCH_DOUBLE_TAP = "touchDoubleTap"
    TOUCH_LONG_PRESS = "touchLongPress"
    TOUCH_FLICK = "touchFlick"

    # Window API
    SET_CURRENT_WINDOW_POSITION = "setWindowPosition"
    GET_CURRENT_WINDOW_POSITION = "getWindowPosition"

    # W3C compatible Window API
    SET_CURRENT_WINDOW_SIZE = "setCurrentWindowSize"
    GET_CURRENT_WINDOW_SIZE = "getCurrentWindowSize"
    MAXIMIZE_CURRENT_WINDOW = "maximizeCurrentWindow"
    MINIMIZE_CURRENT_WINDOW = "minimizeCurrentWindow"
    FULLSCREEN_CURRENT_WINDOW = "fullscreenCurrentWindow"

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

    # Virtual Authenticator
    ADD_VIRTUAL_AUTHENTICATOR = "addVirtualAuthenticator"
    REMOVE_VIRTUAL_AUTHENTICATOR = "removeVirtualAuthenticator"
    ADD_CREDENTIAL = "addCredential"
    GET_CREDENTIALS = "getCredentials"
    REMOVE_CREDENTIAL = "removeCredential"
    REMOVE_ALL_CREDENTIALS = "removeAllCredentials"
    SET_USER_VERIFIED = "setUserVerified"
