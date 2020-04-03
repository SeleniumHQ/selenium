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

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.remote.server.Session;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class AddCookie extends WebDriverHandler<Void> {

  private volatile Map<String, Object> rawCookie;

  public AddCookie(Session session) {
    super(session);
  }

  @Override
  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    rawCookie = new HashMap<>((Map<String, Object>) allParameters.get("cookie"));
  }

  @Override
  public Void call() {
    Cookie cookie = createCookie();

    getDriver().manage().addCookie(cookie);

    return null;
  }

  protected Cookie createCookie() {
    if (rawCookie == null) {
      return null;
    }

    String name = (String) rawCookie.get("name");
    String value = (String) rawCookie.get("value");
    String path = (String) rawCookie.get("path");
    String domain = (String) rawCookie.get("domain");
    boolean secure = getBooleanFromRaw("secure");
    boolean httpOnly = getBooleanFromRaw("httpOnly");

    Number expiryNum = (Number) rawCookie.get("expiry");
    Date expiry = expiryNum == null ? null : new Date(
        TimeUnit.SECONDS.toMillis(expiryNum.longValue()));

    return new Cookie.Builder(name, value)
        .path(path)
        .domain(domain)
        .isSecure(secure)
        .expiresOn(expiry)
        .isHttpOnly(httpOnly)
        .build();
  }

  private boolean getBooleanFromRaw(String key) {
    if (rawCookie.containsKey(key)) {
      Object value = rawCookie.get(key);
      if (value instanceof Boolean) {
        return (Boolean) value;
      }
      if (value instanceof String) {
        return ((String) value).equalsIgnoreCase("true");
      }
    }
    return false;
  }

  @Override
  public String toString() {
    return "[add cookie: " + createCookie() + "]";
  }
}
