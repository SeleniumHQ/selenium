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

package org.openqa.selenium.grid.data;

public enum SessionClosedReason {
  /** Session was closed normally via QUIT command from client */
  QUIT_COMMAND("session closed normally (QUIT command)"),
  /** Session timed out due to inactivity */
  TIMEOUT("session timed out due to inactivity"),
  /** Node was removed from the grid */
  NODE_REMOVED("node was removed from the grid"),
  /** Node was restarted */
  NODE_RESTARTED("node was restarted");

  private final String reasonText;

  SessionClosedReason(String reasonText) {
    this.reasonText = reasonText;
  }

  public String getReasonText() {
    return reasonText;
  }
}
