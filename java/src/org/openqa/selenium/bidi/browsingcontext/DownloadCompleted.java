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

import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

public class DownloadCompleted extends NavigationInfo {

  @Nullable private final String filepath;

  DownloadCompleted(
      String browsingContextId,
      @Nullable String navigationId,
      long timestamp,
      String url,
      @Nullable String filepath) {
    super(browsingContextId, navigationId, timestamp, url);
    this.filepath = filepath;
  }

  static DownloadCompleted fromJson(Map<String, @Nullable Object> json) {
    return new DownloadCompleted(
        Require.nonNull("browsingContext", (String) json.get("context")),
        (String) json.get("navigation"),
        Require.positive("Timestamp", (Long) json.get("timestamp")),
        Require.nonNull("URL", (String) json.get("url")),
        (String) json.get("filepath"));
  }

  public String getStatus() {
    return "complete";
  }

  @Nullable
  public String getFilepath() {
    return filepath;
  }
}
