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

package org.openqa.selenium.atoms;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.junit.Assume.assumeThat;

import com.google.common.io.Resources;

import java.io.IOException;
import java.net.URL;

/**
 * Utility class for loading JavaScript resources.
 */
class JavaScriptLoader {
  private JavaScriptLoader() {}  // Utility class.

  static String loadResource(String resourcePath) throws IOException {
    URL resourceUrl = JavaScriptLoader.class.getResource(resourcePath);
    assumeThat(
        "Resource not found; are you running with `bazel test`? " + resourcePath,
        resourceUrl, notNullValue());
    return Resources.toString(resourceUrl, UTF_8);
  }
}
