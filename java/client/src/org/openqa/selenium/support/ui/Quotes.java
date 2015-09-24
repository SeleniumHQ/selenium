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

package org.openqa.selenium.support.ui;

public class Quotes {

  /**
   * Convert strings with both quotes and ticks into a valid xpath component
   *
   * For example,
   *
   * <p>
   *   {@code foo} will be converted to {@code "foo"},
   * </p>
   * <p>
   *   {@code f"oo} will be converted to {@code 'f"oo'},
   * </p>
   * <p>
   *   {@code foo'"bar} will be converted to {@code concat("foo'", '"', "bar")}
   * </p>
   *
   * @param toEscape a text to escape quotes in, e.g. {@code "f'oo"}
   * @return the same text with escaped quoted, e.g. {@code "\"f'oo\""}
   */
  @SuppressWarnings("JavaDoc")
  public static String escape(String toEscape) {
    if (toEscape.contains("\"") && toEscape.contains("'")) {
      boolean quoteIsLast = false;
      if (toEscape.lastIndexOf("\"") == toEscape.length() - 1) {
        quoteIsLast = true;
      }
      String[] substringsWithoutQuotes = toEscape.split("\"");

      StringBuilder quoted = new StringBuilder("concat(");
      for (int i = 0; i < substringsWithoutQuotes.length; i++) {
        quoted.append("\"").append(substringsWithoutQuotes[i]).append("\"");
        quoted
            .append(((i == substringsWithoutQuotes.length - 1) ? (quoteIsLast ? ", '\"')" : ")")
                                                           : ", '\"', "));
      }
      return quoted.toString();
    }

    // Escape string with just a quote into being single quoted: f"oo -> 'f"oo'
    if (toEscape.contains("\"")) {
      return String.format("'%s'", toEscape);
    }

    // Otherwise return the quoted string
    return String.format("\"%s\"", toEscape);
  }
}
