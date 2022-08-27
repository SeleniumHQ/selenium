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

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.openqa.selenium.Alert;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;

import java.util.function.Consumer;
import java.util.function.Function;

@Tag("UnitTests")
class DecoratedSwitchToTest {

  private static class Fixture {

    WebDriver originalDriver;
    WebDriver decoratedDriver;
    WebDriver.TargetLocator original;
    WebDriver.TargetLocator decorated;

    public Fixture() {
      original = mock(WebDriver.TargetLocator.class);
      originalDriver = mock(WebDriver.class);
      when(originalDriver.switchTo()).thenReturn(original);
      decoratedDriver = new WebDriverDecorator<>().decorate(originalDriver);
      decorated = decoratedDriver.switchTo();
    }
  }

  private void verifyDecoratingFunction(Function<WebDriver.TargetLocator, WebDriver> f) {
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(fixture.originalDriver);

    WebDriver proxy = f.apply(fixture.decorated);
    assertThat(fixture.originalDriver).isNotSameAs(proxy);
    WebDriver ignore = f.apply(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);

    proxy.quit();
    verify(fixture.originalDriver, times(1)).switchTo();
    verify(fixture.originalDriver, times(1)).quit();
    verifyNoMoreInteractions(fixture.originalDriver);
  }

  private <R> void verifyDecoratingFunction(Function<WebDriver.TargetLocator, R> f, R result,
                                            Consumer<R> p) {
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(result);

    R proxy = f.apply(fixture.decorated);
    assertThat(result).isNotSameAs(proxy);
    verify(fixture.originalDriver, times(1)).switchTo();
    R ignore = f.apply(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);

    p.accept(proxy);
    p.accept(verify(result, times(1)));
    verifyNoMoreInteractions(result);
  }

  @Test
  void window() {
    verifyDecoratingFunction($ -> $.window("test"));
  }

  @Test
  void newWindow() {
    verifyDecoratingFunction($ -> $.newWindow(WindowType.TAB));
  }

  @Test
  void frameByIndex() {
    verifyDecoratingFunction($ -> $.frame(3));
  }

  @Test
  void frameByString() {
    verifyDecoratingFunction($ -> $.frame("test"));
  }

  @Test
  void frameByReference() {
    final WebElement frame = mock(WebElement.class);
    verifyDecoratingFunction($ -> $.frame(frame));
  }

  @Test
  void parentFrame() {
    verifyDecoratingFunction(WebDriver.TargetLocator::parentFrame);
  }

  @Test
  void defaultContent() {
    verifyDecoratingFunction(WebDriver.TargetLocator::defaultContent);
  }

  @Test
  void activeElement() {
    WebElement active = mock(WebElement.class);
    verifyDecoratingFunction(WebDriver.TargetLocator::activeElement, active, WebElement::click);
  }

  @Test
  void alert() {
    Alert alert = mock(Alert.class);
    verifyDecoratingFunction(WebDriver.TargetLocator::alert, alert, Alert::dismiss);
  }
}
