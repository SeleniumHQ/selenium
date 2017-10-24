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

package org.openqa.selenium.remote.http;

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

import java.util.Map;

/**
 * A command codec that adheres to the Selenium project's JSON/HTTP wire protocol.
 *
 * @see <a href="https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol">
 *   JSON wire protocol</a>
 */
public class JsonHttpCommandCodec extends AbstractHttpCommandCodec {

  public JsonHttpCommandCodec() {
    defineCommand(GET_ELEMENT_ATTRIBUTE, get("/session/:sessionId/element/:id/attribute/:name"));
    defineCommand(GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW, get("/session/:sessionId/element/:id/location_in_view"));
    defineCommand(IS_ELEMENT_DISPLAYED, get("/session/:sessionId/element/:id/displayed"));
    defineCommand(SUBMIT_ELEMENT, post("/session/:sessionId/element/:id/submit"));

    defineCommand(EXECUTE_SCRIPT, post("/session/:sessionId/execute"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post("/session/:sessionId/execute_async"));

    defineCommand(GET_PAGE_SOURCE, get("/session/:sessionId/source"));

    defineCommand(MAXIMIZE_CURRENT_WINDOW, post("/session/:sessionId/window/:windowHandle/maximize"));
    defineCommand(GET_CURRENT_WINDOW_POSITION, get("/session/:sessionId/window/:windowHandle/position"));
    defineCommand(SET_CURRENT_WINDOW_POSITION, post("/session/:sessionId/window/:windowHandle/position"));
    defineCommand(GET_CURRENT_WINDOW_SIZE, get("/session/:sessionId/window/:windowHandle/size"));
    defineCommand(SET_CURRENT_WINDOW_SIZE, post("/session/:sessionId/window/:windowHandle/size"));
    defineCommand(GET_CURRENT_WINDOW_HANDLE, get("/session/:sessionId/window_handle"));
    defineCommand(GET_WINDOW_HANDLES, get("/session/:sessionId/window_handles"));

    defineCommand(ACCEPT_ALERT, post("/session/:sessionId/accept_alert"));
    defineCommand(DISMISS_ALERT, post("/session/:sessionId/dismiss_alert"));
    defineCommand(GET_ALERT_TEXT, get("/session/:sessionId/alert_text"));
    defineCommand(SET_ALERT_VALUE, post("/session/:sessionId/alert_text"));

    defineCommand(GET_ACTIVE_ELEMENT, post("/session/:sessionId/element/active"));

    defineCommand(CLEAR_LOCAL_STORAGE, delete("/session/:sessionId/local_storage"));
    defineCommand(GET_LOCAL_STORAGE_KEYS, get("/session/:sessionId/local_storage"));
    defineCommand(SET_LOCAL_STORAGE_ITEM, post("/session/:sessionId/local_storage"));
    defineCommand(REMOVE_LOCAL_STORAGE_ITEM, delete("/session/:sessionId/local_storage/key/:key"));
    defineCommand(GET_LOCAL_STORAGE_ITEM, get("/session/:sessionId/local_storage/key/:key"));
    defineCommand(GET_LOCAL_STORAGE_SIZE, get("/session/:sessionId/local_storage/size"));

    defineCommand(CLEAR_SESSION_STORAGE, delete("/session/:sessionId/session_storage"));
    defineCommand(GET_SESSION_STORAGE_KEYS, get("/session/:sessionId/session_storage"));
    defineCommand(SET_SESSION_STORAGE_ITEM, post("/session/:sessionId/session_storage"));
    defineCommand(REMOVE_SESSION_STORAGE_ITEM, delete("/session/:sessionId/session_storage/key/:key"));
    defineCommand(GET_SESSION_STORAGE_ITEM, get("/session/:sessionId/session_storage/key/:key"));
    defineCommand(GET_SESSION_STORAGE_SIZE, get("/session/:sessionId/session_storage/size"));

    // Interactions-related commands.
    defineCommand(MOUSE_DOWN, post("/session/:sessionId/buttondown"));
    defineCommand(MOUSE_UP, post("/session/:sessionId/buttonup"));
    defineCommand(CLICK, post("/session/:sessionId/click"));
    defineCommand(DOUBLE_CLICK, post("/session/:sessionId/doubleclick"));
    defineCommand(MOVE_TO, post("/session/:sessionId/moveto"));
    defineCommand(SEND_KEYS_TO_ACTIVE_ELEMENT, post("/session/:sessionId/keys"));
    defineCommand(TOUCH_SINGLE_TAP, post("/session/:sessionId/touch/click"));
    defineCommand(TOUCH_DOUBLE_TAP, post("/session/:sessionId/touch/doubleclick"));
    defineCommand(TOUCH_DOWN, post("/session/:sessionId/touch/down"));
    defineCommand(TOUCH_FLICK, post("/session/:sessionId/touch/flick"));
    defineCommand(TOUCH_LONG_PRESS, post("/session/:sessionId/touch/longclick"));
    defineCommand(TOUCH_MOVE, post("/session/:sessionId/touch/move"));
    defineCommand(TOUCH_SCROLL, post("/session/:sessionId/touch/scroll"));
    defineCommand(TOUCH_UP, post("/session/:sessionId/touch/up"));
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
