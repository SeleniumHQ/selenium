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

/**
 * WebSocket message data. This represents an entire WebSocket message, not just a fragmented frame as the name suggests.
 */
public class WebSocketFrame {

  /**
   * WebSocket message opcode.
   */
  private Number opcode;
  /**
   * WebSocket message mask.
   */
  private boolean mask;

  /**
   * WebSocket message payload data. If the opcode is 1, this is a text message and payloadData is a UTF-8 string. If the opcode isn't 1, then payloadData is a base64 encoded string representing binary data.
   */
  private String payloadData;

  private WebSocketFrame(Number opcode, boolean mask, String payloadData) {
    this.opcode = requireNonNull(opcode, "'opcode' is required for WebSocketFrame");
    this.mask = mask;
    this.payloadData = requireNonNull(payloadData, "'payloadData' is required for WebSocketFrame");
  }

  private static WebSocketFrame fromJson(JsonInput input) {

    Number opcode = null;
    boolean mask = false;
    String payloadData = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "opcode":
          opcode = input.nextNumber();
          break;
        case "mask":
          mask = input.nextBoolean();
          break;
        case "payloadData":
          payloadData = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new WebSocketFrame(opcode, mask, payloadData);
  }

  public Number getOpcode() {
    return opcode;
  }

  public boolean isMask() {
    return mask;
  }

  public String getPayloadData() {
    return payloadData;
  }

}
