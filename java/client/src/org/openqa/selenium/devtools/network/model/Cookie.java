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

package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

import java.util.Date;

/**
 * Cookie object
 */
public class Cookie {

  private String name;

  private String value;

  private String domain;

  private String path;

  private long expires;

  private boolean httpOnly;

  private boolean secure;

  public String getName() {
    return name;
  }

  public String getValue() {
    return value;
  }

  public String getDomain() {
    return domain;
  }

  public String getPath() {
    return path;
  }

  public long getExpires() {
    return expires;
  }

  public boolean isHttpOnly() {
    return httpOnly;
  }

  public boolean isSecure() {
    return secure;
  }

  public Cookie(String name, String value, String domain, String path, long expires,
                Boolean httpOnly, Boolean secure) {
    this.name = requireNonNull(name, "'name' is required for Cookie");
    this.value = requireNonNull(value, "'value' is required for Cookie");
    this.domain = requireNonNull(domain, "'domain' is required for Cookie");
    this.path = requireNonNull(path, "'path' is required for Cookie");
    this.expires = expires;
    this.httpOnly = httpOnly;
    this.secure = secure;
  }

  org.openqa.selenium.Cookie asSeleniumCookie() {
    return new org.openqa.selenium.Cookie.Builder(name, value).domain(domain).path(path)
        .expiresOn(new Date(expires)).isSecure(secure).isHttpOnly(httpOnly).build();
  }

  public static Cookie fromSeleniumCookie(org.openqa.selenium.Cookie cookie) {
    return new Cookie(cookie.getName(), cookie.getValue(), cookie.getDomain(), cookie.getPath(),
                      cookie.getExpiry() != null ? cookie.getExpiry().getTime() : 0,
                      cookie.isHttpOnly(), cookie.isSecure());
  }

  private static Cookie fromJson(JsonInput input) {

    String name = null;

    String value = null;

    String domain = null;

    String path = null;

    long expires = 0;

    boolean httpOnly = false;

    boolean secure = false;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "name":
          name = input.nextString();
          break;
        case "value":
          value = input.nextString();
          break;
        case "domain":
          domain = input.nextString();
          break;

        case "path":
          path = input.nextString();
          break;

        case "expires":
          expires = input.nextNumber().longValue();
          break;
        case "httpOnly":
          httpOnly = input.nextBoolean();
          break;
        case "secure":
          secure = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new Cookie(name, value, domain, path, expires, httpOnly, secure);
  }
}
