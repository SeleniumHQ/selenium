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

public enum UnexpectedAlertBehaviour {
  ACCEPT("accept"),
  DISMISS("dismiss"),
  ACCEPT_AND_NOTIFY("accept and notify"),
  DISMISS_AND_NOTIFY("dismiss and notify"),
  IGNORE("ignore");

  private String text;

  UnexpectedAlertBehaviour(String text) {
    this.text = text;
  }

  @Override
  public String toString() {
    return String.valueOf(text);
  }

  public static UnexpectedAlertBehaviour fromString(String text) {
    if (text != null) {
      for (UnexpectedAlertBehaviour b : UnexpectedAlertBehaviour.values()) {
        if (text.equalsIgnoreCase(b.text)) {
          return b;
        }
      }
    }
    return null;
  }
}
