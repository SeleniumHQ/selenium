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

package org.openqa.selenium.devtools.applicationCache.model;

import org.openqa.selenium.devtools.page.model.FrameId;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class ApplicationCacheStatusUpdated {

  /** Frame identifier. */
  private final FrameId frameId;
  /** Manifest URL. */
  private final String manifestURL;
  /** Application cache status. */
  private final int status;

  public ApplicationCacheStatusUpdated(FrameId frameId, String manifestURL, int status) {
    this.frameId = Objects.requireNonNull(frameId, "frameId is required");
    this.manifestURL = Objects.requireNonNull(manifestURL, "manifestURL is required");
    this.status = Objects.requireNonNull(status, "status is required");
  }

  private static ApplicationCacheStatusUpdated fromJson(JsonInput input) {
    FrameId frameId = input.read(FrameId.class);
    String manifestURL = null;
    Integer status = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "manifestURL":
          manifestURL = input.nextString();
          break;
        case "status":
          status = input.read(Integer.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new ApplicationCacheStatusUpdated(frameId, manifestURL, status);
  }

  public FrameId getFrameId() {
    return frameId;
  }

  public String getManifestURL() {
    return manifestURL;
  }

  public int getStatus() {
    return status;
  }
}
