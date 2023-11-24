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

package org.openqa.selenium.bidi;

import static java.util.Collections.unmodifiableMap;

import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public class BiDiSessionStatus {

  private final boolean ready;
  private final String message;

  public BiDiSessionStatus(boolean ready, String message) {
    this.ready = Require.nonNull("Session's readiness", ready);
    this.message = Require.nonNull("Message", message);
  }

  public static BiDiSessionStatus fromJson(JsonInput input) {
    boolean ready = false;
    String message = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "ready":
          ready = input.read(Boolean.class);
          break;

        case "message":
          message = input.read(String.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new BiDiSessionStatus(ready, message);
  }

  public boolean isReady() {
    return ready;
  }

  public String getMessage() {
    return message;
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("ready", ready);
    toReturn.put("message", message);

    return unmodifiableMap(toReturn);
  }
}
