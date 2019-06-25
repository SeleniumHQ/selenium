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
package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class CompilationCacheProduced {

  private final String url;
  /**
   * Base64-encoded data
   */
  private final String data;

  public CompilationCacheProduced(String url, String data) {
    this.url = Objects.requireNonNull(url, "url is required");
    this.data = Objects.requireNonNull(data, "data is required");
  }

  private static CompilationCacheProduced fromJson(JsonInput input) {
    String url = null,
        data = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "data":
          data = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new CompilationCacheProduced(url, data);
  }
}
