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

package org.openqa.selenium.grid.graphql;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Session {

  private final String id;
  private final Capabilities capabilities;
  private final LocalDateTime startTime;
  private static final Json JSON = new Json();

  public Session(String id, Capabilities capabilities, LocalDateTime startTime) {
    this.id = Require.nonNull("Node id", id);
    this.capabilities = Require.nonNull("Node capabilities", capabilities);
    this.startTime = Require.nonNull("Session Start time", startTime);
  }

  public String getId() {
    return id;
  }

  public String getCapabilities() {
    return JSON.toJson(capabilities);
  }

  public String getStartTime() {
    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    return dtf.format(startTime);
  }
}
