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

package org.openqa.selenium.devtools.idealized.network.model;

import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.Arrays;

public enum ErrorReason {

  FAILED("Failed"),
  ABORTED("Aborted"),
  TIMEDOUT("TimedOut"),
  ACCESSDENIED("AccessDenied"),
  CONNECTIONCLOSED("ConnectionClosed"),
  CONNECTIONRESET("ConnectionReset"),
  CONNECTIONREFUSED("ConnectionRefused"),
  CONNECTIONABORTED("ConnectionAborted"),
  CONNECTIONFAILED("ConnectionFailed"),
  NAMENOTRESOLVED("NameNotResolved"),
  INTERNETDISCONNECTED("InternetDisconnected"),
  ADDRESSUNREACHABLE("AddressUnreachable"),
  BLOCKEDBYCLIENT("BlockedByClient"),
  BLOCKEDBYRESPONSE("BlockedByResponse");

  private String value;

  ErrorReason(String value) {
    this.value = value;
  }

  public static ErrorReason fromString(String s) {
    return Arrays.stream(ErrorReason.values())
      .filter(rs -> rs.value.equalsIgnoreCase(s))
      .findFirst()
      .orElseThrow(() -> new DevToolsException("Given value " + s + " is not found within ErrorReason "));
  }

  @Override
  public String toString() {
    return value;
  }

  private String toJson() {
    return value;
  }

  private static ErrorReason fromJson(JsonInput input) {
    return fromString(input.nextString());
  }
}
