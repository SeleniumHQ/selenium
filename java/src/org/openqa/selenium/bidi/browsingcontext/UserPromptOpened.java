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

package org.openqa.selenium.bidi.browsingcontext;

import static java.util.Collections.unmodifiableMap;

import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.json.JsonInput;

public class UserPromptOpened {

  private final String browsingContextId;

  private final UserPromptType type;

  private final String message;

  private UserPromptOpened(String browsingContextId, UserPromptType type, String message) {
    this.browsingContextId = browsingContextId;
    this.type = type;
    this.message = message;
  }

  public static UserPromptOpened fromJson(JsonInput input) {
    String browsingContextId = null;
    UserPromptType type = null;
    String message = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "context":
          browsingContextId = input.read(String.class);
          break;

        case "type":
          String userPromptType = input.read(String.class);
          type = UserPromptType.findByName(userPromptType);
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

    return new UserPromptOpened(browsingContextId, type, message);
  }

  public String getBrowsingContextId() {
    return browsingContextId;
  }

  public UserPromptType getType() {
    return type;
  }

  public String getMessage() {
    return message;
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    toReturn.put("browsingContextId", this.getBrowsingContextId());
    toReturn.put("type", this.getType());
    toReturn.put("message", this.getMessage());

    return unmodifiableMap(toReturn);
  }
}
