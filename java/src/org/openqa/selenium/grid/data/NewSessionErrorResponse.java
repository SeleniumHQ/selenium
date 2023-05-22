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

package org.openqa.selenium.grid.data;

import static java.util.Collections.unmodifiableMap;

import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public class NewSessionErrorResponse {

  private final String message;
  private final RequestId requestId;

  public NewSessionErrorResponse(RequestId requestId, String message) {
    this.requestId = Require.nonNull("Request Id", requestId);
    this.message = Require.nonNull("Message", message);
  }

  public String getMessage() {
    return message;
  }

  public RequestId getRequestId() {
    return requestId;
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("message", message);
    toReturn.put("requestId", requestId);
    return unmodifiableMap(toReturn);
  }

  private static NewSessionErrorResponse fromJson(JsonInput input) {
    String message = null;
    RequestId requestId = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "message":
          message = input.read(String.class);
          break;

        case "requestId":
          requestId = input.read(RequestId.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new NewSessionErrorResponse(requestId, message);
  }
}
