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
 * A command codec that adheres to the W3C's WebDriver wire protocol.
 *
 * @see <a href="https://w3.org/tr/webdriver">W3C WebDriver spec</a>
 */
public class W3CHttpCommandCodec extends AbstractHttpCommandCodec {

  public W3CHttpCommandCodec() {
    defineCommand(ACCEPT_ALERT, post("/session/:sessionId/alert/accept"));
    defineCommand(DISMISS_ALERT, post("/session/:sessionId/alert/dismiss"));
    defineCommand(GET_ALERT_TEXT, get("/session/:sessionId/alert/text"));
    defineCommand(SET_ALERT_VALUE, post("/session/:sessionId/alert/text"));

    defineCommand(EXECUTE_SCRIPT, post("/session/:sessionId/execute/sync"));
    defineCommand(EXECUTE_ASYNC_SCRIPT, post("/session/:sessionId/execute/async"));
  }
}
