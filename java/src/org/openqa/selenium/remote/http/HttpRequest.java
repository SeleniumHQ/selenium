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

package org.openqa.selenium.remote.http;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.stream.Collectors.joining;

import java.net.URI;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

public class HttpRequest extends HttpMessage<HttpRequest> {

  private final HttpMethod method;
  private final String uri;
  private final Map<String, List<String>> queryParameters = new LinkedHashMap<>();

  public HttpRequest(HttpMethod method, String uri) {
    this.method = method;
    this.uri = uri;
  }

  public HttpRequest(HttpMethod method, URI uri) {
    this(method, uri.toString());
  }

  public String getUri() {
    return uri;
  }

  public HttpMethod getMethod() {
    return method;
  }

  /**
   * Get a query parameter. The implementation will take care of decoding from the percent encoding.
   */
  @Nullable
  public String getQueryParameter(String name) {
    Iterable<String> allParams = getQueryParameters(name);
    if (allParams == null) {
      return null;
    }
    Iterator<String> iterator = allParams.iterator();
    return iterator.hasNext() ? iterator.next() : null;
  }

  /**
   * Set a query parameter, adding to existing values if present. The implementation will ensure
   * that the name and value are properly encoded.
   */
  public HttpRequest addQueryParameter(String name, String value) {
    queryParameters
        .computeIfAbsent(Require.nonNull("Name", name), (n) -> new ArrayList<>())
        .add(Require.nonNull("Value", value));
    return this;
  }

  public void forEachQueryParameter(BiConsumer<String, String> action) {
    for (Map.Entry<String, List<String>> parameter : queryParameters.entrySet()) {
      for (String value : parameter.getValue()) {
        action.accept(parameter.getKey(), value);
      }
    }
  }

  public String getQueryString() {
    return queryParameters.entrySet().stream()
        .map(param -> toQueryString(param.getKey(), param.getValue()))
        .collect(joining("&"));
  }

  private String toQueryString(String name, List<String> values) {
    return values.stream().map(value -> toQueryString(name, value)).collect(joining("&"));
  }

  private String toQueryString(String name, String value) {
    return String.format("%s=%s", URLEncoder.encode(name, UTF_8), URLEncoder.encode(value, UTF_8));
  }

  public Map<String, Iterable<String>> getQueryParameters() {
    return Collections.unmodifiableMap(queryParameters);
  }

  public Iterable<String> getQueryParameterNames() {
    return queryParameters.keySet();
  }

  @Nullable
  public Iterable<String> getQueryParameters(String name) {
    return queryParameters.get(name);
  }

  @Override
  public String toString() {
    String content = super.toString();
    return content.isEmpty()
        ? String.format("(%s) %s", getMethod(), getUri())
        : String.format("(%s) %s %s", getMethod(), getUri(), content);
  }
}
