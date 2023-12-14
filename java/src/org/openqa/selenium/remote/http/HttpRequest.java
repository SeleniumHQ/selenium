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

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.internal.Require;

public class HttpRequest extends HttpMessage<HttpRequest> {

  private final HttpMethod method;
  private final String uri;
  private final Map<String, List<String>> queryParameters = new LinkedHashMap<>();

  public HttpRequest(HttpMethod method, String uri) {
    this.method = method;
    this.uri = uri;
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

  public Iterable<String> getQueryParameterNames() {
    return queryParameters.keySet();
  }

  public Iterable<String> getQueryParameters(String name) {
    return queryParameters.get(name);
  }

  public String toString() {
    return "(" + getMethod() + ") " + getUri();
  }
}
