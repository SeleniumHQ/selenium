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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.UnitTests;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import java.util.function.Function;

@Category(UnitTests.class)
public class DecoratedTimeoutsTest {

  private static class Fixture {
    WebDriver originalDriver;
    WebDriver decoratedDriver;
    WebDriver.Options originalOptions;
    WebDriver.Timeouts original;
    WebDriver.Timeouts decorated;

    public Fixture() {
      original = mock(WebDriver.Timeouts.class);
      originalOptions = mock(WebDriver.Options.class);
      originalDriver = mock(WebDriver.class);
      when(originalOptions.timeouts()).thenReturn(original);
      when(originalDriver.manage()).thenReturn(originalOptions);
      decoratedDriver = new WebDriverDecorator().decorate(originalDriver);
      decorated = decoratedDriver.manage().timeouts();
    }
  }

  private void verifyFunction(Consumer<WebDriver.Timeouts> f) {
    Fixture fixture = new Fixture();
    f.accept(fixture.decorated);
    f.accept(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  @Test
  public void implicitlyWaitLegacy() {
    verifyFunction($ -> $.implicitlyWait(10, TimeUnit.SECONDS));
  }

  @Test
  public void implicitlyWait() {
    verifyFunction($ -> $.implicitlyWait(Duration.ofSeconds(10)));
  }

  @Test
  public void setScriptTimeoutLegacy() {
    verifyFunction($ -> $.setScriptTimeout(10, TimeUnit.SECONDS));
  }

  @Test
  public void setScriptTimeout() {
    verifyFunction($ -> $.setScriptTimeout(Duration.ofSeconds(10)));
  }

  @Test
  public void pageLoadTimeoutLegacy() {
    verifyFunction($ -> $.pageLoadTimeout(10, TimeUnit.SECONDS));
  }

  @Test
  public void pageLoadTimeout() {
    verifyFunction($ -> $.pageLoadTimeout(Duration.ofSeconds(10)));
  }
}
