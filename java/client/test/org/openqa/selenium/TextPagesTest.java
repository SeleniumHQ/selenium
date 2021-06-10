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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

public class TextPagesTest extends JUnit4TestBase {

  private String textPage;

  @Before
  public void setUp() {
    textPage = GlobalTestEnvironment.get().getAppServer().whereIs("plain.txt");
  }

  @Test
  public void testShouldBeAbleToLoadASimplePageOfText() {
    driver.get(textPage);
    String source = driver.getPageSource();
    assertThat(source).contains("Test");
  }

  @Test
  @Ignore(value = IE, reason = "creates DOM for displaying text pages")
  @Ignore(value = SAFARI, reason = "creates DOM for displaying text pages")
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(FIREFOX)
  public void testShouldThrowExceptionWhenAddingCookieToAPageThatIsNotHtml() {
    driver.get(textPage);

    Cookie cookie = new Cookie.Builder("hello", "goodbye").build();
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> driver.manage().addCookie(cookie));
  }
}
