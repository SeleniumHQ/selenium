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

package org.openqa.selenium.support.pagefactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;

@Tag("UnitTests")
class DefaultElementLocatorTest {

  protected ElementLocator newLocator(WebDriver driver, Field field) {
    return new DefaultElementLocator(driver, field);
  }

  @Test
  void shouldDelegateToDriverInstanceToFindElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mock(WebElement.class);

    when(driver.findElement(by)).thenReturn(element);

    ElementLocator locator = newLocator(driver, f);
    WebElement returnedElement = locator.findElement();

    assertThat(returnedElement).isEqualTo(element);
  }

  @Test
  void shouldDelegateToDriverInstanceToFindElementList() throws Exception {
    Field f = Page.class.getDeclaredField("list");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("list");
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(element1, element2);

    when(driver.findElements(by)).thenReturn(list);

    ElementLocator locator = newLocator(driver, f);
    List<WebElement> returnedList = locator.findElements();

    assertThat(returnedList).isEqualTo(list);
  }

  @Test
  void cachedElementShouldBeCached() throws Exception {
    Field f = Page.class.getDeclaredField("cached");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("cached");
    final WebElement element = mock(WebElement.class);

    when(driver.findElement(by)).thenReturn(element);

    ElementLocator locator = newLocator(driver, f);
    locator.findElement();
    locator.findElement();

    verify(driver, times(1)).findElement(by);
  }

  @Test
  void cachedElementListShouldBeCached() throws Exception {
    Field f = Page.class.getDeclaredField("cachedList");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("cachedList");
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(element1, element2);

    when(driver.findElements(by)).thenReturn(list);

    ElementLocator locator = newLocator(driver, f);
    locator.findElements();
    locator.findElements();

    verify(driver, times(1)).findElements(by);
  }

  @Test
  void shouldNotCacheNormalElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mock(WebElement.class);

    when(driver.findElement(by)).thenReturn(element);

    ElementLocator locator = newLocator(driver, f);
    locator.findElement();
    locator.findElement();

    verify(driver, times(2)).findElement(by);
  }

  @Test
  void shouldNotCacheNormalElementList() throws Exception {
    Field f = Page.class.getDeclaredField("list");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("list");
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(element1, element2);

    when(driver.findElements(by)).thenReturn(list);

    ElementLocator locator = newLocator(driver, f);
    locator.findElements();
    locator.findElements();

    verify(driver, times(2)).findElements(by);
  }

  @Test
  void shouldUseFindByAnnotationsWherePossible() throws Exception {
    Field f = Page.class.getDeclaredField("byId");
    final WebDriver driver = mock(WebDriver.class);
    final By by = By.id("foo");
    final WebElement element = mock(WebElement.class);

    when(driver.findElement(by)).thenReturn(element);

    ElementLocator locator = newLocator(driver, f);
    locator.findElement();
  }

  @Test
  void shouldUseFindAllByAnnotationsWherePossible() throws Exception {
    Field f = Page.class.getDeclaredField("listById");
    final WebDriver driver = mock(WebDriver.class);
    final By by = By.id("foo");
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(element1, element2);

    when(driver.findElements(by)).thenReturn(list);

    ElementLocator locator = newLocator(driver, f);
    locator.findElements();
  }

  @Test
  void shouldNotMaskNoSuchElementExceptionIfThrown() throws Exception {
    Field f = Page.class.getDeclaredField("byId");
    final WebDriver driver = mock(WebDriver.class);
    final By by = By.id("foo");

    when(driver.findElement(by)).thenThrow(new NoSuchElementException("Foo"));

    ElementLocator locator = newLocator(driver, f);

    assertThatExceptionOfType(NoSuchElementException.class).isThrownBy(locator::findElement);
  }

  @Test
  void shouldWorkWithCustomAnnotations() {
    final WebDriver driver = mock(WebDriver.class);

    AbstractAnnotations npeAnnotations =
        new AbstractAnnotations() {
          @Override
          public boolean isLookupCached() {
            return false;
          }

          @Override
          public By buildBy() {
            throw new NullPointerException();
          }
        };

    assertThatExceptionOfType(NullPointerException.class)
        .isThrownBy(() -> new DefaultElementLocator(driver, npeAnnotations));
  }

  private static class Page {
    @SuppressWarnings("unused")
    private WebElement first;

    @SuppressWarnings("unused")
    private List<WebElement> list;

    @SuppressWarnings("unused")
    @CacheLookup
    private WebElement cached;

    @SuppressWarnings("unused")
    @CacheLookup
    private List<WebElement> cachedList;

    @SuppressWarnings("unused")
    @FindBy(how = How.ID, using = "foo")
    private WebElement byId;

    @SuppressWarnings("unused")
    @FindBy(how = How.ID, using = "foo")
    private List<WebElement> listById;
  }
}
