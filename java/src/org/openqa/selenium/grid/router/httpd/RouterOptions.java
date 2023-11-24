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

package org.openqa.selenium.grid.router.httpd;

import org.openqa.selenium.grid.config.Config;

public class RouterOptions {

  static final String NETWORK = "network";

  private final Config config;

  public RouterOptions(Config config) {
    this.config = config;
  }

  public String subPath() {
    return config
        .get(NETWORK, "sub-path")
        .map(
            prefix -> {
              prefix = prefix.trim();
              if (!prefix.startsWith("/")) {
                prefix = "/" + prefix; // Prefix with a '/' if absent.
              }
              if (prefix.endsWith("/")) {
                prefix =
                    prefix.substring(0, prefix.length() - 1); // Remove the trailing '/' if present.
              }
              return prefix;
            })
        .orElse("");
  }
}
