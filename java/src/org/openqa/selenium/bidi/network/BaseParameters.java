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

package org.openqa.selenium.bidi.network;

import java.util.ArrayList;
import java.util.List;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class BaseParameters {

  private final String browsingContextId;

  private final boolean isBlocked;

  private final String navigationId;

  private final long redirectCount;

  private final RequestData request;

  private final long timestamp;

  private final List<String> intercepts;

  BaseParameters(
      String browsingContextId,
      boolean isBlocked,
      String navigation,
      long redirectCount,
      RequestData request,
      long timestamp,
      List<String> intercepts) {
    this.browsingContextId = browsingContextId;
    this.isBlocked = isBlocked;
    this.navigationId = navigation;
    this.redirectCount = redirectCount;
    this.request = request;
    this.timestamp = timestamp;
    this.intercepts = intercepts;
  }

  public static BaseParameters fromJson(JsonInput input) {
    String browsingContextId = null;

    boolean isBlocked = false;

    String navigationId = null;

    long redirectCount = 0;

    RequestData request = null;

    long timestamp = 0;

    List<String> intercepts = new ArrayList<>();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "context":
          browsingContextId = input.read(String.class);
          break;
        case "isBlocked":
          isBlocked = input.read(Boolean.class);
          break;
        case "navigation":
          navigationId = input.read(String.class);
          break;
        case "redirectCount":
          redirectCount = input.read(Long.class);
          break;
        case "request":
          request = input.read(RequestData.class);
          break;
        case "timestamp":
          timestamp = input.read(Long.class);
          break;
        case "intercepts":
          intercepts = input.read(new TypeToken<List<String>>() {}.getType());
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new BaseParameters(
        browsingContextId, isBlocked, navigationId, redirectCount, request, timestamp, intercepts);
  }

  public String getBrowsingContextId() {
    return browsingContextId;
  }

  public boolean isBlocked() {
    return isBlocked;
  }

  public String getNavigationId() {
    return navigationId;
  }

  public long getRedirectCount() {
    return redirectCount;
  }

  public RequestData getRequest() {
    return request;
  }

  public long getTimestamp() {
    return timestamp;
  }

  public List<String> getIntercepts() {
    return intercepts;
  }
}
