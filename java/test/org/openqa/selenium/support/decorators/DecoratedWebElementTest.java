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

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

@Tag("UnitTests")
class DecoratedWebElementTest {

  private static class Fixture {

    WebDriver originalDriver;
    WebDriver decoratedDriver;
    WebElement original;
    WebElement decorated;

    public Fixture() {
      original = mock(WebElement.class);
      originalDriver = mock(WebDriver.class);
      when(originalDriver.findElement(any())).thenReturn(original);
      decoratedDriver = new WebDriverDecorator<>().decorate(originalDriver);
      decorated = decoratedDriver.findElement(By.id("test"));
    }
  }

  @Test
  void canConvertDecoratedToString() {
    Fixture fixture = new Fixture();
    when(fixture.original.toString()).thenReturn("element");
    assertThat(fixture.decorated.toString()).isEqualTo("Decorated {element}");
  }

  private void verifyFunction(Consumer<WebElement> f) {
    Fixture fixture = new Fixture();
    f.accept(fixture.decorated);
    f.accept(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  private <R> void verifyFunction(Function<WebElement, R> f, R result) {
    Fixture fixture = new Fixture();
    when(f.apply(fixture.original)).thenReturn(result);
    assertThat(f.apply(fixture.decorated)).isEqualTo(result);
    R ignore = f.apply(verify(fixture.original, times(1)));
    verifyNoMoreInteractions(fixture.original);
  }

  private <R> void verifyDecoratingFunction(Function<WebElement, R> f, R result, Consumer<R> p) {
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
  void click() {
    verifyFunction(WebElement::click);
  }

  @Test
  void submit() {
    verifyFunction(WebElement::submit);
  }

  @Test
  void sendKeys() {
    verifyFunction($ -> $.sendKeys("test"));
  }

  @Test
  void clear() {
    verifyFunction(WebElement::clear);
  }

  @Test
  void getTagName() {
    verifyFunction(WebElement::getTagName, "div");
  }

  @Test
  void getDomProperty() {
    verifyFunction($ -> $.getDomProperty("color"), "red");
  }

  @Test
  void getDomAttribute() {
    verifyFunction($ -> $.getDomAttribute("color"), "red");
  }

  @Test
  void getAttribute() {
    verifyFunction($ -> $.getAttribute("color"), "red");
  }

  @Test
  void isSelected() {
    verifyFunction(WebElement::isSelected, true);
  }

  @Test
  void isEnabled() {
    verifyFunction(WebElement::isEnabled, true);
  }

  @Test
  void getText() {
    verifyFunction(WebElement::getText, "test");
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

    List<WebElement> decoratedElementList =
        fixture.decoratedDriver.findElement(By.id("list")).findElements(By.id("test"));
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
  void findElement() {
    final WebElement found = mock(WebElement.class);
    verifyDecoratingFunction($ -> $.findElement(By.id("test")), found, WebElement::click);
  }

  @Test
  void findElementNotFound() {
    Fixture fixture = new Fixture();
    when(fixture.original.findElement(any())).thenThrow(NoSuchElementException.class);

    WebElement block = fixture.decoratedDriver.findElement(By.id("block"));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> block.findElement(By.id("test")));
  }

  @Test
  void isDisplayed() {
    verifyFunction(WebElement::isDisplayed, true);
  }

  @Test
  void getLocation() {
    verifyFunction(WebElement::getLocation, new Point(10, 20));
  }

  @Test
  void getSize() {
    verifyFunction(WebElement::getSize, new Dimension(30, 40));
  }

  @Test
  void getRect() {
    verifyFunction(WebElement::getRect, new Rectangle(new Point(10, 20), new Dimension(30, 44)));
  }

  @Test
  void getCssValue() {
    verifyFunction($ -> $.getCssValue("color"), "red");
  }

  @Test
  void getScreenshotAs() {
    verifyFunction($ -> $.getScreenshotAs(OutputType.BASE64), "");
  }
}
