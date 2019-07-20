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
 * Stack entry for runtime errors and assertions.
 */
public class CallFrame {

  private String functionName;

  private String scriptId;

  private String url;

  private Integer lineNumber;

  private Integer columnNumber;

  private CallFrame(String functionName, String scriptId, String url, Integer lineNumber,
                    Integer columnNumber) {
    this.functionName = requireNonNull(functionName, "'functionName' is mandatory for CallFrame");
    this.scriptId = requireNonNull(scriptId, "'scriptId' is mandatory for CallFrame");
    this.url = requireNonNull(url, "'url' is mandatory for CallFrame");
    this.lineNumber = requireNonNull(lineNumber, "'lineNumber' is mandatory for CallFrame");
    this.columnNumber = requireNonNull(columnNumber, "'columnNumber' is mandatory for CallFrame");
  }

  /**
   * JavaScript function name.
   */
  public String getFunctionName() {
    return functionName;
  }

  /**
   * JavaScript function name.
   */
  public void setFunctionName(String functionName) {
    this.functionName = functionName;
  }

  /**
   * JavaScript script id.
   */
  public String getScriptId() {
    return scriptId;
  }

  /**
   * JavaScript script id.
   */
  public void setScriptId(String scriptId) {
    this.scriptId = scriptId;
  }

  /**
   * JavaScript script name or url.
   */
  public String getUrl() {
    return url;
  }

  /**
   * JavaScript script name or url.
   */
  public void setUrl(String url) {
    this.url = url;
  }

  /**
   * JavaScript script line number (0-based).
   */
  public Integer getLineNumber() {
    return lineNumber;
  }

  /**
   * JavaScript script line number (0-based).
   */
  public void setLineNumber(Integer lineNumber) {
    this.lineNumber = lineNumber;
  }

  /**
   * JavaScript script column number (0-based).
   */
  public Integer getColumnNumber() {
    return columnNumber;
  }

  /**
   * JavaScript script column number (0-based).
   */
  public void setColumnNumber(Integer columnNumber) {
    this.columnNumber = columnNumber;
  }

  private static CallFrame fromJson(JsonInput input) {
    String functionName = null;
    String scriptId = null;
    String callFrameUrl = null;
    Integer callFrameLineNumber = null;
    Integer columnNumber = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "functionName":
          functionName = input.nextString();
          break;
        case "scriptId":
          scriptId = input.nextString();
          break;
        case "url":
          callFrameUrl = input.nextString();
          break;
        case "lineNumber":
          callFrameLineNumber = input.read(Integer.class);
          break;
        case "columnNumber":
          columnNumber = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new CallFrame(functionName, scriptId, callFrameUrl, callFrameLineNumber, columnNumber);
  }
}
