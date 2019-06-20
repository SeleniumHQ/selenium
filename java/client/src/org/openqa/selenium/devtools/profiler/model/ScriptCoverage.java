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

import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Coverage data for a JavaScript script
 */
public class ScriptCoverage {

  /**
   * JavaScript script id.
   */
  private final String scriptId;
  /**
   * JavaScript script name or url.
   */
  private final String url;
  /**
   * Functions contained in the script that has coverage data.
   */
  private final List<FunctionCoverage> functions;

  public ScriptCoverage(String scriptId, String url,
                        List<FunctionCoverage> functions) {
    validateFunctionCovarage(functions);
    Objects.requireNonNull(url, "url is require");
    Objects.requireNonNull(scriptId, "scriptId is require");

    this.scriptId = scriptId;
    this.url = url;
    this.functions = functions;
  }

  private static ScriptCoverage parse(JsonInput input) {
    String scriptId = null;
    String url = null;
    List<FunctionCoverage> functionCoverages = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "scriptId":
          scriptId = input.nextString();
          break;
        case "url":
          url = input.nextString();
          break;
        case "functions":
          functionCoverages = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            functionCoverages.add(input.read(FunctionCoverage.class));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;

      }
    }
    input.endObject();
    return new ScriptCoverage(scriptId, url, functionCoverages);
  }

  private static List<ScriptCoverage> fromJson(JsonInput input) {
    List<ScriptCoverage> coverages = new ArrayList<>();
    while (input.hasNext()) {
      coverages.add(parse(input));
    }
    return coverages;
  }

  public String getScriptId() {
    return scriptId;
  }

  private void validateFunctionCovarage(List<FunctionCoverage> functionCoverages) {
    Objects.requireNonNull(functionCoverages, "functions is require");
    if (functionCoverages.isEmpty()) {
      throw new DevToolsException("functions are required");
    }
  }

  public String getUrl() {
    return url;
  }

  public List<FunctionCoverage> getFunctions() {
    return functions;
  }


}
