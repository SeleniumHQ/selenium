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

package org.openqa.selenium.remote.codec.jwp;

import static org.openqa.selenium.remote.DriverCommand.ACCEPT_ALERT;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_LOCAL_STORAGE;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_SESSION_STORAGE;
import static org.openqa.selenium.remote.DriverCommand.CLICK;
import static org.openqa.selenium.remote.DriverCommand.DISMISS_ALERT;
import static org.openqa.selenium.remote.DriverCommand.DOUBLE_CLICK;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_ASYNC_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.GET_ACTIVE_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.GET_ALERT_TEXT;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_HANDLE;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_POSITION;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_ATTRIBUTE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW;
import static org.openqa.selenium.remote.DriverCommand.GET_LOCAL_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.GET_LOCAL_STORAGE_KEYS;
import static org.openqa.selenium.remote.DriverCommand.GET_LOCAL_STORAGE_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_PAGE_SOURCE;
import static org.openqa.selenium.remote.DriverCommand.GET_SESSION_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.GET_SESSION_STORAGE_KEYS;
import static org.openqa.selenium.remote.DriverCommand.GET_SESSION_STORAGE_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_WINDOW_HANDLES;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_DISPLAYED;
import static org.openqa.selenium.remote.DriverCommand.MAXIMIZE_CURRENT_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.MOUSE_DOWN;
import static org.openqa.selenium.remote.DriverCommand.MOUSE_UP;
import static org.openqa.selenium.remote.DriverCommand.MOVE_TO;
import static org.openqa.selenium.remote.DriverCommand.REMOVE_LOCAL_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.REMOVE_SESSION_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SEND_KEYS_TO_ACTIVE_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SET_ALERT_VALUE;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_POSITION;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_SIZE;
import static org.openqa.selenium.remote.DriverCommand.SET_LOCAL_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SET_SESSION_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SUBMIT_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.TOUCH_DOUBLE_TAP;
import static org.openqa.selenium.remote.DriverCommand.TOUCH_DOWN;
import static org.openqa.selenium.remote.DriverCommand.TOUCH_FLICK;
import static org.openqa.selenium.remote.DriverCommand.TOUCH_LONG_PRESS;
import static org.openqa.selenium.remote.DriverCommand.TOUCH_MOVE;
import static org.openqa.selenium.remote.DriverCommand.TOUCH_SCROLL;
import static org.openqa.selenium.remote.DriverCommand.TOUCH_SINGLE_TAP;
import static org.openqa.selenium.remote.DriverCommand.TOUCH_UP;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.codec.AbstractHttpCommandCodec;

import java.util.Map;

/**
 * A command codec that adheres to the Selenium project's JSON/HTTP wire protocol.
 *
 * @see <a href="https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol">
 *   JSON wire protocol</a>
 */
public class JsonHttpCommandCodec extends AbstractHttpCommandCodec {

  public JsonHttpCommandCodec() {
    String SESSION = "/session/:sessionId";

    String ELEMENT = SESSION + "/element/:id";
    defineCommand(GET_ELEMENT_ATTRIBUTE, get(ELEMENT + "/attribute/:name"));
    defineCommand(GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW, get(ELEMENT + "/location_in_view"));
    defineCommand(IS_ELEMENT_DISPLAYED, get(ELEMENT + "/displayed"));
    defineCommand(SUBMIT_ELEMENT, post(ELEMENT + "/submit"));

    defineCommand(EXECUTE_SCRIPT, post(SESSION + "/execute"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post(SESSION + "/execute_async"));

    defineCommand(GET_PAGE_SOURCE, get(SESSION + "/source"));

    String WINDOW = SESSION + "/window/:windowHandle";
    defineCommand(MAXIMIZE_CURRENT_WINDOW, post(WINDOW + "/maximize"));
    defineCommand(GET_CURRENT_WINDOW_POSITION, get(WINDOW + "/position"));
    defineCommand(SET_CURRENT_WINDOW_POSITION, post(WINDOW + "/position"));
    defineCommand(GET_CURRENT_WINDOW_SIZE, get(WINDOW + "/size"));
    defineCommand(SET_CURRENT_WINDOW_SIZE, post(WINDOW + "/size"));
    defineCommand(GET_CURRENT_WINDOW_HANDLE, get(SESSION + "/window_handle"));
    defineCommand(GET_WINDOW_HANDLES, get(SESSION + "/window_handles"));

    defineCommand(ACCEPT_ALERT, post(SESSION + "/accept_alert"));
    defineCommand(DISMISS_ALERT, post(SESSION + "/dismiss_alert"));
    defineCommand(GET_ALERT_TEXT, get(SESSION + "/alert_text"));
    defineCommand(SET_ALERT_VALUE, post(SESSION + "/alert_text"));

    defineCommand(GET_ACTIVE_ELEMENT, post(SESSION + "/element/active"));

    String LOCAL_STORAGE = SESSION + "/local_storage";
    defineCommand(CLEAR_LOCAL_STORAGE, delete(LOCAL_STORAGE));
    defineCommand(GET_LOCAL_STORAGE_KEYS, get(LOCAL_STORAGE));
    defineCommand(SET_LOCAL_STORAGE_ITEM, post(LOCAL_STORAGE));
    defineCommand(REMOVE_LOCAL_STORAGE_ITEM, delete(LOCAL_STORAGE + "/key/:key"));
    defineCommand(GET_LOCAL_STORAGE_ITEM, get(LOCAL_STORAGE + "/key/:key"));
    defineCommand(GET_LOCAL_STORAGE_SIZE, get(LOCAL_STORAGE + "/size"));

    String SESSION_STORAGE = SESSION + "/session_storage";
    defineCommand(CLEAR_SESSION_STORAGE, delete(SESSION_STORAGE));
    defineCommand(GET_SESSION_STORAGE_KEYS, get(SESSION_STORAGE));
    defineCommand(SET_SESSION_STORAGE_ITEM, post(SESSION_STORAGE));
    defineCommand(REMOVE_SESSION_STORAGE_ITEM, delete(SESSION_STORAGE + "/key/:key"));
    defineCommand(GET_SESSION_STORAGE_ITEM, get(SESSION_STORAGE + "/key/:key"));
    defineCommand(GET_SESSION_STORAGE_SIZE, get(SESSION_STORAGE + "/size"));

    // Interactions-related commands.
    defineCommand(MOUSE_DOWN, post(SESSION + "/buttondown"));
    defineCommand(MOUSE_UP, post(SESSION + "/buttonup"));
    defineCommand(CLICK, post(SESSION + "/click"));
    defineCommand(DOUBLE_CLICK, post(SESSION + "/doubleclick"));
    defineCommand(MOVE_TO, post(SESSION + "/moveto"));
    defineCommand(SEND_KEYS_TO_ACTIVE_ELEMENT, post(SESSION + "/keys"));

    String TOUCH = SESSION + "/touch";
    defineCommand(TOUCH_SINGLE_TAP, post(TOUCH + "/click"));
    defineCommand(TOUCH_DOUBLE_TAP, post(TOUCH + "/doubleclick"));
    defineCommand(TOUCH_DOWN, post(TOUCH + "/down"));
    defineCommand(TOUCH_FLICK, post(TOUCH + "/flick"));
    defineCommand(TOUCH_LONG_PRESS, post(TOUCH + "/longclick"));
    defineCommand(TOUCH_MOVE, post(TOUCH + "/move"));
    defineCommand(TOUCH_SCROLL, post(TOUCH + "/scroll"));
    defineCommand(TOUCH_UP, post(TOUCH + "/up"));
  }

  @Override
  protected Map<String, ?> amendParameters(String name, Map<String, ?> parameters) {
    switch (name) {
      case DriverCommand.GET_CURRENT_WINDOW_SIZE:
      case DriverCommand.MAXIMIZE_CURRENT_WINDOW:
      case DriverCommand.SET_CURRENT_WINDOW_SIZE:
      case DriverCommand.SET_CURRENT_WINDOW_POSITION:
        return ImmutableMap.<String, Object>builder()
          .putAll(parameters)
          .put("windowHandle", "current")
          .put("handle", "current")
          .build();

      case DriverCommand.SET_TIMEOUT:
        if (parameters.size() != 1) {
          throw new InvalidArgumentException(
              "The JSON wire protocol only supports setting one time out at a time");
        }
        Map.Entry<String, ?> entry = parameters.entrySet().iterator().next();
        String type = entry.getKey();
        if ("pageLoad".equals(type)) {
          type = "page load";
        }
        return ImmutableMap.of("type", type, "ms", entry.getValue());

      case DriverCommand.SWITCH_TO_WINDOW:
        return ImmutableMap.<String, Object>builder()
          .put("name", parameters.get("handle"))
          .build();

      default:
        return parameters;
    }
  }
}
