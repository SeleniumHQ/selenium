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

import java.util.Optional;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

@Beta
public class UserPromptClosed {

  private final String browsingContextId;
  private final boolean accepted;
  private final Optional<String> userText;

  private UserPromptClosed(String browsingContextId, boolean accepted, Optional<String> userText) {
    this.browsingContextId = browsingContextId;
    this.accepted = accepted;
    this.userText = userText;
  }

  public static UserPromptClosed fromJson(JsonInput input) {
    String browsingContextId = null;
    Boolean accepted = null;
    Optional<String> userText = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "context":
          browsingContextId = input.read(String.class);
          break;

        case "accepted":
          accepted = input.read(boolean.class);
          break;

        case "userText":
          userText = Optional.ofNullable(input.read(String.class));
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new UserPromptClosed(
        Require.nonNull("browsingContext", browsingContextId),
        Require.nonNull("accepted", accepted),
        userText);
  }

  public String getBrowsingContextId() {
    return browsingContextId;
  }

  public boolean getAccepted() {
    return accepted;
  }

  public Optional<String> getUserText() {
    return userText;
  }
}
