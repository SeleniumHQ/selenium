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

public class RequestData {
  private final String requestId;

  private final String url;

  private final String method;

  private final List<Header> headers;

  private final List<Cookie> cookies;

  private final long headersSize;

  private final FetchTimingInfo timings;

  public RequestData(
      String requestId,
      String url,
      String method,
      List<Header> headers,
      List<Cookie> cookies,
      long headersSize,
      FetchTimingInfo timings) {
    this.requestId = requestId;
    this.url = url;
    this.method = method;
    this.headers = headers;
    this.cookies = cookies;
    this.headersSize = headersSize;
    this.timings = timings;
  }

  public static RequestData fromJson(JsonInput input) {
    String requestId = null;
    String url = null;
    String method = null;
    List<Header> headers = new ArrayList<>();
    List<Cookie> cookies = new ArrayList<>();
    long headersSize = 0;
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
        case "timings":
          timings = input.read(FetchTimingInfo.class);
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new RequestData(requestId, url, method, headers, cookies, headersSize, timings);
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

  public Long getHeadersSize() {
    return headersSize;
  }

  public FetchTimingInfo getTimings() {
    return timings;
  }
}
