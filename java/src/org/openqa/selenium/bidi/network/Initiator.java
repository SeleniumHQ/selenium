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

package org.openqa.selenium.bidi.network;

import java.util.Optional;
import org.openqa.selenium.Beta;
import org.openqa.selenium.bidi.log.StackTrace;

@Beta
public class Initiator {

  public enum Type {
    PARSER("parser"),
    SCRIPT("script"),
    PREFLIGHT("preflight"),
    OTHER("other");

    private final String initiatorType;

    Type(String type) {
      this.initiatorType = type;
    }

    @Override
    public String toString() {
      return initiatorType;
    }

    public static Type findByName(String name) {
      for (Type type : values()) {
        if (type.toString().equalsIgnoreCase(name)) {
          return type;
        }
      }
      throw new IllegalArgumentException("Unsupported initiator type: " + name);
    }
  }

  private final Type type;
  private final Optional<Long> columnNumber;
  private final Optional<Long> lineNumber;
  private final Optional<StackTrace> stackTrace;
  private final Optional<String> requestId;

  private Initiator(
      Type type,
      Optional<Long> columnNumber,
      Optional<Long> lineNumber,
      Optional<StackTrace> stackTrace,
      Optional<String> requestId) {
    this.type = type;
    this.columnNumber = columnNumber;
    this.lineNumber = lineNumber;
    this.stackTrace = stackTrace;
    this.requestId = requestId;
  }

  public Type getType() {
    return type;
  }

  public Optional<Long> getColumnNumber() {
    return columnNumber;
  }

  public Optional<Long> getLineNumber() {
    return lineNumber;
  }

  public Optional<StackTrace> getStackTrace() {
    return stackTrace;
  }

  public Optional<String> getRequestId() {
    return requestId;
  }
}
