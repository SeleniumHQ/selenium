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
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;

public class FunctionCoverage {

  /**
   * JavaScript function name.
   */
  private String functionName;
  /**
   * JavaScript function name.
   */
  private List<CoverageRange> ranges;
  /**
   * Whether coverage data for this function has block granularity.
   */
  private Boolean isBlockCoverage;

  public FunctionCoverage(String functionName, List<CoverageRange> ranges, boolean isBlockCoverage) {
    this.setFunctionName(functionName);
    this.setRanges(ranges);
    this.setBlockCoverage(isBlockCoverage);
  }

  public static FunctionCoverage fromJson(JsonInput input) {

    String functionName = null;
    List<CoverageRange> ranges = null;
    Boolean isBlockCoverage = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "functionName":
          functionName = input.nextString();
          break;
        case "ranges":
          ranges = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            ranges.add(CoverageRange.fronJson(input));
          }
          input.endArray();
          break;
        case "isBlockCoverage":
          isBlockCoverage = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new FunctionCoverage(functionName, ranges, isBlockCoverage);
  }

  public String getFunctionName() {
    return functionName;
  }

  public void setFunctionName(String functionName) {
    Objects.requireNonNull(functionName, "functionName is require");
    this.functionName = functionName;
  }

  public List<CoverageRange> getRanges() {
    return ranges;
  }

  public void setRanges(List<CoverageRange> ranges) {
    Objects.requireNonNull(ranges, "ranges is require");
    if (ranges.isEmpty()) {
      throw new DevToolsException("ranges is require");
    }
    this.ranges = ranges;
  }

  public boolean isBlockCoverage() {
    return isBlockCoverage;
  }

  public void setBlockCoverage(Boolean blockCoverage) {
    isBlockCoverage = blockCoverage;
  }
}
