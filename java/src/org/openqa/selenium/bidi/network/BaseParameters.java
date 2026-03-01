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
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

/**
 * @see <a href="https://www.w3.org/TR/webdriver-bidi/#type-network-BaseParameters">BiDi spec</a>
 */
public class BaseParameters {

  @Nullable private final String browsingContextId;

  private final boolean isBlocked;

  @Nullable private final String navigationId;

  private final long redirectCount;

  private final RequestData request;

  private final long timestamp;

  private final List<String> intercepts;

  BaseParameters(
      @Nullable String browsingContextId,
      boolean isBlocked,
      @Nullable String navigation,
      long redirectCount,
      RequestData request,
      long timestamp,
      List<String> intercepts) {
    this.browsingContextId = browsingContextId;
    this.isBlocked = isBlocked;
    this.navigationId = navigation;
    this.redirectCount = Require.nonNegative("Redirect count", redirectCount);
    this.request = request;
    this.timestamp = Require.nonNegative("Timestamp", timestamp);
    this.intercepts = intercepts;
  }

  public static BaseParameters fromJson(JsonInput input) {
    String browsingContextId = null;
    Boolean isBlocked = null;
    String navigationId = null;
    Long redirectCount = null;
    RequestData request = null;
    Long timestamp = null;
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
        browsingContextId,
        Require.nonNull("isBlocked", isBlocked),
        navigationId,
        Require.nonNull("Redirect count", redirectCount),
        Require.nonNull("request", request),
        Require.nonNull("timestamp", timestamp),
        Require.nonNull("intercepts", intercepts));
  }

  @Nullable
  public String getBrowsingContextId() {
    return browsingContextId;
  }

  public boolean isBlocked() {
    return isBlocked;
  }

  @Nullable
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
