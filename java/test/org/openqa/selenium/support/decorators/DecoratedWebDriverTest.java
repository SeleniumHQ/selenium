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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Function;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Interactive;
import org.openqa.selenium.virtualauthenticator.HasVirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticatorOptions;

@Tag("UnitTests")
class DecoratedWebDriverTest {

  private static class Fixture {

    WebDriver original;
    VirtualAuthenticator originalAuth;
    WebDriver decorated;

    public Fixture() {
      original =
          mock(
              WebDriver.class,
              withSettings()
                  .extraInterfaces(
                      JavascriptExecutor.class, TakesScreenshot.class,
                      Interactive.class, HasVirtualAuthenticator.class));
      originalAuth = mock(VirtualAuthenticator.class);
      decorated = new WebDriverDecorator().decorate(original);
      when(((HasVirtualAuthenticator) original).addVirtualAuthenticator(any()))
          .thenReturn(originalAuth);
    }
  }

  @Test
  void shouldDecorate() {
    Fixture fixture = new Fixture();
    assertThat(fixture.decorated).isNotSameAs(fixture.original);
  }

  @Test
  void canConvertDecoratedToString() {
    Fixture fixture = new Fixture();
    when(fixture.original.toString()).thenReturn("driver");
    assertThat(fixture.decorated.toString()).isEqualTo("Decorated {driver}");
  }

  @Test
  void canCompareDecorated() {
    WebDriver original1 = mock(WebDriver.class);
    WebDriver original2 = mock(WebDriver.class);

    WebDriver decorated1 = new WebDriverDecorator<>().decorate(original1);
    WebDriver decorated2 = new WebDriverDecorator<>().decorate(original1);
    WebDriver decorated3 = new WebDriverDecorator<>().decorate(original2);
    assertThat(decorated1).isEqualTo(decorated2);
    assertThat(decorated1).isNotEqualTo(decorated3);

    assertThat(decorated1).isEqualTo(original1);
    assertThat(decorated1).isNotEqualTo(original2);

    assertThat(decorated1).isNotEqualTo("test");
  }

  @Test
  void testHashCode() {
    WebDriver original = mock(WebDriver.class);
    WebDriver decorated = new WebDriverDecorator<>().decorate(original);
    assertThat(decorated.hashCode()).isEqualTo(original.hashCode());
  }

  private void verifyFunction(Consumer<WebDriver> f) {
    Fixture fixture = new Fixture();
    f.accept(fixture.decorated);
    f.accept(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  private <R> void verifyFunction(Function<WebDriver, R> f, R result) {
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(result);
    assertThat(f.apply(fixture.decorated)).isEqualTo(result);
    R ignore = f.apply(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  private <R> void verifyDecoratingFunction(Function<WebDriver, R> f, R result, Consumer<R> p) {
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
  void get() {
    verifyFunction(d -> d.get("http://selenium.dev/"));
  }

  @Test
  void getCurrentUrl() {
    verifyFunction(WebDriver::getCurrentUrl, "http://selenium2.ru/");
  }

  @Test
  void getTitle() {
    verifyFunction(WebDriver::getTitle, "test");
  }

  @Test
  void getPageSource() {
    verifyFunction(WebDriver::getPageSource, "test");
  }

  @Test
  void findElement() {
    final WebElement found = mock(WebElement.class);
    verifyDecoratingFunction($ -> $.findElement(By.id("test")), found, WebElement::click);
  }

  @Test
  void doesNotCreateTooManyClasses() {
    final WebElement found0 = mock(WebElement.class);
    final WebElement found1 = mock(WebElement.class);
    final WebElement found2 = mock(WebElement.class);
    Function<WebDriver, WebElement> f = $ -> $.findElement(By.id("test"));
    Function<WebDriver, List<WebElement>> f2 = $ -> $.findElements(By.id("test"));
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(found0);
    when(f2.apply(fixture.original)).thenReturn(List.of(found0, found1, found2));

    WebElement proxy0 = f.apply(fixture.decorated);
    WebElement proxy1 = f.apply(fixture.decorated);
    WebElement proxy2 = f.apply(fixture.decorated);

    assertThat(proxy0.getClass()).isSameAs(proxy1.getClass());
    assertThat(proxy1.getClass()).isSameAs(proxy2.getClass());

    List<WebElement> proxies = f2.apply(fixture.decorated);

    assertThat(proxy0.getClass()).isSameAs(proxies.get(0).getClass());
    assertThat(proxy0.getClass()).isSameAs(proxies.get(1).getClass());
    assertThat(proxy0.getClass()).isSameAs(proxies.get(2).getClass());
  }

  @Test
  void doesHitTheCorrectInstance() {
    String uuid0 = UUID.randomUUID().toString();
    String uuid1 = UUID.randomUUID().toString();
    String uuid2 = UUID.randomUUID().toString();
    final WebElement found0 = mock(WebElement.class);
    final WebElement found1 = mock(WebElement.class);
    final WebElement found2 = mock(WebElement.class);
    when(found0.getTagName()).thenReturn(uuid0);
    when(found1.getTagName()).thenReturn(uuid1);
    when(found2.getTagName()).thenReturn(uuid2);

    Fixture fixture = new Fixture();
    Function<WebDriver, List<WebElement>> f = $ -> $.findElements(By.id("test"));

    when(f.apply(fixture.original)).thenReturn(List.of(found0, found1, found2));

    List<WebElement> proxies = f.apply(fixture.decorated);

    assertThat(proxies.get(0).getTagName()).isEqualTo(uuid0);
    assertThat(proxies.get(1).getTagName()).isEqualTo(uuid1);
    assertThat(proxies.get(2).getTagName()).isEqualTo(uuid2);
  }

  @Test
  void findElementNotFound() {
    Fixture fixture = new Fixture();
    when(fixture.original.findElement(any())).thenThrow(NoSuchElementException.class);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> fixture.decorated.findElement(By.id("test")));
  }

  @Test
  void findElements() {
    Fixture fixture = new Fixture();
    WebElement originalElement1 = mock(WebElement.class);
    WebElement originalElement2 = mock(WebElement.class);
    List<WebElement> list = new ArrayList<>();
    list.add(originalElement1);
    list.add(originalElement2);
    when(fixture.original.findElements(By.id("test"))).thenReturn(list);

    List<WebElement> decoratedElementList = fixture.decorated.findElements(By.id("test"));
    assertThat(originalElement1).isNotSameAs(decoratedElementList.get(0));
    assertThat(originalElement2).isNotSameAs(decoratedElementList.get(1));
    verify(fixture.original, times(1)).findElements(By.id("test"));

    decoratedElementList.get(0).isDisplayed();
    decoratedElementList.get(1).click();
    verify(originalElement1, times(1)).isDisplayed();
    verify(originalElement2, times(1)).click();
    verifyNoMoreInteractions(fixture.original);
    verifyNoMoreInteractions(originalElement1);
    verifyNoMoreInteractions(originalElement2);
  }

  @Test
  void close() {
    verifyFunction(WebDriver::close);
  }

  @Test
  void quit() {
    verifyFunction(WebDriver::quit);
  }

  @Test
  void getWindowHandle() {
    verifyFunction(WebDriver::getWindowHandle, "test");
  }

  @Test
  void getWindowHandles() {
    Set<String> handles = Set.of("test");
    verifyFunction(WebDriver::getWindowHandles, handles);
  }

  @Test
  void switchTo() {
    final WebDriver.TargetLocator target = mock(WebDriver.TargetLocator.class);
    verifyDecoratingFunction(WebDriver::switchTo, target, WebDriver.TargetLocator::defaultContent);
  }

  @Test
  void navigate() {
    final WebDriver.Navigation navigation = mock(WebDriver.Navigation.class);
    verifyDecoratingFunction(WebDriver::navigate, navigation, WebDriver.Navigation::refresh);
  }

  @Test
  void manage() {
    final WebDriver.Options options = mock(WebDriver.Options.class);
    verifyDecoratingFunction(WebDriver::manage, options, WebDriver.Options::deleteAllCookies);
  }

  @Test
  void executeScriptThatReturnsAPrimitive() {
    verifyFunction($ -> ((JavascriptExecutor) $).executeScript("..."), 1);
  }

  @Test
  void executeScriptThatReturnsAnElement() {
    WebElement element = mock(WebElement.class);
    verifyDecoratingFunction(
        $ -> (WebElement) ((JavascriptExecutor) $).executeScript("..."),
        element,
        WebElement::click);
  }

  @Test
  void executeAsyncScriptThatReturnsAPrimitive() {
    verifyFunction($ -> ((JavascriptExecutor) $).executeAsyncScript("..."), 1);
  }

  @Test
  void executeAsyncScriptThatReturnsAnElement() {
    WebElement element = mock(WebElement.class);
    verifyDecoratingFunction(
        $ -> (WebElement) ((JavascriptExecutor) $).executeAsyncScript("..."),
        element,
        WebElement::click);
  }

  @Test
  void getScreenshotAs() {
    verifyFunction($ -> ((TakesScreenshot) $).getScreenshotAs(OutputType.BASE64), "");
  }

  @Test
  void perform() {
    verifyFunction($ -> ((Interactive) $).perform(new ArrayList<>()));
  }

  @Test
  void resetInputState() {
    verifyFunction($ -> ((Interactive) $).resetInputState());
  }

  @Test
  void addVirtualAuthenticator() {
    VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions();
    verifyFunction($ -> ((HasVirtualAuthenticator) $).addVirtualAuthenticator(options));
  }

  @Test
  void removeVirtualAuthenticator() {
    VirtualAuthenticator auth = mock(VirtualAuthenticator.class);
    verifyFunction($ -> ((HasVirtualAuthenticator) $).removeVirtualAuthenticator(auth));
  }
}
