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

import static org.assertj.core.api.Assertions.assertThat;

import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class BrowserTest {
  @ParameterizedTest
  @MethodSource("webBrowsers")
  void browsersHaveReadableStringRepresentation(Browser browser, String toString) {
    assertThat(browser).hasToString(toString);
  }

  @ParameterizedTest
  @MethodSource("webBrowsers")
  void is(Browser browser, String name) {
    assertThat(browser.browserName()).isEqualTo(name);
    assertThat(browser.is(name)).isTrue();
    assertThat(browser.is("Netscape Navigator")).isFalse();
  }

  private static Stream<Arguments> webBrowsers() {
    return Stream.of(
        Arguments.of(Browser.CHROME, "chrome"),
        Arguments.of(Browser.EDGE, "MicrosoftEdge"),
        Arguments.of(Browser.HTMLUNIT, "htmlunit"),
        Arguments.of(Browser.IE, "internet explorer"),
        Arguments.of(Browser.FIREFOX, "firefox"),
        Arguments.of(Browser.OPERA, "opera"),
        Arguments.of(Browser.SAFARI, "safari"),
        Arguments.of(Browser.SAFARI_TECH_PREVIEW, "Safari Technology Preview"));
  }

  @ParameterizedTest
  @MethodSource("alternativeBrowserNames")
  void alternativeName(Browser browser, String alternativeName) {
    assertThat(browser.is(alternativeName)).isTrue();
  }

  public static Stream<Arguments> alternativeBrowserNames() {
    return Stream.of(
        Arguments.of(Browser.CHROME, "chrome-headless-shell"),
        Arguments.of(Browser.EDGE, "msedge"),
        Arguments.of(Browser.SAFARI, "Safari"));
  }
}
