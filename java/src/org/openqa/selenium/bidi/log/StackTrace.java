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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

// @see <a
// href="https://w3c.github.io/webdriver-bidi/#types-script-StackTrace">https://w3c.github.io/webdriver-bidi/#types-script-StackTrace</a>
public class StackTrace {

  List<StackFrame> callFrames;

  public StackTrace(List<StackFrame> callFrames) {
    this.callFrames = callFrames;
  }

  public List<StackFrame> getCallFrames() {
    return callFrames;
  }

  public static StackTrace fromJson(JsonInput input) {

    List<StackFrame> callFrames = Collections.emptyList();

    input.beginObject();
    while (input.hasNext()) {
      if ("callFrames".equals(input.nextName())) {
        callFrames = input.read(new TypeToken<List<StackFrame>>() {}.getType());
      } else {
        input.skipValue();
      }
    }

    input.endObject();

    return new StackTrace(callFrames);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("callFrames", callFrames);

    return unmodifiableMap(toReturn);
  }
}
