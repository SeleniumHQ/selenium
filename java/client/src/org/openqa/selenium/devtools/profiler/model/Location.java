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

package org.openqa.selenium.devtools.profiler.model;

import java.util.Objects;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonInputConverter;

/**
 * Location in the source code.
 */
public class Location {

  /**
   * Script identifier as reported in the Debugger.scriptParsed.
   */
  private String scriptId;
  /**
   * Line number in the script (0-based).
   */
  private int lineNumber;
  /**
   * Column number in the script (0-based). Optional
   */
  private Integer columnNumber;

  public Location(String scriptId, int lineNumber, Integer columnNumber) {
    this.setScriptId(scriptId);
    this.setLineNumber(lineNumber);
    this.setColumnNumber(columnNumber);
  }

  public static Location fronJson(JsonInput input) {
    String scriptId = input.nextString();
    int lineNumber = -1;
    Integer columnNumber = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "lineNumber":
          lineNumber = JsonInputConverter.extractInt(input);
          break;
        case "columnNumber":
          columnNumber = JsonInputConverter.extractInt(input);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new Location(scriptId, lineNumber, columnNumber);
  }

  public String getScriptId() {
    return scriptId;
  }

  public void setScriptId(String scriptId) {
    Objects.requireNonNull(scriptId, "scriptId is require");
    this.scriptId = scriptId;
  }

  public int getLineNumber() {
    return lineNumber;
  }

  public void setLineNumber(int lineNumber) {
    this.lineNumber = lineNumber;
  }

  public Integer getColumnNumber() {
    return columnNumber;
  }

  public void setColumnNumber(Integer columnNumber) {
    this.columnNumber = columnNumber;
  }
}
