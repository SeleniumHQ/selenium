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
import java.util.Map;

public class SetCookieHeader {

  private final Map<String, Object> map = new HashMap<>();

  public SetCookieHeader(String name, BytesValue value) {
    map.put("name", name);
    map.put("value", value);
  }

  public SetCookieHeader domain(String domain) {
    map.put("domain", domain);
    return this;
  }

  public SetCookieHeader path(String path) {
    map.put("path", path);
    return this;
  }

  public SetCookieHeader maxAge(long maxAge) {
    map.put("maxAge", maxAge);
    return this;
  }

  public SetCookieHeader httpOnly(boolean httpOnly) {
    map.put("httpOnly", httpOnly);
    return this;
  }

  public SetCookieHeader secure(boolean secure) {
    map.put("secure", secure);
    return this;
  }

  public SetCookieHeader sameSite(Cookie.SameSite sameSite) {
    map.put("sameSite", sameSite.toString());
    return this;
  }

  public SetCookieHeader expiry(long expiry) {
    map.put("expiry", expiry);
    return this;
  }

  public Map<String, Object> toMap() {
    return map;
  }
}
