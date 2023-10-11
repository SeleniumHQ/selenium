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


import java.util.Map;
import org.openqa.selenium.json.JsonInput;

// @see <a
// href="https://w3c.github.io/webdriver-bidi/#types-log-logentry">https://w3c.github.io/webdriver-bidi/#types-log-logentry</a>
public class JavascriptLogEntry extends GenericLogEntry implements LogEntryUtils {

  private final String type;

  public JavascriptLogEntry(
    LogLevel level, String text, long timestamp, StackTrace stackTrace) {
    super(level, text, timestamp, "javascript", stackTrace);
    this.type = "javascript";
  }

  public String getType() {
    return type;
  }

  public static JavascriptLogEntry fromJson(JsonInput input) {
    return (JavascriptLogEntry) LogEntryUtils.fromJson("JavascriptLogEntry", input, "javascript");
  }

  private Map<String, Object> toJson() {
    return super.JsonMap(type);
  }
}
