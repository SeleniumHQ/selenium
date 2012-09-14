/*
Copyright 2007-2011 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.remote;

/**
 * An empty interface defining constants for the standard commands defined in the WebDriver JSON
 * wire protocol.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public interface DriverCommand {
  String NEW_SESSION = "newSession";
  
  String STATUS = "status";

  String CLOSE = "close";
  String QUIT = "quit";

  String GET = "get";
  String GO_BACK = "goBack";
  String GO_FORWARD = "goForward";
  String REFRESH = "refresh";

  String ADD_COOKIE = "addCookie";
  String GET_COOKIE = "getCookie";
  String GET_ALL_COOKIES = "getCookies";
  String DELETE_COOKIE = "deleteCookie";
  String DELETE_ALL_COOKIES = "deleteAllCookies";

  String FIND_ELEMENT = "findElement";
  String FIND_ELEMENTS = "findElements";
  String FIND_CHILD_ELEMENT = "findChildElement";
  String FIND_CHILD_ELEMENTS = "findChildElements";

  String CLEAR_ELEMENT = "clearElement";
  String CLICK_ELEMENT = "clickElement";
  String HOVER_OVER_ELEMENT = "hoverOverElement";
  String SEND_KEYS_TO_ELEMENT = "sendKeysToElement";
  String SEND_KEYS_TO_ACTIVE_ELEMENT = "sendKeysToActiveElement";
  String SUBMIT_ELEMENT = "submitElement";
  String UPLOAD_FILE = "uploadFile";

  String GET_CURRENT_WINDOW_HANDLE = "getCurrentWindowHandle";
  String GET_WINDOW_HANDLES = "getWindowHandles";

  String SWITCH_TO_WINDOW = "switchToWindow";
  String SWITCH_TO_FRAME = "switchToFrame";
  String GET_ACTIVE_ELEMENT = "getActiveElement";

  String GET_CURRENT_URL = "getCurrentUrl";
  String GET_PAGE_SOURCE = "getPageSource";
  String GET_TITLE = "getTitle";

  String EXECUTE_SCRIPT = "executeScript";
  String EXECUTE_ASYNC_SCRIPT = "executeAsyncScript";

  String SET_BROWSER_VISIBLE = "setBrowserVisible";
  String IS_BROWSER_VISIBLE = "isBrowserVisible";

  String GET_ELEMENT_TEXT = "getElementText";
  String GET_ELEMENT_VALUE = "getElementValue";
  String GET_ELEMENT_TAG_NAME = "getElementTagName";
  String DRAG_ELEMENT = "dragElement";
  String IS_ELEMENT_SELECTED = "isElementSelected";
  String IS_ELEMENT_ENABLED = "isElementEnabled";
  String IS_ELEMENT_DISPLAYED = "isElementDisplayed";
  String GET_ELEMENT_LOCATION = "getElementLocation";
  String GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW = "getElementLocationOnceScrolledIntoView";
  String GET_ELEMENT_SIZE = "getElementSize";
  String GET_ELEMENT_ATTRIBUTE = "getElementAttribute";
  String GET_ELEMENT_VALUE_OF_CSS_PROPERTY = "getElementValueOfCssProperty";
  String ELEMENT_EQUALS = "elementEquals";

  String SCREENSHOT = "screenshot";

  String GET_ALERT = "getAlert";
  String ACCEPT_ALERT = "acceptAlert";
  String DISMISS_ALERT = "dismissAlert";
  String GET_ALERT_TEXT = "getAlertText";
  String SET_ALERT_VALUE = "setAlertValue";

  String SET_TIMEOUT = "setTimeout";
  String IMPLICITLY_WAIT = "implicitlyWait";
  String SET_SCRIPT_TIMEOUT = "setScriptTimeout";

  String EXECUTE_SQL = "executeSQL";
  String GET_LOCATION = "getLocation";
  String SET_LOCATION = "setLocation";
  String GET_APP_CACHE = "getAppCache";
  String GET_APP_CACHE_STATUS = "getStatus";
  String CLEAR_APP_CACHE = "clearAppCache";
  String IS_BROWSER_ONLINE = "isBrowserOnline";
  String SET_BROWSER_ONLINE = "setBrowserOnline";

  String GET_LOCAL_STORAGE_ITEM = "getLocalStorageItem";
  String GET_LOCAL_STORAGE_KEYS = "getLocalStorageKeys";
  String SET_LOCAL_STORAGE_ITEM = "setLocalStorageItem";
  String REMOVE_LOCAL_STORAGE_ITEM = "removeLocalStorageItem";
  String CLEAR_LOCAL_STORAGE = "clearLocalStorage";
  String GET_LOCAL_STORAGE_SIZE = "getLocalStorageSize";

  String GET_SESSION_STORAGE_ITEM = "getSessionStorageItem";
  String GET_SESSION_STORAGE_KEYS = "getSessionStorageKey";
  String SET_SESSION_STORAGE_ITEM = "setSessionStorageItem";
  String REMOVE_SESSION_STORAGE_ITEM = "removeSessionStorageItem";
  String CLEAR_SESSION_STORAGE = "clearSessionStorage";
  String GET_SESSION_STORAGE_SIZE = "getSessionStorageSize";

  String SET_SCREEN_ORIENTATION = "setScreenOrientation";
  String GET_SCREEN_ORIENTATION = "getScreenOrientation";

  // These belong to the Advanced user interactions - an element is
  // optional for these commands.
  String CLICK = "mouseClick";
  String DOUBLE_CLICK = "mouseDoubleClick";
  String MOUSE_DOWN = "mouseButtonDown";
  String MOUSE_UP = "mouseButtonUp";
  String MOVE_TO = "mouseMoveTo";
  String SEND_KEYS_TO_SESSION = "sendKeys";

  // Those allow interactions with the Input Methods installed on
  // the system.
  String IME_GET_AVAILABLE_ENGINES = "imeGetAvailableEngines";
  String IME_GET_ACTIVE_ENGINE = "imeGetActiveEngine";
  String IME_IS_ACTIVATED = "imeIsActivated";
  String IME_DEACTIVATE = "imeDeactivate";
  String IME_ACTIVATE_ENGINE = "imeActivateEngine";

  // These belong to the Advanced Touch API
  String TOUCH_SINGLE_TAP = "touchSingleTap";
  String TOUCH_DOWN = "touchDown";
  String TOUCH_UP = "touchUp";
  String TOUCH_MOVE = "touchMove";
  String TOUCH_SCROLL = "touchScroll";
  String TOUCH_DOUBLE_TAP = "touchDoubleTap";
  String TOUCH_LONG_PRESS = "touchLongPress";
  String TOUCH_FLICK = "touchFlick";

  // Window API (beta)
  String SET_WINDOW_SIZE = "setWindowSize";
  String SET_WINDOW_POSITION = "setWindowPosition";
  String GET_WINDOW_SIZE = "getWindowSize";
  String GET_WINDOW_POSITION = "getWindowPosition";
  String MAXIMIZE_WINDOW = "maximizeWindow";

  // Logging API
  String GET_AVAILABLE_LOG_TYPES = "getAvailableLogTypes";
  String GET_LOG = "getLog";
  String GET_SESSION_LOGS = "getSessionLogs";
}
