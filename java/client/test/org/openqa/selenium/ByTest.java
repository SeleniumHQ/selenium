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
import static org.openqa.selenium.By.ByClassName;
import static org.openqa.selenium.By.ByCssSelector;
import static org.openqa.selenium.By.ById;
import static org.openqa.selenium.By.ByLinkText;
import static org.openqa.selenium.By.ByName;
import static org.openqa.selenium.By.ByPartialLinkText;
import static org.openqa.selenium.By.ByTagName;
import static org.openqa.selenium.By.ByXPath;

import org.junit.Test;

import java.util.List;

public class ByTest {

  @Test
  public void innerClassesArePublicSoThatTheyCanBeReusedElsewhere() {
    assertThat(new ByXPath("a").toString()).isEqualTo("By.xpath: a");
    assertThat(new ById("a").toString()).isEqualTo("By.id: a");
    assertThat(new ByClassName("a").toString()).isEqualTo("By.className: a");
    assertThat(new ByLinkText("a").toString()).isEqualTo("By.linkText: a");
    assertThat(new ByName("a").toString()).isEqualTo("By.name: a");
    assertThat(new ByTagName("a").toString()).isEqualTo("By.tagName: a");
    assertThat(new ByCssSelector("a").toString()).isEqualTo("By.cssSelector: a");
    assertThat(new ByPartialLinkText("a").toString()).isEqualTo("By.partialLinkText: a");
  }

  // See https://github.com/SeleniumHQ/selenium-google-code-issue-archive/issues/2917
  @Test
  public void testHashCodeDoesNotFallIntoEndlessRecursion() {
    By locator = new By() {
      @Override
      public List<WebElement> findElements(SearchContext context) {
        return null;
      }
    };
    locator.hashCode();
  }
}
