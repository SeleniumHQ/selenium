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

import static java.nio.charset.StandardCharsets.UTF_8;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpRequest.BodyPublisher;
import java.net.http.HttpRequest.BodyPublishers;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.openqa.selenium.remote.http.AddSeleniumUserAgent;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class JdkHttpMessages {

  private final ClientConfig config;
  private static final List<String> IGNORE_HEADERS =
      List.of("content-length", "connection", "host");

  public JdkHttpMessages(ClientConfig config) {
    this.config = Objects.requireNonNull(config, "Client config");
  }

  public java.net.http.HttpRequest createRequest(HttpRequest req, HttpMethod method, URI rawUri) {
    String rawUrl = rawUri.toString();

    // Add query string if necessary
    String queryString =
        StreamSupport.stream(req.getQueryParameterNames().spliterator(), false)
            .map(
                name -> {
                  return StreamSupport.stream(req.getQueryParameters(name).spliterator(), false)
                      .map(
                          value ->
                              String.format(
                                  "%s=%s",
                                  URLEncoder.encode(name, UTF_8), URLEncoder.encode(value, UTF_8)))
                      .collect(Collectors.joining("&"));
                })
            .collect(Collectors.joining("&"));

    if (!queryString.isEmpty()) {
      rawUrl = rawUrl + "?" + queryString;
    }

    java.net.http.HttpRequest.Builder builder =
        java.net.http.HttpRequest.newBuilder().uri(URI.create(rawUrl));

    switch (method) {
      case DELETE:
        builder.DELETE();
        break;

      case GET:
        builder.GET();
        break;

      case POST:
        builder.POST(notChunkingBodyPublisher(req));
        break;

      case PUT:
        builder.PUT(notChunkingBodyPublisher(req));
        break;

      default:
        throw new IllegalArgumentException(
            String.format("Unsupported request method %s: %s", req.getMethod(), req));
    }

    req.forEachHeader(
        (name, value) -> {
          // This prevents the IllegalArgumentException that states 'restricted header name: ...'
          if (IGNORE_HEADERS.contains(name.toLowerCase())) {
            return;
          }
          builder.header(name, value);
        });

    if (req.getHeader("User-Agent") == null) {
      builder.header("User-Agent", AddSeleniumUserAgent.USER_AGENT);
    }

    builder.timeout(config.readTimeout());

    return builder.build();
  }

  /**
   * Some drivers do not support chunked transport, we ensure the http client is not using chunked
   * transport. This is done by using a BodyPublisher with a known size.
   *
   * @return a BodyPublisher with a known size
   */
  private BodyPublisher notChunkingBodyPublisher(HttpRequest req) {
    Contents.Supplier content = req.getContent();

    // Check if the content length is greater than 0
    if (content.length() > 0) {
      // we know the length of the request and use it
      BodyPublisher chunking = BodyPublishers.ofInputStream(content);
      return BodyPublishers.fromPublisher(chunking, content.length());
    } else {
      // If the content length is 0, return a BodyPublisher without body
      return BodyPublishers.noBody();
    }
  }

  public URI getRawUri(HttpRequest req) {
    URI baseUrl = config.baseUri();
    String uri = req.getUri();
    String rawUrl;

    if (uri.startsWith("ws://")
        || uri.startsWith("wss://")
        || uri.startsWith("http://")
        || uri.startsWith("https://")) {
      rawUrl = uri;
    } else {
      String base = baseUrl.toString();
      if (base.endsWith("/")) {
        rawUrl = base.substring(0, base.length() - 1) + uri;
      } else {
        rawUrl = base + uri;
      }
    }

    return URI.create(rawUrl);
  }

  public HttpResponse createResponse(java.net.http.HttpResponse<byte[]> response) {
    HttpResponse res = new HttpResponse();
    res.setStatus(response.statusCode());
    response
        .headers()
        .map()
        .forEach(
            (name, values) ->
                values.stream()
                    .filter(Objects::nonNull)
                    .forEach(value -> res.addHeader(name, value)));
    byte[] responseBody = response.body();
    if (responseBody != null) {
      res.setContent(Contents.bytes(responseBody));
    }

    return res;
  }
}
