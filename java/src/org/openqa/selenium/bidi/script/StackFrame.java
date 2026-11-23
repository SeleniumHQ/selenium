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

import static java.util.Collections.unmodifiableMap;

import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;

@Beta
public class StackFrame {

  private final String url;
  private final String functionName;
  private final int lineNumber;
  private final int columnNumber;

  // Constructor parameter names are used as JSON field names.
  private StackFrame(String url, String functionName, int lineNumber, int columnNumber) {
    this.url = url;
    this.functionName = functionName;
    this.lineNumber = Require.nonNegative("lineNumber", lineNumber);
    this.columnNumber = Require.nonNegative("columnNumber", columnNumber);
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

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    toReturn.put("url", url);
    toReturn.put("functionName", functionName);
    toReturn.put("lineNumber", lineNumber);
    toReturn.put("columnNumber", columnNumber);

    return unmodifiableMap(toReturn);
  }
}
