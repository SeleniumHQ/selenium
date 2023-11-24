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

package org.openqa.selenium.events;

import java.util.Objects;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public final class EventName {

  private final String name;

  public EventName(String name) {
    this.name = Require.nonNull("Type name", name);
  }

  public String getName() {
    return name;
  }

  @Override
  public String toString() {
    return name;
  }

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof EventName)) {
      return false;
    }

    EventName that = (EventName) obj;
    return Objects.equals(this.name, that.name);
  }

  @Override
  public int hashCode() {
    return name.hashCode();
  }

  private String toJson() {
    return name;
  }

  private static EventName fromJson(JsonInput input) {
    return new EventName(input.nextString());
  }
}
