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
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.openqa.selenium.By.ByClassName;
import static org.openqa.selenium.By.ByCssSelector;
import static org.openqa.selenium.By.ById;
import static org.openqa.selenium.By.ByLinkText;
import static org.openqa.selenium.By.ByName;
import static org.openqa.selenium.By.ByPartialLinkText;
import static org.openqa.selenium.By.ByTagName;
import static org.openqa.selenium.By.ByXPath;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class ByTest {

  @Test
  void shouldUseFindsByNameToLocateElementsByName() {
    final SearchContext driver = mock(SearchContext.class);

    By.cssSelector("cheese").findElement(driver);
    By.cssSelector("peas").findElements(driver);

    verify(driver).findElement(By.cssSelector("cheese"));
    verify(driver).findElements(By.cssSelector("peas"));
    verifyNoMoreInteractions(driver);
  }

  @Test
  void shouldUseXpathLocateElementsByXpath() {
    SearchContext driver = mock(SearchContext.class);

    By.xpath(".//*[@name = 'cheese']").findElement(driver);
    By.xpath(".//*[@name = 'peas']").findElements(driver);

    verify(driver).findElement(By.xpath(".//*[@name = 'cheese']"));
    verify(driver).findElements(By.xpath(".//*[@name = 'peas']"));
    verifyNoMoreInteractions(driver);
  }

  @Test
  void searchesByTagNameIfSupported() {
    SearchContext context = mock(SearchContext.class);

    By.tagName("foo").findElement(context);
    By.tagName("bar").findElements(context);

    verify(context).findElement(By.tagName("foo"));
    verify(context).findElements(By.tagName("bar"));
    verifyNoMoreInteractions(context);
  }

  @Test
  void innerClassesArePublicSoThatTheyCanBeReusedElsewhere() {
    assertThat(new ByXPath("a")).hasToString("By.xpath: a");
    assertThat(new ById("a")).hasToString("By.id: a");
    assertThat(new ByClassName("a")).hasToString("By.className: a");
    assertThat(new ByLinkText("a")).hasToString("By.linkText: a");
    assertThat(new ByName("a")).hasToString("By.name: a");
    assertThat(new ByTagName("a")).hasToString("By.tagName: a");
    assertThat(new ByCssSelector("a")).hasToString("By.cssSelector: a");
    assertThat(new ByPartialLinkText("a")).hasToString("By.partialLinkText: a");
  }

  // See https://github.com/SeleniumHQ/selenium-google-code-issue-archive/issues/2917
  @Test
  void testHashCodeDoesNotFallIntoEndlessRecursion() {
    By locator =
        new By() {
          @Override
          public List<WebElement> findElements(SearchContext context) {
            return null;
          }
        };
    assertThatNoException().isThrownBy(locator::hashCode);
  }

  @Test
  void ensureMultipleClassNamesAreNotAccepted() {
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> By.className("one two"));
  }

  @Test
  void ensureIdIsSerializedProperly() {
    // Although it's not legal, make sure we handle the case where people use spaces.
    By by = By.id("one two");

    Json json = new Json();
    Map<String, Object> blob = json.toType(json.toJson(by), MAP_TYPE);

    assertThat(blob)
        .hasSize(2)
        .containsEntry("using", "css selector")
        .containsEntry("value", "#one\\ two");
  }
}
