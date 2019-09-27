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

package org.openqa.selenium;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class UnhandledAlertException extends WebDriverException {

  private final String alertText;

  public UnhandledAlertException(String message) {
    this(message, null);
  }

  public UnhandledAlertException(String message, String alertText) {
    super(message + ": " + alertText);
    this.alertText = alertText;
  }

  /**
   * @return the text of the unhandled alert.
   */
  public String getAlertText() {
    return alertText;
  }

  // Used for serialising. Some of the drivers return the alert text like this.
  @Beta
  public Map<String, String> getAlert() {
    HashMap<String, String> toReturn = new HashMap<>();
    toReturn.put("text", getAlertText());
    return Collections.unmodifiableMap(toReturn);
  }
}
