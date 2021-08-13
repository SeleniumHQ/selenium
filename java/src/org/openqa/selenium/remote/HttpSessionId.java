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

package org.openqa.selenium.remote;


import java.util.Optional;

public class HttpSessionId {

  private HttpSessionId() {
    // Utility class
  }

  /**
   * Scan {@code uri} for a session ID. This is identified by scanning for "{code /session/}" and
   * then extracting the next fragment of the URL. This means that both "{@code /session/foo}" and
   * "{@code /wd/hub/session/foo/bar}" would both identify the session id as being "foo".
   */
  public static Optional<String> getSessionId(String uri) {
    int sessionIndex = uri.indexOf("/session/");
    if (sessionIndex != -1) {
      sessionIndex += "/session/".length();
      int nextSlash = uri.indexOf("/", sessionIndex);
      if (nextSlash != -1) {
        return Optional.of(uri.substring(sessionIndex, nextSlash));
      }
      return Optional.of(uri.substring(sessionIndex));
    }
    return Optional.empty();
  }
}
