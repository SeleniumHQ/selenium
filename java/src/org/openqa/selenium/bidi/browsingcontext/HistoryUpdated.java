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

import static java.util.Collections.unmodifiableMap;

import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.json.JsonInput;

public class HistoryUpdated {

  private final String browsingContextId;

  private final int timestamp;

  private final String url;

  private HistoryUpdated(String browsingContextId, int timestamp, String url) {
    this.browsingContextId = browsingContextId;
    this.timestamp = timestamp;
    this.url = url;
  }

  public static HistoryUpdated fromJson(JsonInput input) {
    String browsingContextId = null;
    int timestamp = 0;
    String url = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "context":
          browsingContextId = input.read(String.class);
          break;

        case "timestamp":
          timestamp = input.read(int.class);
          break;

        case "url":
          url = input.read(String.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new HistoryUpdated(browsingContextId, timestamp, url);
  }

  public String getBrowsingContextId() {
    return browsingContextId;
  }

  public int getTimestamp() {
    return timestamp;
  }

  public String getUrl() {
    return url;
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    toReturn.put("browsingContextId", this.getBrowsingContextId());
    toReturn.put("timestamp", this.getTimestamp());
    toReturn.put("url", this.getUrl());

    return unmodifiableMap(toReturn);
  }
}
