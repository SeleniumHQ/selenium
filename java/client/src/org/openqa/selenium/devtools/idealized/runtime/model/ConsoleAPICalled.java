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

package org.openqa.selenium.devtools.idealized.runtime.model;

import org.openqa.selenium.internal.Require;

import java.time.Instant;
import java.util.List;

public class ConsoleAPICalled {

  private final String type;
  private final Instant timestamp;
  private final List<Object> args;

  public ConsoleAPICalled(String type, Instant timestamp, List<Object> args) {
    this.type = Require.nonNull("Type", type);
    this.timestamp = Require.nonNull("Timestamp", timestamp);
    this.args = Require.nonNull("Args", args);
  }

  public String getType() {
    return type;
  }

  public Instant getTimestamp() {
    return timestamp;
  }

  public List<Object> getArgs() {
    return args;
  }
}
