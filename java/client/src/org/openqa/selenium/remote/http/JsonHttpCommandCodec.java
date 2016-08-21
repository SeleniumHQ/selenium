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
import static org.openqa.selenium.remote.DriverCommand.DISMISS_ALERT;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_ASYNC_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.GET_ALERT_TEXT;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_HANDLE;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_WINDOW_HANDLES;
import static org.openqa.selenium.remote.DriverCommand.MAXIMIZE_CURRENT_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.SET_ALERT_VALUE;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_POSITION;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_SIZE;

import com.google.common.collect.ImmutableMap;

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
    defineCommand(GET_WINDOW_HANDLES, get("/session/:sessionId/window_handles"));
    defineCommand(MAXIMIZE_CURRENT_WINDOW, post("/session/:sessionId/window/:windowHandle/maximize"));
    defineCommand(SET_CURRENT_WINDOW_POSITION, post("/session/:sessionId/window/:windowHandle/position"));
    defineCommand(GET_CURRENT_WINDOW_SIZE, get("/session/:sessionId/window/:windowHandle/size"));
    defineCommand(SET_CURRENT_WINDOW_SIZE, post("/session/:sessionId/window/:windowHandle/size"));
    defineCommand(GET_CURRENT_WINDOW_HANDLE, get("/session/:sessionId/window_handle"));

    defineCommand(ACCEPT_ALERT, post("/session/:sessionId/accept_alert"));
    defineCommand(DISMISS_ALERT, post("/session/:sessionId/dismiss_alert"));
    defineCommand(GET_ALERT_TEXT, get("/session/:sessionId/alert_text"));
    defineCommand(SET_ALERT_VALUE, post("/session/:sessionId/alert_text"));

    defineCommand(EXECUTE_SCRIPT, post("/session/:sessionId/execute"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post("/session/:sessionId/execute_async"));
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

      default:
        return parameters;
    }
  }
}
