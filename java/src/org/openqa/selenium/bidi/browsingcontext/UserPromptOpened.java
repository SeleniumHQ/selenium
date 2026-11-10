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

import static java.util.Objects.requireNonNull;

import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

@Beta
public class UserPromptOpened {

  private final String browsingContextId;
  private final UserPromptType type;
  private final String message;

  @Nullable private final String defaultValue;

  private UserPromptOpened(
      String browsingContextId,
      UserPromptType type,
      String message,
      @Nullable String defaultValue) {
    this.browsingContextId = browsingContextId;
    this.type = type;
    this.message = message;
    this.defaultValue = defaultValue;
  }

  public static UserPromptOpened fromJson(JsonInput input) {
    String browsingContextId = null;
    UserPromptType type = null;
    String message = null;
    String defaultValue = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "context":
          browsingContextId = input.read(String.class);
          break;

        case "type":
          String userPromptType = input.read(String.class);
          type = UserPromptType.findByName(requireNonNull(userPromptType));
          break;

        case "message":
          message = input.read(String.class);
          break;

        case "defaultValue":
          defaultValue = input.read(String.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new UserPromptOpened(
        Require.nonNull("browsingContext", browsingContextId),
        Require.nonNull("User prompt type", type),
        Require.nonNull("User prompt message", message),
        defaultValue);
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

  @Nullable
  public String getDefaultValue() {
    return defaultValue;
  }
}
