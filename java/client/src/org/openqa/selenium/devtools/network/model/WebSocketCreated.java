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

package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

public class WebSocketCreated {

  /**
   * request identifier
   */
  private final RequestId requestId;

  /**
   * WebSocket request Url
   */
  private final String url;

  /**
   * Request initiator.
   * Optional
   */
  private final Initiator initiator;


  public RequestId getRequestId() {
    return requestId;
  }

  public String getUrl() {
    return url;
  }

  public Initiator getInitiator() {
    return initiator;
  }

  private WebSocketCreated(RequestId requestId, String url,
                           Initiator initiator) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for WebSocketCreated");
    this.url = requireNonNull(url, "'url' is required for WebSocketCreated");
    this.initiator = initiator;
  }

  private static WebSocketCreated fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    String url = null;
    Initiator initiator = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "url":
          url = input.nextString();
          break;
        case "initiator":
          initiator = input.read(Initiator.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WebSocketCreated(requestId, url, initiator);
  }
}
