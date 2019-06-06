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

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Type profile data collected during runtime for a JavaScript script.EXPERIMENTAL
 */
@Beta
public class ScriptTypeProfile {

  /**
   * JavaScript script id.
   */
  private final String scriptId;
  /**
   * JavaScript script name or url.
   */
  private final String url;
  /**
   * Type profile entries for parameters and return values of the functions in the script.
   */
  private final List<TypeProfileEntry> entries;

  public ScriptTypeProfile(String scriptId, String url,
                           List<TypeProfileEntry> entries) {
    validateEntries(entries);
    Objects.requireNonNull(url, "url is require");
    Objects.requireNonNull(scriptId, "scriptId is require");

    this.scriptId = scriptId;
    this.url = url;
    this.entries = entries;
  }

  private static ScriptTypeProfile fromJson(JsonInput input) {
    String scriptId = input.nextString();
    String url = null;
    List<TypeProfileEntry> entries = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "url":
          url = input.nextString();
          break;
        case "entries":
          entries = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            entries.add(input.read(ScriptTypeProfile.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ScriptTypeProfile(scriptId, url, entries);
  }

  public String getScriptId() {
    return scriptId;
  }

  public String getUrl() {
    return url;
  }

  public List<TypeProfileEntry> getEntries() {
    return entries;
  }

  private void validateEntries(List<TypeProfileEntry> entries) {
    Objects.requireNonNull(entries, "entries are require");
    if (entries.isEmpty()) {
      throw new DevToolsException("entries are require");
    }
  }
}
