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

import static java.util.Objects.requireNonNullElse;

import org.openqa.selenium.json.JsonInput;

public class DownloadCanceled extends NavigationInfo {

  private final String status;

  private static final String CANCELED = "canceled";

  DownloadCanceled(
      String browsingContextId, String navigationId, long timestamp, String url, String status) {
    super(browsingContextId, navigationId, timestamp, url);
    this.status = requireNonNullElse(status, CANCELED);
  }

  public static DownloadCanceled fromJson(JsonInput input) {
    String browsingContextId = null;
    String navigationId = null;
    long timestamp = 0;
    String url = null;
    String status = CANCELED;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "context":
          browsingContextId = input.read(String.class);
          break;

        case "navigation":
          navigationId = input.read(String.class);
          break;

        case "timestamp":
          timestamp = input.read(Long.class);
          break;

        case "url":
          url = input.read(String.class);
          break;

        case "status":
          status = input.read(String.class);
          if (!CANCELED.equals(status)) {
            throw new IllegalArgumentException(
                "Expected status '" + CANCELED + "' , but got: " + status);
          }
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new DownloadCanceled(browsingContextId, navigationId, timestamp, url, status);
  }

  public String getStatus() {
    return status;
  }
}
