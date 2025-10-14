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

package org.openqa.selenium.bidi.permissions;

public enum PermissionState {
  GRANTED("granted"),
  DENIED("denied"),
  PROMPT("prompt");

  private final String state;

  PermissionState(String state) {
    this.state = state;
  }

  @Override
  public String toString() {
    return state;
  }

  public static PermissionState findByName(String name) {
    PermissionState result = null;
    for (PermissionState state : values()) {
      if (state.toString().equalsIgnoreCase(name)) {
        result = state;
        break;
      }
    }
    return result;
  }
}
