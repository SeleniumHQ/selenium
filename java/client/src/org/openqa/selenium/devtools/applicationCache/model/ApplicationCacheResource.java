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
package org.openqa.selenium.devtools.applicationCache.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/** Detailed application cache resource information. */
public class ApplicationCacheResource {

  /** Resource url. */
  private final String url;
  /** Resource size. */
  private final int size;
  /** Resource type. */
  private final String type;

  public ApplicationCacheResource(String url, int size, String type) {
    this.url = Objects.requireNonNull(url, "url is required");
    this.size = Objects.requireNonNull(size, "size is required");
    this.type = Objects.requireNonNull(type, "type is required");
  }

  private static ApplicationCacheResource fromJson(JsonInput input) {
    String url = input.nextString(), type = null;
    Integer size = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          type = input.nextString();
          break;
        case "size":
          size = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ApplicationCacheResource(url, size, type);
  }
}
