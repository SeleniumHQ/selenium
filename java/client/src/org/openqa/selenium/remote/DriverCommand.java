// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.print.PrintOptions;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static java.util.Collections.singletonMap;

/**
 * An empty interface defining constants for the standard commands defined in the WebDriver JSON
 * wire protocol.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public interface DriverCommand {
  String GET_ALL_SESSIONS = "getAllSessions";
  String GET_CAPABILITIES = "getCapabilities";
  String NEW_SESSION = "newSession";
  static CommandPayload NEW_SESSION(Capabilities capabilities) {
    Require.nonNull("Capabilities", capabilities);
    return new CommandPayload(
      NEW_SESSION,
      ImmutableMap.of(
        "capabilities", CapabilitiesUtils.makeW3CSafe(capabilities).collect(Collectors.toSet()),
        "desiredCapabilities", capabilities));
  }
  static CommandPayload NEW_SESSION(Collection<Capabilities> capabilities) {
    Require.nonNull("Capabilities", capabilities);
    if (capabilities.isEmpty()) {
      throw new IllegalArgumentException("Capabilities for new session must not be empty");
    }

    return new CommandPayload(
      NEW_SESSION,
      ImmutableMap.of(
        "capabilities", capabilities.stream().flatMap(CapabilitiesUtils::makeW3CSafe).collect(Collectors.toSet()),
        "desiredCapabilities", capabilities.iterator().next()));
  }

  String STATUS = "status";

  String CLOSE = "close";
  String QUIT = "quit";

  String GET = "get";
  static CommandPayload GET(String url) {
    return new CommandPayload(GET, ImmutableMap.of("url", url));
  }
  String GO_BACK = "goBack";
  String GO_FORWARD = "goForward";
  String REFRESH = "refresh";

  String ADD_COOKIE = "addCookie";
  static CommandPayload ADD_COOKIE(Cookie cookie) {
    return new CommandPayload(ADD_COOKIE, ImmutableMap.of("cookie", cookie));
  }
  String GET_ALL_COOKIES = "getCookies";
  String GET_COOKIE = "getCookie";
  String DELETE_COOKIE = "deleteCookie";
  static CommandPayload DELETE_COOKIE(String name) {
    return new CommandPayload(DELETE_COOKIE, ImmutableMap.of("name", name));
  }
  String DELETE_ALL_COOKIES = "deleteAllCookies";

  String FIND_ELEMENT = "findElement";
  static CommandPayload FIND_ELEMENT(String strategy, Object value) {
    return new CommandPayload(FIND_ELEMENT, ImmutableMap.of("using", strategy, "value", value));
  }
  String FIND_ELEMENTS = "findElements";
  static CommandPayload FIND_ELEMENTS(String strategy, Object value) {
    return new CommandPayload(FIND_ELEMENTS, ImmutableMap.of("using", strategy, "value", value));
  }
  String FIND_CHILD_ELEMENT = "findChildElement";
  static CommandPayload FIND_CHILD_ELEMENT(String id, String strategy, String value) {
    return new CommandPayload(FIND_CHILD_ELEMENT,
                              ImmutableMap.of("id", id, "using", strategy, "value", value));
  }
  String FIND_CHILD_ELEMENTS = "findChildElements";
  static CommandPayload FIND_CHILD_ELEMENTS(String id, String strategy, String value) {
    return new CommandPayload(FIND_CHILD_ELEMENTS,
                              ImmutableMap.of("id", id, "using", strategy, "value", value));
  }
  String GET_ELEMENT_SHADOW_ROOT = "getElementShadowRoot";
  static CommandPayload GET_ELEMENT_SHADOW_ROOT(String id) {
    Require.nonNull("Element ID", id);
    return new CommandPayload(GET_ELEMENT_SHADOW_ROOT, singletonMap("id", id));
  }

  String FIND_ELEMENT_FROM_SHADOW_ROOT = "findElementFromShadowRoot";
  static CommandPayload FIND_ELEMENT_FROM_SHADOW_ROOT(String shadowId, String strategy, String value) {
    Require.nonNull("Shadow root ID", shadowId);
    Require.nonNull("Element finding strategy", strategy);
    Require.nonNull("Value for finding strategy", value);
    return new CommandPayload(
      FIND_ELEMENT_FROM_SHADOW_ROOT,
      ImmutableMap.of("shadowId", shadowId, "using", strategy, "value", value));
  }

  String FIND_ELEMENTS_FROM_SHADOW_ROOT = "findElementsFromShadowRoot";
  static CommandPayload FIND_ELEMENTS_FROM_SHADOW_ROOT(String shadowId, String strategy, String value) {
    Require.nonNull("Shadow root ID", shadowId);
    Require.nonNull("Element finding strategy", strategy);
    Require.nonNull("Value for finding strategy", value);
    return new CommandPayload(
      FIND_ELEMENTS_FROM_SHADOW_ROOT,
      ImmutableMap.of("shadowId", shadowId, "using", strategy, "value", value));
  }

  String CLEAR_ELEMENT = "clearElement";
  static CommandPayload CLEAR_ELEMENT(String id) {
    return new CommandPayload(CLEAR_ELEMENT, ImmutableMap.of("id", id));
  }
  String CLICK_ELEMENT = "clickElement";
  static CommandPayload CLICK_ELEMENT(String id) {
    return new CommandPayload(CLICK_ELEMENT, ImmutableMap.of("id", id));
  }
  String SEND_KEYS_TO_ELEMENT = "sendKeysToElement";
  static CommandPayload SEND_KEYS_TO_ELEMENT(String id, CharSequence[] keysToSend) {
    return new CommandPayload(SEND_KEYS_TO_ELEMENT, ImmutableMap.of("id", id, "value", keysToSend));
  }
  String SEND_KEYS_TO_ACTIVE_ELEMENT = "sendKeysToActiveElement";
  String SUBMIT_ELEMENT = "submitElement";
  static CommandPayload SUBMIT_ELEMENT(String id) {
    return new CommandPayload(SUBMIT_ELEMENT, ImmutableMap.of("id", id));
  }
  String UPLOAD_FILE = "uploadFile";
  static CommandPayload UPLOAD_FILE(String file) {
    return new CommandPayload(UPLOAD_FILE, ImmutableMap.of("file", file));
  }

  String GET_CURRENT_WINDOW_HANDLE = "getCurrentWindowHandle";
  String GET_WINDOW_HANDLES = "getWindowHandles";

  String GET_CURRENT_CONTEXT_HANDLE = "getCurrentContextHandle";
  String GET_CONTEXT_HANDLES = "getContextHandles";

  String SWITCH_TO_WINDOW = "switchToWindow";
  static CommandPayload SWITCH_TO_WINDOW(String windowHandleOrName) {
    return new CommandPayload(SWITCH_TO_WINDOW, ImmutableMap.of("handle", windowHandleOrName));
  }
  String SWITCH_TO_NEW_WINDOW = "newWindow";
  static CommandPayload SWITCH_TO_NEW_WINDOW(WindowType typeHint) {
    return new CommandPayload(SWITCH_TO_NEW_WINDOW, ImmutableMap.of("type", typeHint.toString()));
  }

  String SWITCH_TO_CONTEXT = "switchToContext";
  String SWITCH_TO_FRAME = "switchToFrame";
  static CommandPayload SWITCH_TO_FRAME(Object frame) {
    return new CommandPayload(SWITCH_TO_FRAME, singletonMap("id", frame));
  }
  String SWITCH_TO_PARENT_FRAME = "switchToParentFrame";
  String GET_ACTIVE_ELEMENT = "getActiveElement";

  String GET_CURRENT_URL = "getCurrentUrl";
  String GET_PAGE_SOURCE = "getPageSource";
  String GET_TITLE = "getTitle";

  String EXECUTE_SCRIPT = "executeScript";
  static CommandPayload EXECUTE_SCRIPT(String script, List<Object> args) {
    return new CommandPayload(EXECUTE_SCRIPT, ImmutableMap.of("script", script, "args", args));
  }
  String EXECUTE_ASYNC_SCRIPT = "executeAsyncScript";
  static CommandPayload EXECUTE_ASYNC_SCRIPT(String script, List<Object> args) {
    return new CommandPayload(EXECUTE_ASYNC_SCRIPT, ImmutableMap.of("script", script, "args", args));
  }

  String GET_ELEMENT_TEXT = "getElementText";
  static CommandPayload GET_ELEMENT_TEXT(String id) {
    return new CommandPayload(GET_ELEMENT_TEXT, ImmutableMap.of("id", id));
  }
  String GET_ELEMENT_TAG_NAME = "getElementTagName";
  static CommandPayload GET_ELEMENT_TAG_NAME(String id) {
    return new CommandPayload(GET_ELEMENT_TAG_NAME, ImmutableMap.of("id", id));
  }
  String IS_ELEMENT_SELECTED = "isElementSelected";
  static CommandPayload IS_ELEMENT_SELECTED(String id) {
    return new CommandPayload(IS_ELEMENT_SELECTED, ImmutableMap.of("id", id));
  }
  String IS_ELEMENT_ENABLED = "isElementEnabled";
  static CommandPayload IS_ELEMENT_ENABLED(String id) {
    return new CommandPayload(IS_ELEMENT_ENABLED, ImmutableMap.of("id", id));
  }
  String IS_ELEMENT_DISPLAYED = "isElementDisplayed";
  static CommandPayload IS_ELEMENT_DISPLAYED(String id) {
    return new CommandPayload(IS_ELEMENT_DISPLAYED, ImmutableMap.of("id", id));
  }
  String GET_ELEMENT_RECT = "getElementRect";
  static CommandPayload GET_ELEMENT_RECT(String id) {
    return new CommandPayload(GET_ELEMENT_RECT, ImmutableMap.of("id", id));
  }
  String GET_ELEMENT_LOCATION = "getElementLocation";
  static CommandPayload GET_ELEMENT_LOCATION(String id) {
    return new CommandPayload(GET_ELEMENT_LOCATION, ImmutableMap.of("id", id));
  }
  String GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW = "getElementLocationOnceScrolledIntoView";
  static CommandPayload GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW(String id) {
    return new CommandPayload(GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW, ImmutableMap.of("id", id));
  }
  String GET_ELEMENT_SIZE = "getElementSize";
  static CommandPayload GET_ELEMENT_SIZE(String id) {
    return new CommandPayload(GET_ELEMENT_SIZE, ImmutableMap.of("id", id));
  }
  String GET_ELEMENT_DOM_PROPERTY = "getElementDomProperty";
  static CommandPayload GET_ELEMENT_DOM_PROPERTY(String id, String name) {
    return new CommandPayload(GET_ELEMENT_DOM_PROPERTY, ImmutableMap.of("id", id, "name", name));
  }
  String GET_ELEMENT_DOM_ATTRIBUTE = "getElementDomAttribute";
  static CommandPayload GET_ELEMENT_DOM_ATTRIBUTE(String id, String name) {
    return new CommandPayload(GET_ELEMENT_DOM_ATTRIBUTE, ImmutableMap.of("id", id, "name", name));
  }
  String GET_ELEMENT_ATTRIBUTE = "getElementAttribute";
  static CommandPayload GET_ELEMENT_ATTRIBUTE(String id, String name) {
    return new CommandPayload(GET_ELEMENT_ATTRIBUTE, ImmutableMap.of("id", id, "name", name));
  }
  String GET_ELEMENT_VALUE_OF_CSS_PROPERTY = "getElementValueOfCssProperty";
  static CommandPayload GET_ELEMENT_VALUE_OF_CSS_PROPERTY(String id, String name) {
    return new CommandPayload(GET_ELEMENT_VALUE_OF_CSS_PROPERTY, ImmutableMap.of("id", id, "propertyName", name));
  }
  String GET_ELEMENT_ARIA_ROLE = "getElementAriaRole";
  static CommandPayload GET_ELEMENT_ARIA_ROLE(String id) {
    return new CommandPayload(GET_ELEMENT_ARIA_ROLE, ImmutableMap.of("id", id));
  }
  String GET_ELEMENT_ACCESSIBLE_NAME = "getElementAccessibleName";
  static CommandPayload GET_ELEMENT_ACCESSIBLE_NAME(String id) {
    return new CommandPayload(GET_ELEMENT_ACCESSIBLE_NAME, ImmutableMap.of("id", id));
  }
  String ELEMENT_EQUALS = "elementEquals";

  String SCREENSHOT = "screenshot";
  String ELEMENT_SCREENSHOT = "elementScreenshot";
  static CommandPayload ELEMENT_SCREENSHOT(String id) {
    return new CommandPayload(ELEMENT_SCREENSHOT, ImmutableMap.of("id", id));
  }

  String ACCEPT_ALERT = "acceptAlert";
  String DISMISS_ALERT = "dismissAlert";
  String GET_ALERT_TEXT = "getAlertText";
  String SET_ALERT_VALUE = "setAlertValue";
  static CommandPayload SET_ALERT_VALUE(String keysToSend) {
    return new CommandPayload(SET_ALERT_VALUE, ImmutableMap.of("text", keysToSend));
  }
  String SET_ALERT_CREDENTIALS = "setAlertCredentials";

  String GET_TIMEOUTS = "getTimeouts";
  String SET_TIMEOUT = "setTimeout";

  String PRINT_PAGE = "printPage";
  static CommandPayload PRINT_PAGE(PrintOptions options) {
    return new CommandPayload(PRINT_PAGE, ImmutableMap.of("options", options));
  }

  @Deprecated
  static CommandPayload SET_IMPLICIT_WAIT_TIMEOUT(long time, TimeUnit unit) {
    return new CommandPayload(
      SET_TIMEOUT, ImmutableMap.of("implicit", TimeUnit.MILLISECONDS.convert(time, unit)));
  }

  static CommandPayload SET_IMPLICIT_WAIT_TIMEOUT(Duration duration) {
    return new CommandPayload(SET_TIMEOUT, ImmutableMap.of("implicit", duration.toMillis()));
  }

  @Deprecated
  static CommandPayload SET_SCRIPT_TIMEOUT(long time, TimeUnit unit) {
    return new CommandPayload(
      SET_TIMEOUT, ImmutableMap.of("script", TimeUnit.MILLISECONDS.convert(time, unit)));
  }

  static CommandPayload SET_SCRIPT_TIMEOUT(Duration duration) {
    return new CommandPayload(SET_TIMEOUT, ImmutableMap.of("script", duration.toMillis()));
  }

  @Deprecated
  static CommandPayload SET_PAGE_LOAD_TIMEOUT(long time, TimeUnit unit) {
    return new CommandPayload(
      SET_TIMEOUT, ImmutableMap.of("pageLoad", TimeUnit.MILLISECONDS.convert(time, unit)));
  }

  static CommandPayload SET_PAGE_LOAD_TIMEOUT(Duration duration) {
    return new CommandPayload(SET_TIMEOUT, ImmutableMap.of("pageLoad", duration.toMillis()));
  }

  String IMPLICITLY_WAIT = "implicitlyWait";
  String SET_SCRIPT_TIMEOUT = "setScriptTimeout";

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
  String SET_SCREEN_ROTATION = "setScreenRotation";
  String GET_SCREEN_ROTATION = "getScreenRotation";

  // W3C Actions APIs
  String ACTIONS = "actions";
  static CommandPayload ACTIONS(Collection<Sequence> actions) {
    return new CommandPayload(ACTIONS, ImmutableMap.of("actions", actions));
  }
  String CLEAR_ACTIONS_STATE = "clearActionState";

  // These belong to the Advanced user interactions - an element is
  // optional for these commands.
  String CLICK = "mouseClick";
  String DOUBLE_CLICK = "mouseDoubleClick";
  String MOUSE_DOWN = "mouseButtonDown";
  String MOUSE_UP = "mouseButtonUp";
  String MOVE_TO = "mouseMoveTo";

  // Those allow interactions with the Input Methods installed on
  // the system.
  String IME_GET_AVAILABLE_ENGINES = "imeGetAvailableEngines";
  String IME_GET_ACTIVE_ENGINE = "imeGetActiveEngine";
  String IME_IS_ACTIVATED = "imeIsActivated";
  String IME_DEACTIVATE = "imeDeactivate";
  String IME_ACTIVATE_ENGINE = "imeActivateEngine";
  static CommandPayload IME_ACTIVATE_ENGINE(String engine) {
    return new CommandPayload(SET_ALERT_VALUE, ImmutableMap.of("engine", engine));
  }

  // These belong to the Advanced Touch API
  String TOUCH_SINGLE_TAP = "touchSingleTap";
  String TOUCH_DOWN = "touchDown";
  String TOUCH_UP = "touchUp";
  String TOUCH_MOVE = "touchMove";
  String TOUCH_SCROLL = "touchScroll";
  String TOUCH_DOUBLE_TAP = "touchDoubleTap";
  String TOUCH_LONG_PRESS = "touchLongPress";
  String TOUCH_FLICK = "touchFlick";

  // Window API
  String SET_CURRENT_WINDOW_POSITION = "setWindowPosition";
  static CommandPayload SET_CURRENT_WINDOW_POSITION(Point targetPosition) {
    return new CommandPayload(
      SET_CURRENT_WINDOW_POSITION, ImmutableMap.of("x", targetPosition.x, "y", targetPosition.y));
  }
  String GET_CURRENT_WINDOW_POSITION = "getWindowPosition";
  static CommandPayload GET_CURRENT_WINDOW_POSITION() {
    return new CommandPayload(
      GET_CURRENT_WINDOW_POSITION, ImmutableMap.of("windowHandle", "current"));
  }

  // W3C compatible Window API
  String SET_CURRENT_WINDOW_SIZE = "setCurrentWindowSize";
  static CommandPayload SET_CURRENT_WINDOW_SIZE(Dimension targetSize) {
    return new CommandPayload(
      SET_CURRENT_WINDOW_SIZE, ImmutableMap.of("width", targetSize.width, "height", targetSize.height));
  }
  String GET_CURRENT_WINDOW_SIZE = "getCurrentWindowSize";
  String MAXIMIZE_CURRENT_WINDOW = "maximizeCurrentWindow";
  String MINIMIZE_CURRENT_WINDOW = "minimizeCurrentWindow";
  String FULLSCREEN_CURRENT_WINDOW = "fullscreenCurrentWindow";

  // Logging API
  String GET_AVAILABLE_LOG_TYPES = "getAvailableLogTypes";
  String GET_LOG = "getLog";
  String GET_SESSION_LOGS = "getSessionLogs";

  // Mobile API
  String GET_NETWORK_CONNECTION = "getNetworkConnection";
  String SET_NETWORK_CONNECTION = "setNetworkConnection";

  // Virtual Authenticator API
  // http://w3c.github.io/webauthn#sctn-automation
  String ADD_VIRTUAL_AUTHENTICATOR = "addVirtualAuthenticator";
  String REMOVE_VIRTUAL_AUTHENTICATOR = "removeVirtualAuthenticator";
  String ADD_CREDENTIAL = "addCredential";
  String GET_CREDENTIALS = "getCredentials";
  String REMOVE_CREDENTIAL = "removeCredential";
  String REMOVE_ALL_CREDENTIALS = "removeAllCredentials";
  String SET_USER_VERIFIED = "setUserVerified";
}
