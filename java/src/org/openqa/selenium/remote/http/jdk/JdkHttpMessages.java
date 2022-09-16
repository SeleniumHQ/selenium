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

package org.openqa.selenium.remote.http.jdk;

import org.openqa.selenium.remote.http.AddSeleniumUserAgent;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpRequest.BodyPublishers;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static java.nio.charset.StandardCharsets.UTF_8;

class JdkHttpMessages {

  private final ClientConfig config;

  public JdkHttpMessages(ClientConfig config) {
    this.config = Objects.requireNonNull(config, "Client config");
  }

  public java.net.http.HttpRequest createRequest(HttpRequest req) {
    String rawUrl = getRawUrl(config.baseUri(), req.getUri());

    // Add query string if necessary
    String queryString = StreamSupport.stream(req.getQueryParameterNames().spliterator(), false)
      .map(name -> {
        return StreamSupport.stream(req.getQueryParameters(name).spliterator(), false)
          .map(value -> String.format("%s=%s", URLEncoder.encode(name, UTF_8), URLEncoder.encode(value, UTF_8)))
          .collect(Collectors.joining("&"));
      })
      .collect(Collectors.joining("&"));

    if (!queryString.isEmpty()) {
      rawUrl = rawUrl + "?" + queryString;
    }

    java.net.http.HttpRequest.Builder builder = java.net.http.HttpRequest.newBuilder().uri(URI.create(rawUrl));

    switch (req.getMethod()) {
      case DELETE:
        builder = builder.DELETE();
        break;

      case GET:
        builder = builder.GET();
        break;

      case POST:
        // Copy the content into a byte array to avoid reading the content inputstream multiple times.
        builder = builder.POST(BodyPublishers.ofByteArray(Contents.bytes(req.getContent())));
        break;

      case PUT:
        builder = builder.PUT(BodyPublishers.ofByteArray(Contents.bytes(req.getContent())));
        break;

      default:
        throw new IllegalArgumentException(String.format("Unsupported request method %s: %s", req.getMethod(), req));
    }

    for (String name : req.getHeaderNames()) {
      // Avoid explicitly setting content-length
      // This prevents the IllegalArgumentException that states 'restricted header name: "Content-Length"'
      if (name.equalsIgnoreCase("content-length")) {
        continue;
      }
      for (String value : req.getHeaders(name)) {
        builder = builder.header(name, value);
      }
    }

    if (req.getHeader("User-Agent") == null) {
      builder = builder.header("User-Agent", AddSeleniumUserAgent.USER_AGENT);
    }

    builder.timeout(config.readTimeout());

    return builder.build();
  }

  private String getRawUrl(URI baseUrl, String uri) {
    String rawUrl;
    if (uri.startsWith("ws://") || uri.startsWith("wss://") ||
      uri.startsWith("http://") || uri.startsWith("https://")) {
      rawUrl = uri;
    } else {
      rawUrl = baseUrl.toString().replaceAll("/$", "") + uri;
    }

    return rawUrl;
  }

  public URI getRawUri(HttpRequest req) {
    String rawUrl = getRawUrl(config.baseUri(), req.getUri());
    return URI.create(rawUrl);
  }

  public HttpResponse createResponse(java.net.http.HttpResponse<byte[]> response) {
    HttpResponse res = new HttpResponse();
    res.setStatus(response.statusCode());
    response.headers().map()
      .forEach((name, values) -> values.stream().filter(Objects::nonNull).forEach(value -> res.addHeader(name, value)));
    res.setContent(() -> new ByteArrayInputStream(response.body()));

    return res;
  }
}
