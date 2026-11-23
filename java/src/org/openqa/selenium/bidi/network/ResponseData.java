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
import java.util.Optional;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

/**
 * @see <a href="https://www.w3.org/TR/webdriver-bidi/#type-network-ResponseData">BiDi spec</a>
 */
@Beta
public class ResponseData {
  private final String url;

  private final String protocol;
  private final int status;
  private final String statusText;
  private final boolean fromCache;
  private final List<Header> headers;
  private final String mimeType;
  private final long bytesReceived;
  private final @Nullable Long headersSize;
  private final @Nullable Long bodySize;
  private final @Nullable Long contentSize;
  private final @Nullable AuthChallenge authChallenge;

  private ResponseData(
      String url,
      String protocol,
      int status,
      String statusText,
      boolean fromCache,
      List<Header> headers,
      String mimeType,
      long bytesReceived,
      @Nullable Long headersSize,
      @Nullable Long bodySize,
      @Nullable Long contentSize,
      @Nullable AuthChallenge authChallenge) {
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
    this.contentSize = contentSize;
    this.authChallenge = authChallenge;
  }

  public static ResponseData fromJson(JsonInput input) {
    String url = null;
    String protocol = null;
    Integer status = null;
    String statusText = null;
    Boolean fromCache = null;
    List<Header> headers = new ArrayList<>();
    String mimeType = null;
    Long bytesReceived = null;
    Long headersSize = null;
    Long bodySize = null;
    Long contentSize = null;
    AuthChallenge authChallenge = null;
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
          status = input.read(Integer.class);
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
          contentSize = input.readMapElement("size");
          break;
        case "authChallenge":
          authChallenge = input.read(AuthChallenge.class);
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new ResponseData(
        Require.nonNull("url", url),
        Require.nonNull("protocol", protocol),
        Require.nonNull("status", status),
        Require.nonNull("statusText", statusText),
        Require.nonNull("fromCache", fromCache),
        Require.nonNull("headers", headers),
        Require.nonNull("mimeType", mimeType),
        Require.nonNull("bytesReceived", bytesReceived),
        headersSize,
        bodySize,
        contentSize,
        authChallenge);
  }

  public String getUrl() {
    return url;
  }

  public String getProtocol() {
    return protocol;
  }

  public int getStatus() {
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

  @Nullable
  public Long getHeadersSize() {
    return headersSize;
  }

  @Nullable
  public Long getBodySize() {
    return bodySize;
  }

  @SuppressWarnings("NullableProblems")
  public Optional<Long> getContent() {
    return Optional.ofNullable(contentSize);
  }

  @SuppressWarnings("NullableProblems")
  public Optional<AuthChallenge> getAuthChallenge() {
    return Optional.ofNullable(authChallenge);
  }
}
