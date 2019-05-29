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

public class WebSocketFrameError {

  /**
   * request identifier
   */
  private final RequestId requestId;

  /**
   * TimeStamp
   */
  private final MonotonicTime monotonicTime;

  /**
   * WebSocket Error Message
   */
  private final String errorMessage;


  private WebSocketFrameError(RequestId requestId,
                              MonotonicTime monotonicTime,
                              String errorMessage) {
    this.requestId = requireNonNull(requestId, "'requestId' is required for WebSocketFrameError");
    this.monotonicTime =
        requireNonNull(monotonicTime, "'monotonicTime' is required for WebSocketFrameError");
    this.errorMessage =
        requireNonNull(errorMessage, "'errorMessage' is required for WebSocketFrameError");
  }

  private static WebSocketFrameError fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    MonotonicTime monotonicTime = null;
    String errorMessage = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "monotonicTime":
          monotonicTime = MonotonicTime.parse(input.nextNumber());
          break;
        case "errorMessage":
          errorMessage = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WebSocketFrameError(requestId, monotonicTime, errorMessage);
  }
}
