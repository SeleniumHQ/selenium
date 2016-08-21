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
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_SIZE;
import static org.openqa.selenium.remote.DriverCommand.SET_CURRENT_WINDOW_POSITION;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

import java.util.Map;

/**
 * A command codec that adheres to the W3C's WebDriver wire protocol.
 *
 * @see <a href="https://w3.org/tr/webdriver">W3C WebDriver spec</a>
 */
public class W3CHttpCommandCodec extends AbstractHttpCommandCodec {

  public W3CHttpCommandCodec() {

    defineCommand(GET_WINDOW_HANDLES, get("/session/:sessionId/window/handles"));
    defineCommand(MAXIMIZE_CURRENT_WINDOW, post("/session/:sessionId/window/maximize"));
    defineCommand(SET_CURRENT_WINDOW_POSITION, post("/session/:sessionId/execute/sync"));
    defineCommand(GET_CURRENT_WINDOW_SIZE, get("/session/:sessionId/window/size"));
    defineCommand(SET_CURRENT_WINDOW_SIZE, post("/session/:sessionId/window/size"));
    defineCommand(GET_CURRENT_WINDOW_HANDLE, get("/session/:sessionId/window"));

    defineCommand(ACCEPT_ALERT, post("/session/:sessionId/alert/accept"));
    defineCommand(DISMISS_ALERT, post("/session/:sessionId/alert/dismiss"));
    defineCommand(GET_ALERT_TEXT, get("/session/:sessionId/alert/text"));
    defineCommand(SET_ALERT_VALUE, post("/session/:sessionId/alert/text"));

    defineCommand(EXECUTE_SCRIPT, post("/session/:sessionId/execute/sync"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post("/session/:sessionId/execute/async"));
  }

  @Override
  protected Map<String, ?> amendParameters(String name, Map<String, ?> parameters) {
    switch (name) {
      case DriverCommand.SET_CURRENT_WINDOW_POSITION:
        return toScript(
          "window.screenX = arguments[0]; window.screenY = arguments[1]",
          parameters.get("x"),
          parameters.get("y"));

      default:
        return parameters;
    }
  }

  private Map<String, ?> toScript(String script, Object... args) {
    // Escape the quote marks
    script = script.replaceAll("\"", "\\\"");

    Iterable<Object> convertedArgs = Iterables.transform(
      Lists.newArrayList(args), new WebElementToJsonConverter());

    return ImmutableMap.of(
      "script", script,
      "args", Lists.newArrayList(convertedArgs));
  }
}
