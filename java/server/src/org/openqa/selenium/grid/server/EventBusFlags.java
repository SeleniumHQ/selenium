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

package org.openqa.selenium.grid.server;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.ConfigValue;

public class EventBusFlags {

  @Parameter(
      names = {"--bus"},
      description =  "Connection string for the event bus")
  @ConfigValue(section = "events", name = "address")
  private String connectionString;

  @Parameter(
      names = {"--bus-server"},
      description = "Whether the connection string should be bound or connected")
  @ConfigValue(section = "events", name = "bind")
  private boolean bind;

  public EventBusFlags(int defaultPort) {
    this.connectionString = "tcp://*:" + defaultPort;
  }
}
