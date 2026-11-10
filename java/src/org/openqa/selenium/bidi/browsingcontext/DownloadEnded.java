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
import org.openqa.selenium.Beta;
import org.openqa.selenium.json.JsonInput;

@Beta
public class DownloadEnded {

  private static final String CANCELED = "canceled";
  private static final String COMPLETE = "complete";

  private final NavigationInfo downloadParams;

  public DownloadEnded(NavigationInfo downloadParams) {
    this.downloadParams = downloadParams;
  }

  public static DownloadEnded fromJson(JsonInput input) {
    Map<String, Object> jsonMap = input.readMap();
    String status = (String) jsonMap.get("status");

    switch (status) {
      case CANCELED:
        return new DownloadEnded(DownloadCanceled.fromJson(jsonMap));
      case COMPLETE:
        return new DownloadEnded(DownloadCompleted.fromJson(jsonMap));
      default:
        throw new IllegalArgumentException(
            String.format(
                "status must be either '%s' or '%s', but got: %s", CANCELED, COMPLETE, status));
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
