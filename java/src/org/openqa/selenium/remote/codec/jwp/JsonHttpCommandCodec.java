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

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.codec.AbstractHttpCommandCodec;

import java.util.Map;

import static org.openqa.selenium.remote.DriverCommand.ACCEPT_ALERT;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_LOCAL_STORAGE;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_SESSION_STORAGE;
import static org.openqa.selenium.remote.DriverCommand.DISMISS_ALERT;
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
import static org.openqa.selenium.remote.DriverCommand.REMOVE_LOCAL_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.REMOVE_SESSION_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SET_ALERT_VALUE;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_POSITION;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_SIZE;
import static org.openqa.selenium.remote.DriverCommand.SET_LOCAL_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SET_SESSION_STORAGE_ITEM;
import static org.openqa.selenium.remote.DriverCommand.SUBMIT_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.UPLOAD_FILE;

/**
 * A command codec that adheres to the Selenium project's JSON/HTTP wire protocol.
 *
 * @see <a href="https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol">
 *   JSON wire protocol</a>
 */
public class JsonHttpCommandCodec extends AbstractHttpCommandCodec {

  public JsonHttpCommandCodec() {
    String sessionId = "/session/:sessionId";

    String elementId = sessionId + "/element/:id";
    defineCommand(GET_ELEMENT_ATTRIBUTE, get(elementId + "/attribute/:name"));
    defineCommand(GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW, get(elementId + "/location_in_view"));
    defineCommand(IS_ELEMENT_DISPLAYED, get(elementId + "/displayed"));
    defineCommand(SUBMIT_ELEMENT, post(elementId + "/submit"));

    defineCommand(EXECUTE_SCRIPT, post(sessionId + "/execute"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post(sessionId + "/execute_async"));

    defineCommand(GET_PAGE_SOURCE, get(sessionId + "/source"));

    String windowHandle = sessionId + "/window/:windowHandle";
    defineCommand(MAXIMIZE_CURRENT_WINDOW, post(windowHandle + "/maximize"));
    defineCommand(GET_CURRENT_WINDOW_POSITION, get(windowHandle + "/position"));
    defineCommand(SET_CURRENT_WINDOW_POSITION, post(windowHandle + "/position"));
    defineCommand(GET_CURRENT_WINDOW_SIZE, get(windowHandle + "/size"));
    defineCommand(SET_CURRENT_WINDOW_SIZE, post(windowHandle + "/size"));
    defineCommand(GET_CURRENT_WINDOW_HANDLE, get(sessionId + "/window_handle"));
    defineCommand(GET_WINDOW_HANDLES, get(sessionId + "/window_handles"));

    defineCommand(ACCEPT_ALERT, post(sessionId + "/accept_alert"));
    defineCommand(DISMISS_ALERT, post(sessionId + "/dismiss_alert"));
    defineCommand(GET_ALERT_TEXT, get(sessionId + "/alert_text"));
    defineCommand(SET_ALERT_VALUE, post(sessionId + "/alert_text"));

    defineCommand(UPLOAD_FILE, post(sessionId + "/file"));

    defineCommand(GET_ACTIVE_ELEMENT, post(sessionId + "/element/active"));

    String localStorage = sessionId + "/local_storage";
    defineCommand(CLEAR_LOCAL_STORAGE, delete(localStorage));
    defineCommand(GET_LOCAL_STORAGE_KEYS, get(localStorage));
    defineCommand(SET_LOCAL_STORAGE_ITEM, post(localStorage));
    defineCommand(REMOVE_LOCAL_STORAGE_ITEM, delete(localStorage + "/key/:key"));
    defineCommand(GET_LOCAL_STORAGE_ITEM, get(localStorage + "/key/:key"));
    defineCommand(GET_LOCAL_STORAGE_SIZE, get(localStorage + "/size"));

    String sessionStorage = sessionId + "/session_storage";
    defineCommand(CLEAR_SESSION_STORAGE, delete(sessionStorage));
    defineCommand(GET_SESSION_STORAGE_KEYS, get(sessionStorage));
    defineCommand(SET_SESSION_STORAGE_ITEM, post(sessionStorage));
    defineCommand(REMOVE_SESSION_STORAGE_ITEM, delete(sessionStorage + "/key/:key"));
    defineCommand(GET_SESSION_STORAGE_ITEM, get(sessionStorage + "/key/:key"));
    defineCommand(GET_SESSION_STORAGE_SIZE, get(sessionStorage + "/size"));
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
