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

public class ResourceContent {

  /**
   * \Resource content.
   */
  private final String content;
  /**
   * True, if content was served as base64.
   */
  private final boolean base64Encoded;

  public ResourceContent(String content, Boolean base64Encoded) {
    this.content = Objects.requireNonNull(content, "content is required");
    this.base64Encoded = Objects.requireNonNull(base64Encoded, "base64Encoded is required");
  }

  private static ResourceContent fromJson(JsonInput input) {
    String content = input.nextString();
    Boolean base64Encoded = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "base64Encoded":
          base64Encoded = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ResourceContent(content, base64Encoded);
  }
}
