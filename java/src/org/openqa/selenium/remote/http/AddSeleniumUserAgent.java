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

import java.util.Locale;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.Platform;

public class AddSeleniumUserAgent implements Filter {

  public static final String USER_AGENT =
      String.format(
          "selenium/%s (java %s)",
          new BuildInfo().getReleaseLabel(),
          (Platform.getCurrent().family() == null
              ? Platform.getCurrent().toString().toLowerCase(Locale.US)
              : Platform.getCurrent().family().toString().toLowerCase(Locale.US)));

  @Override
  public HttpHandler apply(HttpHandler next) {

    return req -> {
      if (req.getHeader("User-Agent") == null) {
        req.addHeader("User-Agent", USER_AGENT);
      }

      return next.execute(req);
    };
  }
}
