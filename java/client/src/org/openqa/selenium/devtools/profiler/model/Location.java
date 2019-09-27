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

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/**
 * Location in the source code.
 */
public class Location {

  /**
   * Script identifier as reported in the Debugger.scriptParsed.
   */
  private final String scriptId;
  /**
   * Line number in the script (0-based).
   */
  private final int lineNumber;
  /**
   * Column number in the script (0-based). Optional
   */
  private final Integer columnNumber;

  public Location(String scriptId, int lineNumber, Integer columnNumber) {
    Objects.requireNonNull(scriptId, "scriptId is require");

    this.scriptId = scriptId;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
  }

  private static Location fromJson(JsonInput input) {
    String scriptId = input.nextString();
    int lineNumber = -1;
    Integer columnNumber = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "lineNumber":
          lineNumber = input.read(Integer.class);
          break;
        case "columnNumber":
          columnNumber = input.read(Integer.class);
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


  public int getLineNumber() {
    return lineNumber;
  }


  public Integer getColumnNumber() {
    return columnNumber;
  }

}
