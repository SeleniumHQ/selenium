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
import org.openqa.selenium.UsernameAndPassword;

public class ContinueResponseParameters {
  private final Map<String, Object> map = new HashMap<>();

  public ContinueResponseParameters(String request) {
    map.put("request", request);
  }

  public ContinueResponseParameters cookies(List<SetCookieHeader> cookieHeaders) {
    List<Map<String, Object>> cookies =
        cookieHeaders.stream().map(SetCookieHeader::toMap).collect(Collectors.toList());
    map.put("cookies", cookies);
    return this;
  }

  public ContinueResponseParameters credentials(UsernameAndPassword credentials) {
    map.put(
        "credentials",
        Map.of(
            "type",
            "password",
            "username",
            credentials.username(),
            "password",
            credentials.password()));
    return this;
  }

  public ContinueResponseParameters headers(List<Header> headers) {
    List<Map<String, Object>> headerList =
        headers.stream().map(Header::toMap).collect(Collectors.toList());
    map.put("headers", headerList);
    return this;
  }

  public ContinueResponseParameters reasonPhrase(String reasonPhrase) {
    map.put("reasonPhrase", reasonPhrase);
    return this;
  }

  public ContinueResponseParameters statusCode(int statusCode) {
    map.put("statusCode", statusCode);
    return this;
  }

  public Map<String, Object> toMap() {
    return map;
  }
}
