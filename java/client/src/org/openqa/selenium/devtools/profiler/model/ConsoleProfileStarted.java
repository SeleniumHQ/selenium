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

package org.openqa.selenium.devtools.profiler.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class ConsoleProfileStarted {

  private final String id;
  /**
   * Location of console.profileEnd().
   */
  private final Location location;
  /**
   * Profile title passed as an argument to console.profile().
   *
   * <p>Optional
   */
  private final String title;

  public ConsoleProfileStarted(String id,
                               Location location, String title) {
    Objects.requireNonNull(id, "id is require");
    Objects.requireNonNull(location, "location is require");

    this.id = id;
    this.location = location;
    this.title = title;
  }

  private static ConsoleProfileStarted fromJson(JsonInput input) {
    String id = input.nextString();
    Location location = null;
    String title = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "location":
          location = input.read(Location.class);
          break;
        case "title":
          title = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ConsoleProfileStarted(id, location, title);
  }

  public String getId() {
    return id;
  }

  public Location getLocation() {
    return location;
  }

  public String getTitle() {
    return title;
  }

}
