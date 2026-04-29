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
 * @see <a href="https://www.w3.org/TR/webdriver-bidi/#type-network-RequestData">BiDi spec</a>
 */
public class RequestData {
  private final String requestId;
  private final String url;
  private final String method;
  private final List<Header> headers;
  private final List<Cookie> cookies;
  private final long headersSize;
  private final @Nullable Long bodySize;
  private final String destination;
  private final @Nullable String initiatorType;
  private final FetchTimingInfo timings;

  public RequestData(
      String requestId,
      String url,
      String method,
      List<Header> headers,
      List<Cookie> cookies,
      long headersSize,
      @Nullable Long bodySize,
      String destination,
      @Nullable String initiatorType,
      FetchTimingInfo timings) {
    this.requestId = requestId;
    this.url = url;
    this.method = method;
    this.headers = headers;
    this.cookies = cookies;
    this.headersSize = Require.nonNegative("headersSize", headersSize);
    this.bodySize = bodySize;
    this.destination = destination;
    this.initiatorType = initiatorType;
    this.timings = timings;
  }

  public static RequestData fromJson(JsonInput input) {
    String requestId = null;
    String url = null;
    String method = null;
    List<Header> headers = new ArrayList<>();
    List<Cookie> cookies = new ArrayList<>();
    Long headersSize = null;
    Long bodySize = null;
    String destination = null;
    String initiatorType = null;
    FetchTimingInfo timings = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "request":
          requestId = input.read(String.class);
          break;
        case "url":
          url = input.read(String.class);
          break;
        case "method":
          method = input.read(String.class);
          break;
        case "headers":
          headers = input.read(new TypeToken<List<Header>>() {}.getType());
          break;
        case "cookies":
          cookies = input.read(new TypeToken<List<Cookie>>() {}.getType());
          break;
        case "headersSize":
          headersSize = input.read(Long.class);
          break;
        case "bodySize":
          bodySize = input.read(Long.class);
          break;
        case "destination":
          destination = input.read(String.class);
          break;
        case "initiatorType":
          initiatorType = input.read(String.class);
          break;
        case "timings":
          timings = input.read(FetchTimingInfo.class);
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new RequestData(
        Require.nonNull("requestId", requestId),
        Require.nonNull("url", url),
        Require.nonNull("method", method),
        Require.nonNull("headers", headers),
        Require.nonNull("cookies", cookies),
        Require.nonNull("headersSize", headersSize),
        bodySize,
        Require.nonNull("destination", destination),
        initiatorType,
        Require.nonNull("timings", timings));
  }

  public String getRequestId() {
    return requestId;
  }

  public String getUrl() {
    return url;
  }

  public String getMethod() {
    return method;
  }

  public List<Header> getHeaders() {
    return headers;
  }

  public List<Cookie> getCookies() {
    return cookies;
  }

  public long getHeadersSize() {
    return headersSize;
  }

  @Nullable
  public Long getBodySize() {
    return bodySize;
  }

  public String getDestination() {
    return destination;
  }

  @Nullable
  public String getInitiatorType() {
    return initiatorType;
  }

  public FetchTimingInfo getTimings() {
    return timings;
  }
}
