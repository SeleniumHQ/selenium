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
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.ui.TickingClock;

import java.lang.reflect.Field;
import java.time.Clock;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Tag("UnitTests")
public class AjaxElementLocatorTest {

  private TickingClock clock = new TickingClock();

  protected ElementLocator newLocator(WebDriver driver, Field field) {
    return new MonkeyedAjaxElementLocator(clock, driver, field, 10);
  }

  @Test
  public void shouldContinueAttemptingToFindElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mock(WebElement.class);

    when(driver.findElement(by))
        .thenThrow(new NoSuchElementException("bar"))
        .thenReturn(element);

    ElementLocator locator = newLocator(driver, f);
    WebElement returnedElement = locator.findElement();

    assertThat(returnedElement).isEqualTo(element);
  }

  @Test
  public void shouldContinueAttemptingToFindElements() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mock(WebElement.class);
    final List<WebElement> elementList = new ArrayList<>();
    elementList.add(element);

    when(driver.findElements(by))
        .thenThrow(new NoSuchElementException("bar"))
        .thenReturn(elementList);

    ElementLocator locator = newLocator(driver, f);
    List<WebElement> returnedList = locator.findElements();

    assertThat(returnedList.get(0)).isEqualTo(element);
  }

  @Test
  public void shouldThrowNoSuchElementExceptionIfElementTakesTooLongToAppear() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");

    when(driver.findElement(by)).thenThrow(new NoSuchElementException("bar"));

    ElementLocator locator = new MonkeyedAjaxElementLocator(clock, driver, f, 2);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(locator::findElement);

    // Look ups:
    // 1. In "isLoaded"
    // 2. Immediately after call of load. (clock is 0)
    // 3. First sleep, then third call.   (clock is 1)
    // 4. Main loop is now over. Final call as we exit to see if we've loaded.
    // The last call guarantees we've called "isLoaded" at least once after a load.
    verify(driver, times(4)).findElement(by);
  }

  @Test
  public void shouldAlwaysDoAtLeastOneAttemptAtFindingTheElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");

    when(driver.findElement(by)).thenThrow(new NoSuchElementException("bar"));

    ElementLocator locator = new MonkeyedAjaxElementLocator(clock, driver, f, 0);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(locator::findElement);

    verify(driver, atLeast(2)).findElement(by);
  }

  @Test
  public void shouldWorkWithCustomAnnotations() {
    final WebDriver driver = mock(WebDriver.class);

    AbstractAnnotations npeAnnotations = new AbstractAnnotations() {
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
        .isThrownBy(() -> new AjaxElementLocator(driver, 5, npeAnnotations));
  }

  private class MonkeyedAjaxElementLocator extends AjaxElementLocator {

    public MonkeyedAjaxElementLocator(Clock clock, WebDriver driver, Field field,
                                      int timeOutInSeconds) {
      super(clock, driver, field, timeOutInSeconds);
    }

    @Override
    protected long sleepFor() {
      clock.sleep(Duration.ofSeconds(1));
      return 0;
    }
  }

  private static class Page {

    @SuppressWarnings("unused")
    private WebElement first;
  }
}
