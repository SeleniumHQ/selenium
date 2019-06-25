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
package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class DownloadWillBegin {

  /**
   * Id of the frame that caused download to begin.
   */
  private final FrameId frameId;
  /**
   * URL of the resource being downloaded.
   */
  private final String url;

  public DownloadWillBegin(FrameId frameId, String url) {
    this.frameId = Objects.requireNonNull(frameId, "frameId is required");
    this.url = Objects.requireNonNull(url, "url is required");
  }

  private static DownloadWillBegin fromJson(JsonInput input) {
    FrameId frameId = input.read(FrameId.class);
    String url = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "url":
          url = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new DownloadWillBegin(frameId, url);
  }
}
