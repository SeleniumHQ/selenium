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

package org.openqa.selenium.bidi.browsingcontext;

import java.util.HashMap;
import java.util.Map;

public class CaptureScreenshotParameters {

  public enum Origin {
    VIEWPORT("viewport"),
    DOCUMENT("document");

    private final String value;

    Origin(String value) {
      this.value = value;
    }

    @Override
    public String toString() {
      return value;
    }
  }

  private final Map<String, Object> map = new HashMap<>();

  public CaptureScreenshotParameters origin(Origin origin) {
    map.put("origin", origin.toString());
    return this;
  }

  public CaptureScreenshotParameters imageFormat(String type) {
    map.put("format", Map.of("type", type));
    return this;
  }

  public CaptureScreenshotParameters imageFormat(String type, double quality) {
    map.put("format", Map.of("type", type, "quality", quality));
    return this;
  }

  public CaptureScreenshotParameters clipRectangle(ClipRectangle clipRectangle) {
    map.put("clip", clipRectangle.toMap());
    return this;
  }

  public Map<String, Object> toMap() {
    return map;
  }
}
