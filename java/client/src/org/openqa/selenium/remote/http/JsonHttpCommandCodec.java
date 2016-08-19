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
import static org.openqa.selenium.remote.DriverCommand.SET_ALERT_VALUE;

/**
 * A command codec that adheres to the Selenium project's JSON/HTTP wire protocol.
 *
 * @see <a href="https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol">
 *   JSON wire protocol</a>
 */
public class JsonHttpCommandCodec extends AbstractHttpCommandCodec {

  public JsonHttpCommandCodec() {
    defineCommand(ACCEPT_ALERT, post("/session/:sessionId/accept_alert"));
    defineCommand(DISMISS_ALERT, post("/session/:sessionId/dismiss_alert"));
    defineCommand(GET_ALERT_TEXT, get("/session/:sessionId/alert_text"));
    defineCommand(SET_ALERT_VALUE, post("/session/:sessionId/alert_text"));

    defineCommand(EXECUTE_SCRIPT, post("/session/:sessionId/execute"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post("/session/:sessionId/execute_async"));
  }
}
