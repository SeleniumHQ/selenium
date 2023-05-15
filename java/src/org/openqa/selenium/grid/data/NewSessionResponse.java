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

import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public class NewSessionResponse {

  private final RequestId requestId;
  private final Session session;
  private final byte[] downstreamEncodedResponse;

  public NewSessionResponse(
      RequestId requestId, Session session, byte[] downstreamEncodedResponse) {
    this.requestId = Require.nonNull("Request Id", requestId);
    this.session = Require.nonNull("Session", session);
    this.downstreamEncodedResponse =
        Require.nonNull("Downstream encoded response", downstreamEncodedResponse);
  }

  public RequestId getRequestId() {
    return requestId;
  }

  public Session getSession() {
    return session;
  }

  public byte[] getDownstreamEncodedResponse() {
    return downstreamEncodedResponse;
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new LinkedHashMap<>();
    toReturn.put("requestId", requestId);
    toReturn.put("session", session);
    toReturn.put(
        "downstreamEncodedResponse", Base64.getEncoder().encodeToString(downstreamEncodedResponse));
    return unmodifiableMap(toReturn);
  }

  private static NewSessionResponse fromJson(JsonInput input) {
    RequestId requestId = null;
    Session session = null;
    byte[] downstreamResponse = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "requestId":
          requestId = input.read(RequestId.class);
          break;

        case "session":
          session = input.read(Session.class);
          break;

        case "downstreamEncodedResponse":
          downstreamResponse = Base64.getDecoder().decode(input.nextString());
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new NewSessionResponse(requestId, session, downstreamResponse);
  }
}
