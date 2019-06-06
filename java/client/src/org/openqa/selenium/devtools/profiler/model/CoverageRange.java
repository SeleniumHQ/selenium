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

/**
 * Coverage data for a source range.
 */
public class CoverageRange {

  /**
   * JavaScript script source offset for the range start.
   */
  private final int startOffset;
  /**
   * JavaScript script source offset for the range end.
   */
  private final int endOffset;
  /**
   * Collected execution count of the source range.
   */
  private final int count;

  public CoverageRange(int startOffset, int endOffset, int count) {
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.count = count;
  }

  private static CoverageRange fromJson(JsonInput input) {
    int startOffset = 0;
    int endOffset = 0;
    int count = 0;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "startOffset":
          startOffset = input.read(Integer.class);
          break;
        case "endOffset":
          endOffset = input.read(Integer.class);
          break;
        case "count":
          count = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new CoverageRange(startOffset, endOffset, count);
  }

  public int getStartOffset() {
    return startOffset;
  }


  public int getEndOffset() {
    return endOffset;
  }


  public int getCount() {
    return count;
  }

}
