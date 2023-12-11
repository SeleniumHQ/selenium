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
package org.openqa.selenium.bidi.script;

import java.util.Optional;
import org.openqa.selenium.json.JsonInput;

public class Source {
  private final String realm;
  private final Optional<String> browsingContext;

  private Source(String realm, Optional<String> browsingContext) {
    this.realm = realm;
    this.browsingContext = browsingContext;
  }

  public static Source fromJson(JsonInput input) {
    String realm = null;
    Optional<String> browsingContext = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "realm":
          realm = input.read(String.class);
          break;

        case "context":
          browsingContext = Optional.ofNullable(input.read(String.class));
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new Source(realm, browsingContext);
  }

  public String getRealm() {
    return realm;
  }

  public Optional<String> getBrowsingContext() {
    return browsingContext;
  }
}
