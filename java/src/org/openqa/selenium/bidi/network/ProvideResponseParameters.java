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

public class ProvideResponseParameters {
  private final Map<String, Object> map = new HashMap<>();

  public ProvideResponseParameters(String request) {
    map.put("request", request);
  }

  public ProvideResponseParameters body(BytesValue value) {
    map.put("body", value.toMap());
    return this;
  }

  public ProvideResponseParameters cookies(List<SetCookieHeader> cookieHeaders) {
    List<Map<String, Object>> cookies =
        cookieHeaders.stream().map(SetCookieHeader::toMap).collect(Collectors.toList());
    map.put("cookies", cookies);
    return this;
  }

  public ProvideResponseParameters headers(List<Header> headers) {
    List<Map<String, Object>> headerList =
        headers.stream().map(Header::toMap).collect(Collectors.toList());
    map.put("headers", headerList);
    return this;
  }

  public ProvideResponseParameters reasonPhrase(String reasonPhrase) {
    map.put("reasonPhrase", reasonPhrase);
    return this;
  }

  public ProvideResponseParameters statusCode(int statusCode) {
    map.put("statusCode", statusCode);
    return this;
  }

  public Map<String, Object> toMap() {
    return map;
  }
}
