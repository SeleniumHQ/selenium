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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

/**
 * Type profile data collected during runtime for a JavaScript script.EXPERIMENTAL
 */
@Beta
public class ScriptTypeProfile {

  /**
   * JavaScript script id.
   */
  private String scriptId;
  /**
   * JavaScript script name or url.
   */
  private String url;
  /**
   * Type profile entries for parameters and return values of the functions in the script.
   */
  private List<TypeProfileEntry> entries;

  public ScriptTypeProfile(String scriptId, String url,
    List<TypeProfileEntry> entries) {
    this.setScriptId(scriptId);
    this.setUrl(url);
    this.setEntries(entries);
  }

  public static ScriptTypeProfile fromJson(JsonInput input) {
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
            entries.add(TypeProfileEntry.fromJson(input));
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

  public void setScriptId(String scriptId) {
    Objects.requireNonNull(scriptId, "scriptId is require");
    this.scriptId = scriptId;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    Objects.requireNonNull(url, "url is require");
    this.url = url;
  }

  public List<TypeProfileEntry> getEntries() {
    return entries;
  }

  public void setEntries(
    List<TypeProfileEntry> entries) {
    Objects.requireNonNull(entries, "entries are require");
    if (entries.isEmpty()) {
      throw new DevToolsException("entries are require");
    }
    this.entries = entries;
  }
}
