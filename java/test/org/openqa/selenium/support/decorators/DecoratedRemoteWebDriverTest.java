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

package org.openqa.selenium.support.decorators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsDriver;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.SessionId;

@Tag("UnitTests")
class DecoratedRemoteWebDriverTest {

  @Test
  void shouldImplementWrapsDriverToProvideAccessToUnderlyingDriver() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);
    when(originalDriver.getSessionId()).thenReturn(sessionId);

    RemoteWebDriver decoratedDriver =
        new WebDriverDecorator<>(RemoteWebDriver.class).decorate(originalDriver);

    assertThat(decoratedDriver.getSessionId()).isEqualTo(sessionId);

    RemoteWebDriver underlying =
        (RemoteWebDriver) ((WrapsDriver) decoratedDriver).getWrappedDriver();
    assertThat(underlying.getSessionId()).isEqualTo(sessionId);
  }

  @Test
  void cannotConvertDecoratedToRemoteWebDriver() {
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);

    WebDriver decorated = new WebDriverDecorator<>().decorate(originalDriver);

    assertThat(decorated).isNotInstanceOf(RemoteWebDriver.class);
  }

  @Test
  void decoratedDriversShouldImplementWrapsDriver() {
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);

    WebDriver decorated = new WebDriverDecorator<>().decorate(originalDriver);

    assertThat(decorated).isInstanceOf(WrapsDriver.class);
  }

  @Test
  void decoratedElementsShouldImplementWrapsElement() {
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);
    RemoteWebElement originalElement = new RemoteWebElement();
    String elementId = UUID.randomUUID().toString();
    originalElement.setParent(originalDriver);
    originalElement.setId(elementId);

    when(originalDriver.findElement(any())).thenReturn(originalElement);

    WebDriver decoratedDriver = new WebDriverDecorator<>().decorate(originalDriver);
    WebElement element = decoratedDriver.findElement(By.id("test"));

    assertThat(element).isInstanceOf(WrapsElement.class);
  }

  @Test
  void canConvertDecoratedRemoteWebElementToJson() {
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);
    RemoteWebElement originalElement = new RemoteWebElement();
    String elementId = UUID.randomUUID().toString();
    originalElement.setParent(originalDriver);
    originalElement.setId(elementId);

    when(originalDriver.findElement(any())).thenReturn(originalElement);

    WebDriver decoratedDriver = new WebDriverDecorator<>().decorate(originalDriver);

    WebElement element = decoratedDriver.findElement(By.id("test"));

    Json json = new Json();
    String raw = json.toJson(element);
    Map<String, String> result = json.toType(raw, MAP_TYPE);

    assertThat(result.get(Dialect.W3C.getEncodedElementKey())).isEqualTo(elementId);
  }
}
