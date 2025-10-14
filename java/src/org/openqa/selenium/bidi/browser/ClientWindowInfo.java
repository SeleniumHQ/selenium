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

package org.openqa.selenium.bidi.browser;

import java.util.Map;

public class ClientWindowInfo {
  private final String clientWindow;
  private final ClientWindowState state;
  private final Integer width;
  private final Integer height;
  private final Integer x;
  private final Integer y;
  private final boolean active;

  public ClientWindowInfo(
      String clientWindow,
      ClientWindowState state,
      Integer width,
      Integer height,
      Integer x,
      Integer y,
      boolean active) {
    this.clientWindow = clientWindow;
    this.state = state;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.active = active;
  }

  public static ClientWindowInfo fromJson(Map<String, Object> map) {
    return new ClientWindowInfo(
        (String) map.get("clientWindow"),
        ClientWindowState.fromString((String) map.get("state")),
        ((Number) map.get("width")).intValue(),
        ((Number) map.get("height")).intValue(),
        ((Number) map.get("x")).intValue(),
        ((Number) map.get("y")).intValue(),
        (Boolean) map.get("active"));
  }

  public String getClientWindow() {
    return clientWindow;
  }

  public ClientWindowState getState() {
    return state;
  }

  public Integer getWidth() {
    return width;
  }

  public Integer getHeight() {
    return height;
  }

  public Integer getX() {
    return x;
  }

  public Integer getY() {
    return y;
  }

  public boolean isActive() {
    return active;
  }
}
