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

import org.openqa.selenium.json.JsonInput;

public class DownloadEnded {

  private final NavigationInfo downloadParams;

  public DownloadEnded(NavigationInfo downloadParams) {
    this.downloadParams = downloadParams;
  }

  public static DownloadEnded fromJson(JsonInput input) {
    String browsingContextId = null;
    String navigationId = null;
    long timestamp = 0;
    String url = null;
    String status = null;
    String filepath = null;

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
          break;
        case "filepath":
          filepath = input.read(String.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    // Create the appropriate object based on status
    if ("canceled".equals(status)) {
      DownloadCanceled canceled =
          new DownloadCanceled(browsingContextId, navigationId, timestamp, url, status);
      return new DownloadEnded(canceled);
    } else if ("complete".equals(status)) {
      DownloadCompleted completed =
          new DownloadCompleted(browsingContextId, navigationId, timestamp, url, status, filepath);
      return new DownloadEnded(completed);
    } else {
      throw new IllegalArgumentException(
          "status must be either 'canceled' or 'complete', but got: " + status);
    }
  }

  public NavigationInfo getDownloadParams() {
    return downloadParams;
  }

  public boolean isCanceled() {
    return downloadParams instanceof DownloadCanceled;
  }

  public boolean isCompleted() {
    return downloadParams instanceof DownloadCompleted;
  }

}
