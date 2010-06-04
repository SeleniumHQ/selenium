/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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
 * An empty interface defining constants for the standard commands defined in
 * the WebDriver JSON wire protocol.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public interface DriverCommand {
  String NEW_SESSION = "newSession";

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
  String SUBMIT_ELEMENT = "submitElement";
  String TOGGLE_ELEMENT = "toggleElement";

  String GET_CURRENT_WINDOW_HANDLE = "getCurrentWindowHandle";
  String GET_WINDOW_HANDLES = "getWindowHandles";

  String SWITCH_TO_WINDOW = "switchToWindow";
  String SWITCH_TO_FRAME = "switchToFrame";
  String SWITCH_TO_FRAME_BY_INDEX = "switchToFrameByIndex";  // TODO(jleyba): standardize Chrome frame switching
  String SWITCH_TO_FRAME_BY_NAME = "switchToFrameByName";    //
  String SWITCH_TO_DEFAULT_CONTENT = "switchToDefaultContent";
  String GET_ACTIVE_ELEMENT = "getActiveElement";

  String GET_CURRENT_URL = "getCurrentUrl";
  String GET_PAGE_SOURCE = "getPageSource";
  String GET_TITLE = "getTitle";

  String EXECUTE_SCRIPT = "executeScript";

  String GET_SPEED = "getSpeed";
  String SET_SPEED = "setSpeed";

  String SET_BROWSER_VISIBLE = "setBrowserVisible";
  String IS_BROWSER_VISIBLE = "isBrowserVisible";

  String GET_ELEMENT_TEXT = "getElementText";
  String GET_ELEMENT_VALUE = "getElementValue";
  String GET_ELEMENT_TAG_NAME = "getElementTagName";
  String SET_ELEMENT_SELECTED = "setElementSelected";
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
  String DISMISS_ALERT = "dismissAlert";
  String IMPLICITLY_WAIT = "implicitlyWait";
  
  String EXECUTE_SQL = "executeSQL";
  String GET_LOCATION = "getLocation";
  String SET_LOCATION = "setLocation";
  String GET_APP_CACHE = "getAppCache";
  String GET_APP_CACHE_STATUS = "getStatus";
  String IS_BROWSER_ONLINE = "isBrowserOnline";
  String SET_BROWSER_ONLINE = "setBrowserOnline";
}
