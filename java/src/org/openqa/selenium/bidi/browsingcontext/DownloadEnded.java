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

import java.io.StringReader;
import java.util.Map;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

public class DownloadEnded {

  private static final String CANCELED = "canceled";
  private static final String COMPLETE = "complete";

  private final NavigationInfo downloadParams;

  public DownloadEnded(NavigationInfo downloadParams) {
    this.downloadParams = downloadParams;
  }

  public static DownloadEnded fromJson(JsonInput input) {
    Map<String, Object> jsonMap = input.read(Map.class);
    String status = (String) jsonMap.get("status");

    try (StringReader reader = new StringReader(new Json().toJson(jsonMap));
        JsonInput jsonInput = new Json().newInput(reader)) {
      if (CANCELED.equals(status)) {
        return new DownloadEnded(DownloadCanceled.fromJson(jsonInput));
      } else if (COMPLETE.equals(status)) {
        return new DownloadEnded(DownloadCompleted.fromJson(jsonInput));
      } else {
        throw new IllegalArgumentException(
            "status must be either '" + CANCELED + "' or '" + COMPLETE + "', but got: " + status);
      }
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
