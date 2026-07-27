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

package org.openqa.selenium.environment.webserver;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PageTest {

  @Test
  void defaultToStringHasNoDoctypeAndMatchesLegacyShape() {
    String page =
        new Page().withTitle("Legacy").withScripts("var a = 1;").withStyles("body { }").toString();

    // No doctype: default output stays in quirks mode for backward compatibility.
    assertThat(page).doesNotContain("<!DOCTYPE");

    // Legacy shape/ordering contract: <script>/<style> sit after </head> closes, not inside it.
    // containsSubsequence asserts presence AND order together, so a missing "</head>" fails here
    // instead of silently passing the way raw indexOf().isLessThan() would (both return -1).
    assertThat(page).containsSubsequence("</head>", "<script");
    assertThat(page).containsSubsequence("</head>", "<style");

    // Key content is still present, in the expected tag order, without pinning incidental
    // whitespace (e.g. the exact "<body  >" spacing or the blank line for an empty body).
    assertThat(page)
        .contains("<title>Legacy</title>")
        .contains("var a = 1;")
        .contains("body { }")
        .contains("<body")
        .contains("</body>")
        .contains("</html>");
  }

  @Test
  void withDoctypeEmitsStandardsModeShapeWithScriptAndStyleInsideHead() {
    String page =
        new Page()
            .withDoctype()
            .withTitle("Standards")
            .withScripts("var a = 1;")
            .withStyles("body { }")
            .toString();

    assertThat(page).startsWith("<!DOCTYPE html>");
    assertThat(page.indexOf("</style>")).isLessThan(page.indexOf("</head>"));
    assertThat(page.indexOf("</script>")).isLessThan(page.indexOf("</head>"));
  }
}
