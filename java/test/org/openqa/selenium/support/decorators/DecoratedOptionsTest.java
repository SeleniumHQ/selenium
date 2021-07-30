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
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.logging.Logs;
import org.openqa.selenium.testing.UnitTests;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;

@Category(UnitTests.class)
public class DecoratedOptionsTest {

  private static class Fixture {
    WebDriver originalDriver;
    WebDriver decoratedDriver;
    WebDriver.Options original;
    WebDriver.Options decorated;

    public Fixture() {
      original = mock(WebDriver.Options.class);
      originalDriver = mock(WebDriver.class);
      when(originalDriver.manage()).thenReturn(original);
      decoratedDriver = new WebDriverDecorator().decorate(originalDriver);
      decorated = decoratedDriver.manage();
    }
  }

  private void verifyFunction(Consumer<WebDriver.Options> f) {
    Fixture fixture = new Fixture();
    f.accept(fixture.decorated);
    f.accept(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  private <R> void verifyFunction(Function<WebDriver.Options, R> f, R result) {
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(result);
    assertThat(f.apply(fixture.decorated)).isEqualTo(result);
    R ignore = f.apply(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  private <R> void verifyDecoratingFunction(Function<WebDriver.Options, R> f, R result, Consumer<R> p) {
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(result);

    R proxy = f.apply(fixture.decorated);
    assertThat(result).isNotSameAs(proxy);
    R ignore = f.apply(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);

    p.accept(proxy);
    p.accept(verify(result, times(1)));
    verifyNoMoreInteractions(result);
  }

  @Test
  public void addCookie() {
    verifyFunction($ -> $.addCookie(new Cookie("name", "value")));
  }

  @Test
  public void deleteCookieNamed() {
    verifyFunction($ -> $.deleteCookieNamed("test"));
  }

  @Test
  public void deleteCookie() {
    verifyFunction($ -> $.deleteCookie(new Cookie("name", "value")));
  }

  @Test
  public void deleteAllCookies() {
    verifyFunction(WebDriver.Options::deleteAllCookies);
  }

  @Test
  public void getCookies() {
    Set<Cookie> cookies = new HashSet<>();
    cookies.add(new Cookie("name", "value"));
    verifyFunction(WebDriver.Options::getCookies, cookies);
  }

  @Test
  public void getCookieNamed() {
    verifyFunction($ -> $.getCookieNamed("test"), new Cookie("name", "value"));
  }

  @Test
  public void timeouts() {
    WebDriver.Timeouts timeouts = mock(WebDriver.Timeouts.class);
    verifyDecoratingFunction(WebDriver.Options::timeouts, timeouts, t -> t.implicitlyWait(Duration.ofSeconds(10)));
  }

  @Test
  public void imeNotDecorated() {
    final WebDriver.ImeHandler ime = mock(WebDriver.ImeHandler.class);
    verifyFunction(WebDriver.Options::ime, ime);
  }

  @Test
  public void window() {
    final WebDriver.Window window = mock(WebDriver.Window.class);
    verifyDecoratingFunction(WebDriver.Options::window, window, WebDriver.Window::maximize);
  }

  @Test
  public void logsNotDecorated() {
    final Logs logs = mock(Logs.class);
    verifyFunction(WebDriver.Options::logs, logs);
  }

}
