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

import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Cookies {

  private Set<Cookie> cookies;

  private Cookies(Set<Cookie> cookies) {
    this.cookies = cookies;
  }

  private static Cookies fromJson(JsonInput input) {

    Set<Cookie> cookiesList = new HashSet<>();

    input.beginArray();

    while (input.hasNext()) {
      cookiesList.add(input.read(Cookie.class));
    }

    input.endArray();

    return new Cookies(cookiesList);
  }

  public List<org.openqa.selenium.Cookie> asSeleniumCookies() {
    List<org.openqa.selenium.Cookie> seleniumCookies = new ArrayList<>();
    for (Cookie cookie : cookies) {
      seleniumCookies.add(cookie.asSeleniumCookie());
    }
    return seleniumCookies;
  }

}
