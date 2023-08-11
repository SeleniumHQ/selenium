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

package org.openqa.selenium.support.locators;

import com.google.common.io.Resources;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

class RelativeLocatorScript {

  static final String FIND_ELEMENTS;

  static {
    try {
      String location =
          String.format(
              "/%s/%s",
              RelativeLocator.class.getPackage().getName().replace(".", "/"), "findElements.js");

      URL url = RelativeLocator.class.getResource(location);

      String rawFunction = Resources.toString(url, StandardCharsets.UTF_8);
      FIND_ELEMENTS =
          String.format("/* findElements */return (%s).apply(null, arguments);", rawFunction);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private RelativeLocatorScript() {
    // Utility class.
  }
}
