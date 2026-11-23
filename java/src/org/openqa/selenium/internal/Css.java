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

package org.openqa.selenium.internal;

import java.util.regex.Pattern;

public final class Css {

  private static final Pattern SPECIAL_CHARACTERS =
      Pattern.compile("([\\s'\"\\\\#.:;,!?+<>=~*^$|%&@`{}\\-/\\[\\]()])");

  private Css() {
    // Utility class
  }

  /**
   * Escapes a value so it can be used as a CSS identifier, for example after {@code #} or {@code
   * .}. The result is also safe inside a single-quoted attribute value such as {@code
   * [name='...']}.
   */
  public static String escape(String value) {
    String escaped = SPECIAL_CHARACTERS.matcher(value).replaceAll("\\\\$1");
    // CSS drops a backslash followed by a newline, so newlines need hex escapes instead.
    escaped = escaped.replace("\\\n", "\\a ").replace("\\\r", "\\d ").replace("\\\f", "\\c ");
    // CSS only requires the leading-digit escape for ASCII 0-9; non-ASCII Unicode digits
    // (e.g. Arabic-Indic, fullwidth) are already valid identifier-start code points and must
    // be left untouched, or they collide with the escape for a different ASCII digit.
    char first = escaped.isEmpty() ? '\0' : escaped.charAt(0);
    if (first >= '0' && first <= '9') {
      escaped =
          "\\" + (30 + Integer.parseInt(escaped.substring(0, 1))) + " " + escaped.substring(1);
    }
    return escaped;
  }
}
