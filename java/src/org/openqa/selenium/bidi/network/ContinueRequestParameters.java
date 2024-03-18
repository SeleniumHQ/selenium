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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.openqa.selenium.remote.http.HttpMethod;

public class ContinueRequestParameters {
  private final Map<String, Object> map = new HashMap<>();

  public ContinueRequestParameters(String request) {
    map.put("request", request);
  }

  public ContinueRequestParameters body(BytesValue value) {
    map.put("body", value.toMap());
    return this;
  }

  public ContinueRequestParameters cookies(List<Header> cookieHeaders) {
    List<Map<String, Object>> cookies =
        cookieHeaders.stream().map(Header::toMap).collect(Collectors.toList());
    map.put("cookies", cookies);
    return this;
  }

  public ContinueRequestParameters headers(List<Header> headers) {
    List<Map<String, Object>> headerList =
        headers.stream().map(Header::toMap).collect(Collectors.toList());
    map.put("headers", headerList);
    return this;
  }

  public ContinueRequestParameters method(HttpMethod method) {
    map.put("method", method.toString());
    return this;
  }

  public ContinueRequestParameters url(String url) {
    map.put("url", url);
    return this;
  }

  public Map<String, Object> toMap() {
    return map;
  }
}
