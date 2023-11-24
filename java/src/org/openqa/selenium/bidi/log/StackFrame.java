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

package org.openqa.selenium.bidi.log;

import static java.util.Collections.unmodifiableMap;

import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.json.JsonInput;

// @see <a
// href="https://w3c.github.io/webdriver-bidi/#types-script-StackFrame">https://w3c.github.io/webdriver-bidi/#types-script-StackFrame</a>
public class StackFrame {

  private final String url;
  private final String functionName;
  private final int lineNumber;
  private final int columnNumber;

  public StackFrame(String scriptUrl, String function, int lineNumber, int columnNumber) {
    this.url = scriptUrl;
    this.functionName = function;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
  }

  public String getUrl() {
    return url;
  }

  public String getFunctionName() {
    return functionName;
  }

  public int getLineNumber() {
    return lineNumber;
  }

  public int getColumnNumber() {
    return columnNumber;
  }

  public static StackFrame fromJson(JsonInput input) {
    String url = null;
    String functionName = null;
    int lineNumber = 0;
    int columnNumber = 0;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "url":
          url = input.read(String.class);
          break;

        case "functionName":
          functionName = input.read(String.class);
          break;

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

    input.endObject();

    return new StackFrame(url, functionName, lineNumber, columnNumber);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    toReturn.put("url", url);
    toReturn.put("functionName", functionName);
    toReturn.put("lineNumber", lineNumber);
    toReturn.put("columnNumber", columnNumber);

    return unmodifiableMap(toReturn);
  }
}
