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

package org.openqa.selenium.bidi.script;

import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

@Beta
public class ExceptionDetails {

  private final long columnNumber;
  private final RemoteValue exception;
  private final long lineNumber;
  private final StackTrace stacktrace;
  private final String text;

  public ExceptionDetails(
      long columnNumber,
      RemoteValue exception,
      long lineNumber,
      StackTrace stacktrace,
      String text) {
    this.columnNumber = columnNumber;
    this.exception = exception;
    this.lineNumber = lineNumber;
    this.stacktrace = stacktrace;
    this.text = text;
  }

  public static ExceptionDetails fromJson(JsonInput input) {
    long columnNumber = 0L;
    RemoteValue exception = null;
    long lineNumber = 0L;
    StackTrace stackTrace = null;
    String text = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "columnNumber":
          columnNumber = input.readNonNull(Long.class);
          break;

        case "exception":
          exception = input.read(RemoteValue.class);
          break;

        case "lineNumber":
          lineNumber = input.readNonNull(Long.class);
          break;

        case "stackTrace":
          stackTrace = input.read(StackTrace.class);
          break;

        case "text":
          text = input.read(String.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new ExceptionDetails(
        columnNumber,
        Require.nonNull("exception", exception),
        lineNumber,
        Require.nonNull("stackTrace", stackTrace),
        Require.nonNull("text", text));
  }

  public long getColumnNumber() {
    return this.columnNumber;
  }

  public RemoteValue getException() {
    return this.exception;
  }

  public long getLineNumber() {
    return this.lineNumber;
  }

  public StackTrace getStacktrace() {
    return this.stacktrace;
  }

  public String getText() {
    return this.text;
  }
}
