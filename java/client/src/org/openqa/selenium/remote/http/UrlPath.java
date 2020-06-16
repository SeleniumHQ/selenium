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

import org.openqa.selenium.internal.Require;

import java.util.List;
import java.util.stream.Collectors;

public class UrlPath {

  static final String ROUTE_PREFIX_KEY = "selenium.route";

  private UrlPath() {
    // Utility class
  }

  public static String relativeToServer(HttpRequest req, String location) {
    return Require.nonNull("Location", location);
  }

  public static String relativeToContext(HttpRequest req, String location) {
    Require.nonNull("Location", location);

    Object rawPrefix = req.getAttribute(ROUTE_PREFIX_KEY);
    String prefix;
    if (rawPrefix instanceof List) {
      prefix = ((List<?>) rawPrefix).stream().map(String::valueOf).collect(Collectors.joining());
    } else {
      prefix = "";
    }

    return prefix + location;
  }
}
