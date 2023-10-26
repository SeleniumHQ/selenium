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
import java.util.Map;
import java.util.Optional;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class ResponseData {
  private final String url;

  private final String protocol;
  private final long status;
  private final String statusText;
  private final boolean fromCache;
  private final List<Header> headers;
  private final String mimeType;
  private final long bytesReceived;
  private final long headersSize;
  private final long bodySize;
  private final Optional<Long> content;
  private final Optional<AuthChallenge> authChallenge;

  private ResponseData(
      String url,
      String protocol,
      long status,
      String statusText,
      boolean fromCache,
      List<Header> headers,
      String mimeType,
      long bytesReceived,
      long headersSize,
      long bodySize,
      Optional<Long> content,
      Optional<AuthChallenge> authChallenge) {
    this.url = url;
    this.protocol = protocol;
    this.status = status;
    this.statusText = statusText;
    this.fromCache = fromCache;
    this.headers = headers;
    this.mimeType = mimeType;
    this.bytesReceived = bytesReceived;
    this.headersSize = headersSize;
    this.bodySize = bodySize;
    this.content = content;
    this.authChallenge = authChallenge;
  }

  public static ResponseData fromJson(JsonInput input) {
    String url = null;
    String protocol = null;
    long status = 0;
    String statusText = null;
    boolean fromCache = false;
    List<Header> headers = new ArrayList<>();
    String mimeType = null;
    long bytesReceived = 0;
    long headersSize = 0;
    long bodySize = 0;
    Optional<Long> content = Optional.empty();
    Optional<AuthChallenge> authChallenge = Optional.empty();
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "url":
          url = input.read(String.class);
          break;
        case "protocol":
          protocol = input.read(String.class);
          break;
        case "status":
          status = input.read(Long.class);
          break;
        case "statusText":
          statusText = input.read(String.class);
          break;
        case "fromCache":
          fromCache = input.read(Boolean.class);
          break;
        case "headers":
          headers = input.read(new TypeToken<List<Header>>() {}.getType());
          break;
        case "mimeType":
          mimeType = input.read(String.class);
          break;
        case "bytesReceived":
          bytesReceived = input.read(Long.class);
          break;
        case "headersSize":
          headersSize = input.read(Long.class);
          break;
        case "bodySize":
          bodySize = input.read(Long.class);
          break;
        case "content":
          Map<String, Long> responseContent =
              input.read(new TypeToken<Map<String, Long>>() {}.getType());
          content = Optional.ofNullable(responseContent.get("size"));
          break;
        case "authChallenge":
          authChallenge = Optional.of(input.read(AuthChallenge.class));
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new ResponseData(
        url,
        protocol,
        status,
        statusText,
        fromCache,
        headers,
        mimeType,
        bytesReceived,
        headersSize,
        bodySize,
        content,
        authChallenge);
  }

  public String getUrl() {
    return url;
  }

  public String getProtocol() {
    return protocol;
  }

  public long getStatus() {
    return status;
  }

  public String getStatusText() {
    return statusText;
  }

  public boolean isFromCache() {
    return fromCache;
  }

  public List<Header> getHeaders() {
    return headers;
  }

  public String getMimeType() {
    return mimeType;
  }

  public long getBytesReceived() {
    return bytesReceived;
  }

  public long getHeadersSize() {
    return headersSize;
  }

  public long getBodySize() {
    return bodySize;
  }

  public Optional<Long> getContent() {
    return content;
  }

  public Optional<AuthChallenge> getAuthChallenge() {
    return authChallenge;
  }
}
