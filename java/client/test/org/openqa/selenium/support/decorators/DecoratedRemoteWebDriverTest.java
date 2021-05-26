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

import com.google.common.collect.ImmutableMap;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.IsRemoteWebDriver;
import org.openqa.selenium.remote.IsRemoteWebElement;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;
import org.openqa.selenium.testing.UnitTests;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.remote.Dialect.OSS;

@Category(UnitTests.class)
public class DecoratedRemoteWebDriverTest {

  @Test
  public void canConvertDecoratedToRemoteWebDriverInterface() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);
    when(originalDriver.getSessionId()).thenReturn(sessionId);

    IsRemoteWebDriver decoratedDriver = (IsRemoteWebDriver) new WebDriverDecorator().decorate(originalDriver);

    assertThat(decoratedDriver.getSessionId()).isEqualTo(sessionId);
  }

  @Test(expected = ClassCastException.class)
  public void cannotConvertDecoratedToRemoteWebDriver() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);
    when(originalDriver.getSessionId()).thenReturn(sessionId);

    RemoteWebDriver decoratedDriver = (RemoteWebDriver) new WebDriverDecorator().decorate(originalDriver);
  }

  @Test
  public void canConvertDecoratedRemoteWebElementToJson() {
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);
    RemoteWebElement originalElement = new RemoteWebElement();
    String elementId = UUID.randomUUID().toString();
    originalElement.setParent(originalDriver);
    originalElement.setId(elementId);

    when(originalDriver.findElement(any())).thenReturn(originalElement);

    WebDriver decoratedDriver = new WebDriverDecorator().decorate(originalDriver);

    WebElement element = decoratedDriver.findElement(By.id("test"));
    WebElementToJsonConverter converter = new WebElementToJsonConverter();
    ImmutableMap<String, String> result = (ImmutableMap<String, String>) converter.apply(element);

    assertThat(result.get(Dialect.OSS.getEncodedElementKey())).isEqualTo(elementId);
  }

}
