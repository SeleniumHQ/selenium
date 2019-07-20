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
 * Information about the request initiator
 */
public class Initiator {

  private InitiatorType type;

  private StackTrace stack;

  private String url;

  private Double lineNumber;

  private Initiator(InitiatorType type, StackTrace stack, String url, Double lineNumber) {
    this.type = requireNonNull(type, "'type' is required for Initiator");
    this.stack = stack;
    this.url = url;
    this.lineNumber = lineNumber;
  }

  /**
   * Type of this initiator.
   */
  public InitiatorType getType() {
    return type;
  }

  /**
   * Type of this initiator.
   */
  public void setType(InitiatorType type) {
    this.type = type;
  }

  /**
   * Initiator JavaScript stack trace, set for Script only.
   */
  public StackTrace getStack() {
    return stack;
  }

  /**
   * Initiator JavaScript stack trace, set for Script only.
   */
  public void setStack(StackTrace stack) {
    this.stack = stack;
  }

  /**
   * Initiator URL, set for Parser type or for Script type (when script is importing module) or for
   * SignedExchange type.
   */
  public String getUrl() {
    return url;
  }

  /**
   * Initiator URL, set for Parser type or for Script type (when script is importing module) or for
   * SignedExchange type.
   */
  public void setUrl(String url) {
    this.url = url;
  }

  /**
   * Initiator line number, set for Parser type or for Script type (when script is importing module)
   * (0-based).
   */
  public Double getLineNumber() {
    return lineNumber;
  }

  /**
   * Initiator line number, set for Parser type or for Script type (when script is importing module)
   * (0-based).
   */
  public void setLineNumber(Double lineNumber) {
    this.lineNumber = lineNumber;
  }

  private static Initiator fromJson(JsonInput input) {

    InitiatorType initiatorType = null;
    StackTrace stack = null;
    String initiatorUrl = null;
    Double lineNumber = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          initiatorType = InitiatorType.valueOf(input.nextString());
          break;
        case "stack":
          stack = input.read(StackTrace.class);
          break;
        case "url":
          initiatorUrl = input.nextString();
          break;
        case "lineNumber":
          lineNumber = input.read(Double.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new Initiator(initiatorType, stack, initiatorUrl, lineNumber);
  }
}

