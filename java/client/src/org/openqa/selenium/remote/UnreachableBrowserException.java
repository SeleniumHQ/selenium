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

import org.openqa.selenium.WebDriverException;

/**
 * Indicates there was a problem communicating with the browser being
 * controlled or the Selenium server.
 *
 * The most common causes for this exception are:
 * <ul>
 *   <li> The provided server address to RemoteWebDriver is invalid, so the
 *    connection could not be established.
 *   </li>
 *   <li> The browser has died mid-test. </li>
 * </ul>
 * 1)
 */
public class UnreachableBrowserException extends WebDriverException {
  public UnreachableBrowserException(String message) {
    super(message);
  }

  public UnreachableBrowserException(String message, Throwable cause) {
    super(message, cause);
  }
}
